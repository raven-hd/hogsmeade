/* One atomic document per shop. The shared forum address book has its own document below. */
App.Cloud = {
    busy: false, suspended: true, initialized: false, conflict: false, externalChange: false,
    meta: null, notice: '', timer: null,
    enabled: function () { return App.Config.CLOUD_ENABLED; },
    folder: function () { return App.Config.SHOP_FOLDERS[App.State.currentShop]; },
    path: function () { return this.folder() + '/data.json'; },
    metaKey: function () { return 'delivery.v2.' + App.State.currentShop + '.cloud'; },
    config: function () { return Object.assign({ owner: 'raven-hd', repo: 'hogsmeade', branch: 'main' }, App.Images.config()); },
    target: function () { var c = this.config(); return c.owner + '/' + c.repo + '/' + c.branch + '/' + this.path(); },
    headers: function () {
        var h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
        if (App.Images.token) h.Authorization = 'Bearer ' + App.Images.token;
        return h;
    },
    base: function () { var c = this.config(); return 'https://api.github.com/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo); },
    url: function () { return this.base() + '/contents/' + this.path().split('/').map(encodeURIComponent).join('/'); },
    settings: function (source) {
        var result = {};
        ['catalogColumns', 'catalogHeaderEnabled', 'catalogHeaderEvent', 'catalogHeaderTitle', 'catalogHeaderDescription', 'paymentAccount'].forEach(function (k) {
            if (Object.hasOwn(source || {}, k)) result[k] = source[k];
        });
        return result;
    },
    normalize: function (data) {
        if (!data || data.format !== 'hogsmeade-shop' || data.version !== 1 || data.shop !== App.State.currentShop) throw new Error('файл относится к другому магазину или имеет неизвестный формат');
        if (!Array.isArray(data.products) || data.products.some(function (p) { return p.shop !== App.State.currentShop; })) throw new Error('в каталоге смешаны магазины');
        var products = App.Backup.validateProducts(data.products, false);
        var templates = App.Backup.validateTemplates(structuredClone(data.templates));
        if (products.some(function (p) { return !templates.some(function (t) { return t.id === p.templateId; }); })) throw new Error('в каталоге отсутствуют нужные шаблоны');
        var profiles = App.Backup.validateProfiles(data.deliveryProfiles || []);
        var plan = App.SKU.plan(products, data.skuRegistry);
        var settings = this.settings(data.settings);
        if (settings.catalogColumns != null && (!Number.isInteger(settings.catalogColumns) || settings.catalogColumns < 1 || settings.catalogColumns > 6)) throw new Error('неверное число колонок');
        ['catalogHeaderEvent', 'catalogHeaderTitle', 'catalogHeaderDescription', 'paymentAccount'].forEach(function (k) { if (settings[k] != null && typeof settings[k] !== 'string') throw new Error('неверные настройки каталога'); });
        if (settings.paymentAccount && !/^\d+$/.test(settings.paymentAccount)) throw new Error('неверный счет магазина');
        return { format: 'hogsmeade-shop', version: 1, shop: data.shop, products: plan.products, templates: templates, deliveryProfiles: profiles, skuRegistry: plan.registry, catalogName: String(data.catalogName || ''), currentDeliveryProfileId: /^[a-zA-Z0-9_-]+$/.test(data.currentDeliveryProfileId || '') ? data.currentDeliveryProfileId : 'hogsmeade', settings: settings };
    },
    snapshot: function () {
        return { format: 'hogsmeade-shop', version: 1, shop: App.State.currentShop, products: structuredClone(App.State.products), templates: structuredClone(App.State.templates), deliveryProfiles: structuredClone(App.State.deliveryProfiles), skuRegistry: App.SKU.registry(), catalogName: App.State.currentCatalogName, currentDeliveryProfileId: App.State.currentDeliveryProfileId, settings: this.settings(App.Workspace.getSettings()) };
    },
    serialize: function (data) {
        function ordered(v) { if (Array.isArray(v)) return v.map(ordered); if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(function (k) { return [k, ordered(v[k])]; })); return v; }
        return JSON.stringify(ordered(data));
    },
    dirty: function () { return !this.meta || this.meta.base !== this.serialize(this.snapshot()); },
    encode: function (s) { var bytes = new TextEncoder().encode(s), text = ''; for (var i = 0; i < bytes.length; i += 32768) text += String.fromCharCode(...bytes.subarray(i, i + 32768)); return btoa(text); },
    decode: function (s) { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(s.replace(/\s/g, '')), function (c) { return c.charCodeAt(0); })); },
    readRemote: async function () {
        var r = await fetch(this.url() + '?ref=' + encodeURIComponent(this.config().branch), { headers: this.headers(), cache: 'no-store', signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw new Error(App.Images.errorText(r.status));
        var file = await r.json();
        if (!file.sha || file.encoding !== 'base64' || typeof file.content !== 'string') throw new Error('github не вернул каталог; файл должен быть меньше 1 мб');
        return { sha: file.sha, data: this.normalize(JSON.parse(this.decode(file.content))) };
    },
    remember: function (data, sha) {
        var meta = { target: this.target(), sha: sha || null, base: this.serialize(data) };
        localStorage.setItem(this.metaKey(), JSON.stringify(meta)); this.meta = meta;
    },
    install: function (data, sha) {
        var previous = new Map(), keys = App.Config.STORAGE_KEYS;
        var changes = { PRODUCTS: data.products, TEMPLATES: data.templates, DELIVERY_PROFILES: data.deliveryProfiles, SKU_REGISTRY: data.skuRegistry, CATALOG_NAME: data.catalogName, CURRENT_DELIVERY_PROFILE: data.currentDeliveryProfileId };
        this.suspended = true;
        try {
            Object.keys(changes).forEach(function (k) { previous.set(keys[k], localStorage.getItem(keys[k])); App.Storage.write(k, changes[k]); });
            var settingsKey = App.Workspace.settingsKey(); previous.set(settingsKey, localStorage.getItem(settingsKey));
            App.Storage.write(settingsKey, Object.assign({}, App.Workspace.getSettings(), data.settings));
            previous.set(this.metaKey(), localStorage.getItem(this.metaKey())); this.remember(data, sha);
        } catch (error) {
            previous.forEach(function (v, k) { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }); throw error;
        } finally { this.suspended = false; }
    },
    bootstrap: async function () {
        if (!this.enabled()) return;
        document.getElementById('cloudBar').hidden = false;
        try { this.meta = JSON.parse(localStorage.getItem(this.metaKey())); } catch (_) { this.meta = null; }
        if (this.meta && this.meta.target !== this.target()) this.meta = null;
        var hasLocal = localStorage.getItem(App.Config.STORAGE_KEYS.PRODUCTS) !== null;
        // Read local state without migrating or initializing UI, so unsaved work can never be overwritten.
        var localBase = null;
        if (hasLocal) {
            try {
                var read = function (name, fallback) { var v = localStorage.getItem(App.Config.STORAGE_KEYS[name]); return v === null ? fallback : JSON.parse(v); };
                localBase = this.serialize({ format: 'hogsmeade-shop', version: 1, shop: App.State.currentShop, products: read('PRODUCTS', []), templates: read('TEMPLATES', []), deliveryProfiles: read('DELIVERY_PROFILES', []), skuRegistry: App.SKU.registry(), catalogName: localStorage.getItem(App.Config.STORAGE_KEYS.CATALOG_NAME) || '', currentDeliveryProfileId: localStorage.getItem(App.Config.STORAGE_KEYS.CURRENT_DELIVERY_PROFILE) || 'hogsmeade', settings: this.settings(App.Workspace.getSettings()) });
            } catch (_) { this.notice = 'локальные данные требуют проверки'; return; }
        }
        try {
            var remote = await this.readRemote(), remoteBase = this.serialize(remote.data);
            if (!hasLocal || (this.meta && this.meta.base === localBase)) this.install(remote.data, remote.sha);
            else if (remoteBase === localBase) this.remember(remote.data, remote.sha);
            else if (this.meta && this.meta.sha !== remote.sha) { this.conflict = true; this.notice = 'на github есть другая версия · локальные правки сохранены'; }
            else this.notice = 'локальные правки · сохраните на github';
        } catch (error) {
            if (!hasLocal) {
                try {
                    var r = await fetch(new URL(this.path(), App.Config.BASE_URL), { cache: 'no-store' });
                    if (!r.ok) throw new Error('нет копии');
                    this.install(this.normalize(await r.json()), null);
                } catch (_) { this.notice = 'каталог недоступен · можно восстановить резервную копию'; return; }
            }
            this.notice = 'работаем с локальной копией · github недоступен';
        }
    },
    watch: function () {
        if (!this.enabled()) return;
        this.initialized = true; this.suspended = false;
        var self = this;
        window.addEventListener('beforeunload', function (e) { if (self.dirty()) { e.preventDefault(); e.returnValue = ''; } });
        window.addEventListener('storage', function (e) {
            if (e.key && (e.key === self.metaKey() || [App.Config.STORAGE_KEYS.PRODUCTS, App.Config.STORAGE_KEYS.TEMPLATES, App.Config.STORAGE_KEYS.SKU_REGISTRY, App.Workspace.settingsKey()].includes(e.key))) {
                self.externalChange = true; self.notice = 'этот магазин изменен в другой вкладке · обновите страницу'; self.render();
            }
        });
        document.addEventListener('input', function () { self.schedule(); });
        document.addEventListener('change', function () { self.schedule(); });
        this.render();
    },
    schedule: function () {
        if (!this.enabled() || !this.initialized || this.suspended) return;
        clearTimeout(this.timer); var self = this; this.timer = setTimeout(function () { self.notice = ''; self.render(); }, 80);
    },
    render: function () {
        if (!this.enabled()) return;
        var dirty = this.dirty(), text = this.notice || (this.externalChange ? 'магазин изменен в другой вкладке · обновите страницу' : this.conflict ? 'конфликт версий · сначала загрузите актуальную копию' : dirty ? 'есть изменения только в этом браузере' : this.meta?.sha ? 'сохранено на github' : 'локальная копия · github пока не подключен');
        document.getElementById('cloudStatus').textContent = text;
        document.getElementById('cloudStatus').dataset.dirty = String(dirty || this.conflict || this.externalChange);
        document.getElementById('cloudSave').disabled = this.busy || this.conflict || this.externalChange || (!dirty && !!this.meta?.sha);
        document.getElementById('cloudLoad').disabled = this.busy;
    },
    save: async function () {
        if (!this.initialized || this.busy || this.conflict || this.externalChange) return;
        if (!App.Images.token) { App.Images.openSettings(); return; }
        this.busy = true; this.notice = 'сохраняем на github…'; this.render();
        try {
            App.Workspace.saveCatalogSettings(); App.Storage.saveProducts();
            var data = this.normalize(this.snapshot()), sha = this.meta?.target === this.target() ? this.meta.sha : null;
            if (!sha) {
                var remote = await this.readRemote();
                if (this.serialize(remote.data) !== this.serialize(data)) throw new Error('сначала загрузите актуальную копию с github; локальную работу можно сохранить полной резервной копией');
                sha = remote.sha;
            }
            // Use the SHA of the version actually loaded, never the latest SHA fetched just before overwriting.
            var response = await fetch(this.url(), { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()), body: JSON.stringify({ message: 'Update ' + this.folder() + ' catalog', branch: this.config().branch, sha: sha, content: this.encode(JSON.stringify(data, null, 2)) }), signal: AbortSignal.timeout(30000) });
            if (response.status === 409 || response.status === 422) { this.conflict = true; throw new Error('версия на github изменилась; локальные правки сохранены. скачайте резервную копию и загрузите актуальный каталог'); }
            if (!response.ok) throw new Error(App.Images.errorText(response.status));
            var result = await response.json(); if (!result.content?.sha) throw new Error('не получено подтверждение сохранения; проверьте github перед повтором');
            this.remember(data, result.content.sha); this.notice = ''; App.UI.showToast('каталог и шаблоны сохранены на github');
        } catch (error) { this.notice = error.message; App.UI.showToast(error.message, true); }
        finally { this.busy = false; this.render(); }
    },
    load: async function () {
        if (this.busy) return;
        if (this.dirty() && !confirm('локальные правки будут заменены версией с github. перед продолжением скачайте полную резервную копию. загрузить?')) return;
        this.busy = true; this.notice = 'загружаем с github…'; this.render();
        try {
            var remote = await this.readRemote();
            localStorage.setItem('delivery.v2.recovery.cloud.' + App.State.currentShop, JSON.stringify(this.snapshot()));
            this.install(remote.data, remote.sha); location.reload();
        } catch (error) { this.notice = error.message; App.UI.showToast(error.message, true); }
        finally { this.busy = false; this.render(); }
    }
};

