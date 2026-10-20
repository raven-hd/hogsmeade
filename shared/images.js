/* GitHub upload. Optional device credentials are shared across shops, scoped to a repository,
   and kept outside settings, backups and public documents. Requests go only to api.github.com. */
App.Images = {
    token: '', tokenTarget: '', remembered: false, busy: false,
    config: function () { return Object.assign(App.Config.CLOUD_ENABLED ? { owner: 'raven-hd', repo: 'hogsmeade', branch: 'main', folder: App.Config.SHOP_FOLDERS[App.State.currentShop] + '/images' } : {}, App.Workspace.getSettings().github || {}); },
    credentialTarget: function (cfg) { var c = cfg || this.config(); return (c.owner || '').toLowerCase() + '/' + (c.repo || '').toLowerCase(); },
    credentialKey: function (cfg) { return 'delivery.v2.auth.github.' + this.credentialTarget(cfg); },
    savedToken: function (cfg) {
        try { return localStorage.getItem(this.credentialKey(cfg)) || ''; } catch (_) { return ''; }
    },
    restoreToken: function () {
        this.token = this.savedToken(); this.tokenTarget = this.credentialTarget(); this.remembered = !!this.token;
    },
    saveToken: function (entered, remember, cfg) {
        var target = this.credentialTarget(cfg);
        var token = entered || (this.tokenTarget === target ? this.token : this.savedToken(cfg));
        // Write before updating memory: a storage error must not look like successful remembering.
        if (remember && token) localStorage.setItem(this.credentialKey(cfg), token);
        else localStorage.removeItem(this.credentialKey(cfg));
        this.token = token; this.tokenTarget = target; this.remembered = !!token && remember;
    },
    forgetToken: function () {
        localStorage.removeItem(this.credentialKey());
        this.token = ''; this.tokenTarget = this.credentialTarget(); this.remembered = false;
        App.UserCloud?.schedule(); this.renderCredentialStatus();
    },
    initCredentials: function () {
        this.restoreToken();
        window.addEventListener('storage', function (e) {
            if (e.key === null || e.key === App.Images.credentialKey() || (e.key === App.Workspace.settingsKey() && App.Images.tokenTarget !== App.Images.credentialTarget())) {
                App.Images.restoreToken(); App.Images.renderCredentialStatus(); App.UserCloud?.schedule();
            }
        });
    },
    renderCredentialStatus: function () {
        var overlay = document.getElementById('imageSettings'); if (!overlay) return;
        overlay.querySelector('#ghRemember').checked = this.remembered;
        overlay.querySelector('#ghStatus').textContent = this.token ? this.remembered ? 'токен подключен · сохранен на этом устройстве' : 'токен подключен · только в этой вкладке' : 'токен не подключен';
    },
    openSettings: function () {
        var previous = document.getElementById('imageSettings'); if (previous) previous.remove();
        var c = this.config(), esc = App.UI.escapeHtml;
        var overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'imageSettings';
        overlay.innerHTML = '<section class="modal image-settings" role="dialog" aria-modal="true" aria-labelledby="imageSettingsTitle"><h3 id="imageSettingsTitle">магазин · github</h3><p>каталог и шаблоны сохраняются кнопкой «сохранить на github». картинки можно загружать с компьютера прямо в карточке товара.</p>' +
            '<label>владелец репозитория<input id="ghOwner" autocomplete="off" value="' + esc(c.owner || '') + '" placeholder="имя на github"></label>' +
            '<label>репозиторий<input id="ghRepo" autocomplete="off" value="' + esc(c.repo || '') + '" placeholder="название репозитория"></label>' +
            '<label>ветка<input id="ghBranch" value="' + esc(c.branch || 'main') + '"></label>' +
            '<label>папка изображений<input id="ghFolder" value="' + esc(c.folder || ('images/' + App.State.currentShop)) + '"></label>' +
            '<label>токен доступа<input id="ghToken" type="password" autocomplete="new-password" placeholder="fine-grained token: contents → read and write"></label>' +
            '<label style="display:flex;align-items:center;gap:6px"><input id="ghRemember" type="checkbox" style="width:auto;margin:0;flex:none">запомнить токен на этом устройстве</label>' +
            '<small>с галочкой токен сохраняется в браузере для всех магазинов этого репозитория, без нее — только до перезагрузки вкладки. в резервные копии и файлы github он не попадает. кнопка «отключить токен» удаляет сохраненное подключение.</small>' +
            '<small>нужен доступ contents → read and write. общая база пользователей хранится в shared/users.json репозитория raven-hd/hogsmeade: имена, ID и ссылки форума. после подключения токена ее изменения отправляются автоматически.</small>' +
            '<label>счет магазина для оплаты в каталоге<input id="paymentAccount" inputmode="numeric" value="' + esc(App.Workspace.getSettings().paymentAccount ?? (App.State.currentShop === 'cafeteria' ? '' : '217')) + '"></label>' +
            '<div class="modal-buttons"><button id="ghSave">сохранить</button><button id="ghForget">отключить токен</button><button id="ghClose">закрыть</button></div><p id="ghStatus" role="status"></p></section>';
        document.body.appendChild(overlay);
        overlay.querySelector('#ghClose').onclick = function () { overlay.remove(); };
        this.renderCredentialStatus();
        overlay.querySelector('#ghForget').onclick = function () {
            try { App.Images.forgetToken(); overlay.querySelector('#ghToken').value = ''; overlay.querySelector('#ghStatus').textContent = 'токен отключен и удален с этого устройства'; }
            catch (_) { overlay.querySelector('#ghStatus').textContent = 'не удалось удалить сохраненный токен: проверьте доступ к данным браузера'; }
        };
        overlay.querySelector('#ghSave').onclick = function () {
            var val = function (id) { return overlay.querySelector('#' + id).value.trim(); };
            var cfg = { owner: val('ghOwner'), repo: val('ghRepo'), branch: val('ghBranch'), folder: val('ghFolder').replace(/^\/+|\/+$/g, '') };
            if (!/^[A-Za-z0-9-]+$/.test(cfg.owner) || !/^[A-Za-z0-9_.-]+$/.test(cfg.repo) || !cfg.branch || /(^|\/)\.{1,2}(\/|$)/.test(cfg.folder) || !cfg.folder) { overlay.querySelector('#ghStatus').textContent = 'проверьте владельца, репозиторий, ветку и папку'; return; }
            var account = val('paymentAccount');
            if (account && !/^\d+$/.test(account)) { overlay.querySelector('#ghStatus').textContent = 'номер счета должен состоять из цифр'; return; }
            try { App.Images.saveToken(val('ghToken'), overlay.querySelector('#ghRemember').checked, cfg); }
            catch (_) { overlay.querySelector('#ghStatus').textContent = 'не удалось сохранить подключение: проверьте доступ к данным браузера'; return; }
            var settings = App.Workspace.getSettings(); settings.github = cfg; settings.paymentAccount = account;
            App.Storage.write(App.Workspace.settingsKey(), settings);
            if (App.Cloud && App.Cloud.meta && App.Cloud.meta.target !== App.Cloud.target()) { App.Cloud.meta = null; App.Cloud.conflict = false; }
            overlay.remove(); App.Message.update(); App.UI.showToast('Настройки этого магазина сохранены');
            App.UserCloud?.schedule();
        };
        overlay.querySelector('#ghOwner').focus();
    },
    attachFields: function (template) {
        template.fields.filter(function (f) { return f.enabled && (f.id === 'image' || f.type === 'url'); }).forEach(function (field) {
            var target = document.getElementById('field_' + field.id); if (!target) return;
            var row = document.createElement('div'); row.className = 'image-upload-row';
            var label = document.createElement('label'); label.className = 'file-button'; label.textContent = '↑ загрузить с компьютера';
            var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp,image/gif'; input.hidden = true; label.appendChild(input);
            var status = document.createElement('span'); status.className = 'upload-status'; status.setAttribute('role', 'status');
            row.append(label, status); target.after(row);
            input.onchange = async function () {
                var file = input.files[0]; if (!file) return;
                if (App.Images.busy) { status.textContent = 'дождитесь окончания текущей загрузки'; input.value = ''; return; }
                App.Images.busy = true;
                var save = document.querySelector('#addForm button[onclick="saveProduct()"]'); if (save) save.disabled = true;
                status.textContent = 'загружаем…';
                try {
                    var url = await App.Images.upload(file);
                    if (target.isConnected) { target.value = url; target.dispatchEvent(new Event('input', { bubbles: true })); status.textContent = 'готово · ссылка вставлена'; }
                    else App.UI.showToast('Картинка загружена. Форма была закрыта; ссылка: ' + url, true);
                } catch (e) { status.textContent = e.message; }
                finally { App.Images.busy = false; if (save) save.disabled = false; input.value = ''; }
            };
        });
    },
    upload: async function (file) {
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('поддерживаются png, jpg, webp и gif');
        if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('размер картинки: от 1 байта до 10 мб');
        var cfg = this.config();
        if (!cfg.owner || !cfg.repo || !this.token) throw new Error('сначала откройте «магазин · github» и подключите репозиторий');
        var identity = this.identity();
        var headers = { Authorization: 'Bearer ' + this.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
        var base = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo);
        // A private image would appear here while remaining invisible to forum readers.
        var info = await fetch(base, { headers: headers });
        if (!info.ok) throw new Error(this.errorText(info.status));
        if ((await info.json()).private) throw new Error('для картинок форума нужен публичный репозиторий');
        var bytes = new Uint8Array(await file.arrayBuffer());
        // Verify the file signature, not just its user-supplied MIME type.
        var signature = { 'image/png': bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71, 'image/jpeg': bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255, 'image/gif': String.fromCharCode(...bytes.slice(0, 6)).match(/^GIF8[79]a$/), 'image/webp': String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP' };
        if (!signature[file.type]) throw new Error('файл не соответствует формату изображения');
        var ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[file.type];
        var name = identity.sku + '-' + crypto.randomUUID().slice(0, 8) + '.' + ext;
        var groups = { BK:'bouquets', CV:'flowers', RP:'other', LD:'lollipops', SV:'candles', SR:'syrups', MD:'honey', VZ:'air', BR:'keychains', FC:'fruit-chips', SB:'sweet-bouquets', RV:'other', KF:'menu' };
        var path = cfg.folder.split('/').filter(Boolean).concat(groups[identity.sku.split('-')[0]], name).map(encodeURIComponent).join('/');
        var binary = ''; for (var start = 0; start < bytes.length; start += 32768) binary += String.fromCharCode(...bytes.subarray(start, start + 32768));
        var response = await fetch(base + '/contents/' + path, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify({ message: 'Add ' + App.State.currentShop + ' product image', branch: cfg.branch, content: btoa(binary) }) });
        if (!response.ok) throw new Error(this.errorText(response.status));
        var result = await response.json();
        // Pin the raw URL to the commit: slashes in branch names cannot break the image URL.
        if (!result.commit?.sha) throw new Error('github не вернул адрес загруженной картинки');
        return 'https://raw.githubusercontent.com/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) + '/' + result.commit.sha + '/' + path;
    },
    identity: function () {
        var existing = App.State.products.find(function (p) { return p.id === App.State.editingId; });
        if (existing) return existing;
        if (!App.Products.draftIdentity) {
            var group = document.getElementById('simpleGroup')?.value || '';
            var draft = { id: App.Workspace.nextProductId(), group: group, fieldData: {} };
            var plan = App.SKU.plan(App.State.products.concat(draft));
            // Reserve the uploaded image's code even if this form is later cancelled.
            App.Storage.write('SKU_REGISTRY', plan.registry);
            App.Products.draftIdentity = plan.products[plan.products.length - 1];
        }
        return App.Products.draftIdentity;
    },
    errorText: function (status) {
        return ({ 401: 'токен недействителен или истек', 403: 'нет права contents: write или достигнут лимит github', 404: 'репозиторий или ветка не найдены, либо токен не имеет доступа', 409: 'конфликт записи: повторите загрузку', 422: 'github отклонил файл: проверьте ветку и путь' })[status] || 'ошибка github (' + status + ')';
    }
};