/* Shared across shops and devices. Reads need no token; writes use the image-upload token.
   A three-way merge combines different records. Conflicting edits keep the local draft. */
App.UserCloud = {
    initialized: false, busy: false, conflict: false, notice: '', meta: null, timer: null,
    metaKey: 'delivery.v2.shared.users.cloud',
    recoveryKey: 'delivery.v2.recovery.users',
    url: 'https://api.github.com/repos/raven-hd/hogsmeade/contents/shared/users.json',
    enabled: function () { return App.Config.CLOUD_ENABLED; },
    exclusive: function (action) {
        // Other shop tabs share localStorage. Serialize baseline changes across those tabs.
        return navigator.locks ? navigator.locks.request('hogsmeade-shared-users', action) : action();
    },
    normalize: function (users) {
        App.Backup.validateUsers(users);
        var names = new Set();
        return users.map(function (u) {
            var out = {}, key = u.name.trim().toLowerCase();
            if (names.has(key)) throw new Error('в базе повторяется имя пользователя');
            names.add(key);
            ['name', 'hogsmeadeId', 'hogwartsId', 'gryffindorId', 'ravenclawId', 'hufflepuffId', 'slytherinId', 'addrHogsmeade', 'addrHogwarts'].forEach(function (field) {
                if (u[field] != null && typeof u[field] !== 'string') throw new Error('неверное поле пользователя');
                out[field] = (u[field] || '').trim();
            });
            return out;
        });
    },
    parse: function (data) {
        if (data?.format !== 'hogsmeade-users' || data.version !== 1) throw new Error('неизвестный формат общей базы');
        return this.normalize(data.users);
    },
    local: function () { return this.normalize(App.Storage.loadUsers()); },
    equal: function (a, b) { return App.Cloud.serialize(a) === App.Cloud.serialize(b); },
    dirty: function () { return !this.meta || !this.equal(this.local(), this.meta.base); },
    readMeta: function () {
        try {
            var m = JSON.parse(localStorage.getItem(this.metaKey));
            this.meta = m && m.url === this.url ? { url: this.url, sha: m.sha || null, base: this.normalize(m.base) } : null;
        } catch (_) { this.meta = null; }
    },
    merge: function (base, local, remote) {
        var map = function (list) { return new Map((list || []).map(function (u) { return [u.name.toLowerCase(), u]; })); };
        var b = map(base), l = map(local), r = map(remote), self = this;
        // Remote order stays stable; new local records are appended.
        var keys = new Set([...r.keys(), ...l.keys(), ...b.keys()]), merged = [];
        keys.forEach(function (key) {
            var before = b.get(key), here = l.get(key), there = r.get(key), result;
            if (self.equal(here, there)) result = here;
            else if (base !== null && self.equal(here, before)) result = there;
            else if (base !== null && self.equal(there, before)) result = here;
            else if (base === null && !here) result = there;
            else if (base === null && !there) result = here;
            else throw new Error('одна запись изменена на двух устройствах · локальная база сохранена');
            if (result) merged.push(result);
        });
        return merged;
    },
    readRemote: async function () {
        var response = await fetch(this.url + '?ref=main', { headers: App.Cloud.headers(), cache: 'no-store', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(response.status === 404 ? 'общая база на github еще не создана или нет доступа' : App.Images.errorText(response.status));
        var file = await response.json();
        if (!file.sha || file.encoding !== 'base64' || typeof file.content !== 'string') throw new Error('github не вернул общую базу');
        return { sha: file.sha, users: this.parse(JSON.parse(App.Cloud.decode(file.content))) };
    },
    install: function (users, remote) {
        var key = App.Config.STORAGE_KEYS.USERS, oldUsers = localStorage.getItem(key), oldMeta = localStorage.getItem(this.metaKey);
        var meta = { url: this.url, sha: remote.sha || null, base: remote.users };
        try {
            localStorage.setItem(key, JSON.stringify(users));
            localStorage.setItem(this.metaKey, JSON.stringify(meta));
        } catch (error) {
            if (oldUsers === null) localStorage.removeItem(key); else localStorage.setItem(key, oldUsers);
            if (oldMeta === null) localStorage.removeItem(this.metaKey); else localStorage.setItem(this.metaKey, oldMeta);
            throw error;
        }
        this.meta = meta;
        if (this.initialized) this.refresh();
    },
    refresh: function () {
        var editing = App.State.editingUserIndex == null ? null : App.State.users[App.State.editingUserIndex]?.name;
        App.State.users = this.local();
        if (editing) {
            var index = App.State.users.findIndex(function (u) { return u.name === editing; });
            if (index < 0) App.Users.cancelEdit(); else App.State.editingUserIndex = index;
        }
        App.Users.updateDatalist(); App.Users.renderList(); App.Users.refreshFieldHints(); App.Message.update();
    },
    reconcile: function (remote) {
        this.readMeta();
        var merged;
        try { merged = this.merge(this.meta ? this.meta.base : null, this.local(), remote.users); }
        catch (error) { this.conflict = true; throw error; }
        this.install(merged, remote); this.conflict = false;
    },
    bootstrap: function () { var self = this; return this.exclusive(function () { return self.bootstrapLocked(); }); },
    bootstrapLocked: async function () {
        if (!this.enabled()) return;
        this.readMeta();
        try { this.reconcile(await this.readRemote()); }
        catch (error) {
            if (this.conflict) { this.notice = error.message; return; }
            try {
                var response = await fetch(new URL('shared/users.json', App.Config.BASE_URL), { cache: 'no-store' });
                if (!response.ok) throw new Error('нет копии');
                var users = this.parse(await response.json());
                // A deployed Pages copy can lag behind the API: never replace a known baseline with it.
                if (!this.meta) this.reconcile({ sha: null, users: users });
            } catch (fallbackError) { if (this.conflict) this.notice = fallbackError.message; }
            if (!this.notice) this.notice = 'github недоступен · база сохранена в браузере';
        }
    },
    watch: function () {
        if (!this.enabled()) return;
        this.initialized = true;
        var modal = document.querySelector('#usersModal .modal'), self = this;
        var bar = document.createElement('div'); bar.className = 'cloud-bar'; bar.style.cssText = 'margin:0 0 10px;flex-wrap:wrap';
        bar.innerHTML = '<span id="usersCloudStatus" role="status" style="flex:1;min-width:160px"></span><button type="button" id="usersCloudSave" title="сохранить общую базу на github"><i class="fa-solid fa-cloud-arrow-up"></i></button><button type="button" id="usersCloudLoad" title="обновить базу с github"><i class="fa-solid fa-arrows-rotate"></i></button>';
        modal.querySelector('h3').after(bar);
        document.getElementById('usersCloudSave').onclick = function () { self.save(); };
        document.getElementById('usersCloudLoad').onclick = function () { self.load(); };
        window.addEventListener('beforeunload', function (e) { if (self.dirty()) { e.preventDefault(); e.returnValue = ''; } });
        window.addEventListener('online', function () { self.schedule(); });
        window.addEventListener('storage', function (e) {
            if (e.key === self.metaKey || e.key === App.Config.STORAGE_KEYS.USERS) {
                self.readMeta(); self.refresh(); self.schedule();
            }
        });
        this.schedule();
    },
    render: function () {
        if (!this.initialized) return;
        var dirty = this.dirty();
        document.getElementById('usersCloudStatus').textContent = this.notice || (this.conflict ? 'конфликт записей · локальная база сохранена' : dirty ? App.Images.token ? 'изменения ожидают отправки на github' : 'изменения в браузере · подключите токен github' : this.meta?.sha ? 'общая база · сохранено на github' : 'общая база · загружена копия сайта');
        document.getElementById('usersCloudSave').disabled = this.busy || this.conflict || !dirty;
        document.getElementById('usersCloudLoad').disabled = this.busy;
    },
    schedule: function () {
        if (!this.enabled() || !this.initialized) return;
        clearTimeout(this.timer); this.notice = ''; this.render();
        var self = this;
        if (App.Images.token && !this.busy && !this.conflict && this.dirty()) this.timer = setTimeout(function () { self.save(); }, 1000);
    },
    save: function () { var self = this; return this.exclusive(function () { return self.saveLocked(); }); },
    saveLocked: async function () {
        if (!this.initialized || this.busy || this.conflict) return;
        if (!App.Images.token) { App.Images.openSettings(); return; }
        this.busy = true; this.notice = 'сохраняем общую базу…'; this.render();
        var success = false;
        try {
            // Read + merge first, then compare-and-swap the exact version we read.
            for (var attempt = 0; attempt < 3; attempt++) {
                var remote = await this.readRemote(); this.reconcile(remote);
                var users = this.local();
                if (this.equal(users, remote.users)) { success = true; break; }
                var response = await fetch(this.url, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, App.Cloud.headers()), body: JSON.stringify({ message: 'Update shared forum users', branch: 'main', sha: remote.sha, content: App.Cloud.encode(JSON.stringify({ format: 'hogsmeade-users', version: 1, users: users }, null, 2) + '\n') }), signal: AbortSignal.timeout(30000) });
                if (response.status === 409) continue;
                if (!response.ok) throw new Error(App.Images.errorText(response.status));
                var result = await response.json();
                if (!result.content?.sha) throw new Error('не получено подтверждение сохранения базы');
                // Edits made during the request stay dirty and are sent in the next batch.
                this.install(this.local(), { sha: result.content.sha, users: users }); success = true; break;
            }
            if (!success) throw new Error('база меняется в другой вкладке · повторите сохранение');
            this.notice = '';
        } catch (error) { this.notice = error.message; App.UI.showToast('база пользователей: ' + error.message, true); }
        finally { this.busy = false; this.render(); if (success) this.schedule(); }
    },
    load: function () { var self = this; return this.exclusive(function () { return self.loadLocked(); }); },
    loadLocked: async function () {
        if (this.busy) return;
        if (this.conflict && !confirm('сначала скачайте локальную базу кнопкой «скачать». загрузить версию github? локальная копия также останется в резерве браузера.')) return;
        var replace = this.conflict;
        this.busy = true; this.notice = 'обновляем общую базу…'; this.render();
        try {
            var remote = await this.readRemote();
            if (replace) {
                localStorage.setItem(this.recoveryKey, JSON.stringify(this.local()));
                this.install(remote.users, remote); this.conflict = false;
            } else this.reconcile(remote);
            this.notice = '';
        } catch (error) { this.notice = error.message; App.UI.showToast('база пользователей: ' + error.message, true); }
        finally { this.busy = false; this.render(); if (!this.notice) this.schedule(); }
    }
};
