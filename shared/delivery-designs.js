/* A shop-wide delivery design, independent from product cards and forum user IDs. */
App.DeliveryDesigns = {
    draft: null,
    dirtyDraft: false,
    fields: ['header', 'note', 'productBlock', 'footer', 'separator'],
    id: function(prefix) { return prefix + '_' + crypto.randomUUID().replace(/-/g, ''); },
    validId: function(id) { return typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id); },
    variant: function(source) {
        var result = {};
        this.fields.forEach(function(k) {
            var value = source?.[k] ?? (k === 'separator' ? '\n\n\n\n' : '');
            if (typeof value !== 'string' || value.length > 100000) throw new Error('некорректный блок оформления');
            result[k] = value;
        });
        result.notePosition = source?.notePosition || 'before';
        if (!['before', 'after'].includes(result.notePosition)) throw new Error('неверное положение записки');
        return result;
    },
    validate: function(library) {
        if (!library || !Array.isArray(library.items) || !library.items.length || library.items.length > 100) throw new Error('неверный список оформлений доставки');
        var ids = new Set(), self = this;
        var items = library.items.map(function(item) {
            if (!self.validId(item.id) || ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || !item.variants || typeof item.variants !== 'object' || Array.isArray(item.variants)) throw new Error('некорректное оформление доставки');
            ids.add(item.id);
            var entries = Object.entries(item.variants);
            if (entries.length > 100 || entries.some(function(e) { return !self.validId(e[0]) || !e[1] || typeof e[1] !== 'object' || Array.isArray(e[1]); })) throw new Error('неверный форум в оформлении');
            return { id: item.id, name: item.name.trim(), variants: Object.fromEntries(entries.map(function(e) { return [e[0], self.variant(e[1])]; })) };
        });
        if (!ids.has(library.activeId)) throw new Error('не найдено выбранное оформление');
        return { activeId: library.activeId, items: items };
    },
    library: function() {
        var saved = App.Workspace.getSettings().deliveryDesigns;
        if (saved != null) return this.validate(saved);
        // No writes on first open: existing deliveries and cloud baselines stay untouched.
        var variants = Object.fromEntries(App.getDeliveryProfiles().map(function(p) {
            return [p.id, App.DeliveryDesigns.variant(App.Message.baseDeliveryTemplate(p, App.State.currentShop))];
        }));
        return { activeId: 'original', items: [{ id: 'original', name: 'основное', variants: variants }] };
    },
    resolve: function(profile, shop) {
        if (!profile || shop !== App.State.currentShop || App.Workspace.getSettings().deliveryDesigns == null) return null;
        var library = this.library(), design = library.items.find(function(d) { return d.id === library.activeId; });
        return Object.hasOwn(design.variants, profile.id) ? design.variants[profile.id] : null;
    },
    persist: function(library) {
        var settings = App.Workspace.getSettings();
        settings.deliveryDesigns = this.validate(library);
        App.Storage.write(App.Workspace.settingsKey(), settings);
    },
    bar: function(profileId) {
        var library = this.library(), esc = App.UI.escapeHtml;
        var html = '<div class="delivery-design-bar"><label>оформление доставки <select aria-label="оформление доставки" onchange="App.DeliveryDesigns.choose(this.value)">';
        library.items.forEach(function(d) { html += '<option value="' + esc(d.id) + '"' + (d.id === library.activeId ? ' selected' : '') + '>' + esc(d.name) + '</option>'; });
        return html + '</select></label><button type="button" class="catalog-btn" title="редактировать оформление доставки" aria-label="редактировать оформление доставки" onclick="App.DeliveryDesigns.open(\'' + esc(profileId || '') + '\')"><i class="fa-solid fa-pencil" aria-hidden="true"></i></button></div>';
    },
    renderBar: function() {
        this.installCss();
        var fields = document.querySelector('.right-panel .form-fields');
        if (!fields) return;
        var host = document.getElementById('deliveryDesignBar');
        if (!host) { host = document.createElement('div'); host.id = 'deliveryDesignBar'; fields.prepend(host); }
        host.hidden = App.State.catalogMode === 'catalog';
        host.innerHTML = this.bar(App.State.currentDeliveryProfileId);
    },
    refresh: function() {
        this.renderBar();
        if (App.State.templateWizardStep === 3 && App.State.tempTemplate) App.Templates.updateWizardStep();
        App.Message.update();
    },
    choose: function(id) {
        try {
            var library = this.library();
            if (!library.items.some(function(d) { return d.id === id; })) return;
            library.activeId = id; this.persist(library); this.refresh();
        } catch (e) { App.UI.showToast(e.message, true); }
    },
    open: function(profileId) {
        if (this.draft) return;
        this.installCss();
        var library = this.library();
        this.draft = structuredClone(library.items.find(function(d) { return d.id === library.activeId; }));
        var profiles = App.getDeliveryProfiles();
        this.profileId = profiles.some(function(p) { return p.id === profileId; }) ? profileId : App.getCurrentDeliveryProfile().id;
        profiles.forEach(function(p) {
            if (!Object.hasOwn(App.DeliveryDesigns.draft.variants, p.id)) App.DeliveryDesigns.draft.variants[p.id] = App.DeliveryDesigns.variant(App.Message.baseDeliveryTemplate(p, App.State.currentShop));
        });
        this.dirtyDraft = false;
        this.previousFocus = document.activeElement;
        var modal = document.createElement('div');
        modal.id = 'deliveryDesignEditor'; modal.className = 'modal-overlay delivery-design-overlay';
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'deliveryDesignTitle');
        var esc = App.UI.escapeHtml;
        modal.innerHTML = '<div class="modal delivery-design-editor"><h3 id="deliveryDesignTitle">оформление доставки</h3>' +
            '<p class="design-hint">общее для всех товаров этого магазина. изменения вступят в силу после сохранения оформления.</p>' +
            '<div class="design-scroll"><div class="design-columns"><div>' +
            '<label>название оформления<input id="designName" maxlength="120" value="' + esc(this.draft.name) + '" oninput="App.DeliveryDesigns.capture()"></label>' +
            '<label>форум<select id="designForum" onchange="App.DeliveryDesigns.changeForum(this.value)">' + profiles.map(function(p) { return '<option value="' + esc(p.id) + '"' + (p.id === App.DeliveryDesigns.profileId ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label>' +
            '<p class="design-hint">для каждого форума свое оформление. индексы пользователей остаются в профиле форума.</p>' +
            '<label>шапка<textarea id="design_header" rows="5" oninput="App.DeliveryDesigns.capture()"></textarea></label>' +
            '<small>{{RECIPIENT}} — получатель, {{SENDER}} — отправитель. картинку лейбла можно заменить в [img]…[/img].</small>' +
            '<label>оформление записки<textarea id="design_note" rows="3" oninput="App.DeliveryDesigns.capture()"></textarea></label><small>{{NOTE}} — текст записки; пустая записка не выводится.</small>' +
            '<label>положение записки<select id="design_notePosition" onchange="App.DeliveryDesigns.capture()"><option value="before">перед товарами</option><option value="after">после всех товаров</option></select></label>' +
            '<label>завершение сообщения<textarea id="design_footer" rows="2" oninput="App.DeliveryDesigns.capture()"></textarea></label>' +
            '<details><summary>дополнительно: блок товара и разделитель</summary><label>обертка каждой карточки<textarea id="design_productBlock" rows="3" oninput="App.DeliveryDesigns.capture()"></textarea></label><small>{{PRODUCT}} — готовая карточка товара.</small><label>разделитель между товарами<textarea id="design_separator" rows="2" oninput="App.DeliveryDesigns.capture()"></textarea></label></details>' +
            '</div><div><label>предпросмотр BB-кода<textarea id="designPreview" rows="22" readonly></textarea></label><small>пример с двумя товарами. сохранение здесь меняет оформление всего магазина; карточка товара сохраняется отдельно.</small></div></div></div>' +
            '<div class="design-actions"><button type="button" onclick="App.DeliveryDesigns.close()">отмена</button><button type="button" onclick="App.DeliveryDesigns.save(true)">сохранить как новое</button><button type="button" onclick="App.DeliveryDesigns.save(false)">сохранить изменения</button></div></div>';
        document.body.appendChild(modal);
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); App.DeliveryDesigns.close(); }
            if (e.key === 'Tab') {
                var controls = [...modal.querySelectorAll('input,select,textarea,button,summary')].filter(function(el) { return el.getClientRects().length; });
                var first = controls[0], last = controls[controls.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        this.fillVariant(); document.getElementById('designName').focus();
    },
    fillVariant: function() {
        var style = this.draft.variants[this.profileId];
        this.fields.concat('notePosition').forEach(function(k) { document.getElementById('design_' + k).value = style[k]; });
        this.preview();
    },
    capture: function() {
        if (!this.draft) return;
        this.draft.name = document.getElementById('designName').value;
        var style = this.draft.variants[this.profileId];
        this.fields.concat('notePosition').forEach(function(k) { style[k] = document.getElementById('design_' + k).value; });
        this.dirtyDraft = true; this.preview();
    },
    changeForum: function(id) {
        if (!this.draft || !Object.hasOwn(this.draft.variants, id)) return;
        this.profileId = id; this.fillVariant();
    },
    preview: function() {
        var style = this.draft.variants[this.profileId], ctx = 'delivery_' + this.profileId;
        var template = App.State.tempTemplate || App.State.templates[0];
        var data = { name: 'ПРИМЕР ТОВАРА', price: '10' };
        template?.fields.forEach(function(f) { if (f.enabled && !Object.hasOwn(data, f.id)) data[f.id] = f.id === 'image' ? 'https://example.org/product.png' : '[' + f.name + ']'; });
        var card = template ? App.Message.generateProductCard(template, data, ctx, { sku: 'DEMO-001', fieldData: data }) : '[карточка товара]';
        var block = style.productBlock ? App.Message.interpolate(style.productBlock, { PRODUCT: card, LABEL: '', NOTE1: '', NOTE2: '' }) : card;
        document.getElementById('designPreview').value = App.Message.composeDelivery(style, { RECIPIENT: '[mention=000]Получатель[/mention]', SENDER: '[mention=000]Отправитель[/mention]', NOTE: 'Текст записки' }, [block, block]);
    },
    save: function(asNew) {
        this.capture();
        try {
            var library = this.library(), item = structuredClone(this.draft);
            if (asNew) {
                item.id = this.id('design');
                if (library.items.some(function(d) { return d.name === item.name; })) item.name += ' (копия)';
                library.items.push(item);
            } else library.items[library.items.findIndex(function(d) { return d.id === item.id; })] = item;
            library.activeId = item.id;
            this.persist(library); this.close(true); this.refresh();
            App.UI.showToast('оформление сохранено в браузере · отправьте изменения на github кнопкой с облаком');
        } catch (e) { App.UI.showToast(e.message, true); }
    },
    close: function(force) {
        if (this.dirtyDraft && !force && !confirm('закрыть редактор без сохранения оформления?')) return;
        document.getElementById('deliveryDesignEditor')?.remove(); this.draft = null; this.dirtyDraft = false;
        if (this.previousFocus?.isConnected) this.previousFocus.focus();
    },
    exportPackage: function() {
        var library = this.library();
        library.items.forEach(function(d) { App.getDeliveryProfiles().forEach(function(p) {
            if (!Object.hasOwn(d.variants, p.id)) d.variants[p.id] = App.DeliveryDesigns.variant(App.Message.baseDeliveryTemplate(p, App.State.currentShop));
        }); });
        return { format: 'hogsmeade-design-package', version: 1, templates: structuredClone(App.State.templates), deliveryDesigns: library, deliveryProfiles: App.getDeliveryProfiles().map(function(p) { return { id: p.id, name: p.name, icon: p.icon, userField: p.userField }; }) };
    },
    importPackage: function(data) {
        if (data.version !== 1) throw new Error('неизвестная версия оформления');
        var library = this.validate(data.deliveryDesigns), templates = App.Backup.validateTemplates(structuredClone(data.templates));
        var profiles = App.Backup.validateProfiles(structuredClone(data.deliveryProfiles)), currentProfiles = App.getDeliveryProfiles();
        var mapping = new Map(), addedProfiles = [], self = this;
        profiles.forEach(function(p) {
            var existing = currentProfiles.find(function(e) { return e.id === p.id; }), id = p.id;
            if (existing && (existing.userField !== p.userField || existing.name !== p.name)) id = self.id('forum');
            mapping.set(p.id, id);
            if (!existing || id !== p.id) addedProfiles.push({ id: id, name: p.name, icon: p.icon, userField: p.userField });
        });
        library.items.forEach(function(d) {
            d.variants = Object.fromEntries(Object.entries(d.variants).map(function(e) {
                if (!mapping.has(e[0])) throw new Error('в пакете нет профиля форума для оформления');
                return [mapping.get(e[0]), e[1]];
            }));
        });
        templates.forEach(function(t) {
            if (t.contexts) t.contexts = Object.fromEntries(Object.entries(t.contexts).map(function(e) { return [e[0].startsWith('delivery_') && mapping.has(e[0].slice(9)) ? 'delivery_' + mapping.get(e[0].slice(9)) : e[0], e[1]]; }));
            if (App.State.templates.some(function(old) { return old.id === t.id; })) t.id = self.id('template');
        });
        var target = this.library(), active;
        library.items.forEach(function(d) {
            var oldId = d.id;
            d.id = self.id('design'); target.items.push(d);
            if (oldId === library.activeId) active = d.id;
        });
        target.activeId = active; target = this.validate(target);
        if (!confirm('добавить шаблоны (' + templates.length + ') и оформления доставки (' + library.items.length + ')? новое оформление станет текущим; товары и база пользователей сохранятся.')) return;
        var settings = App.Workspace.getSettings(); settings.deliveryDesigns = target;
        var nextTemplates = App.State.templates.concat(templates), nextProfiles = App.State.deliveryProfiles.concat(addedProfiles);
        var writes = [[App.Config.STORAGE_KEYS.TEMPLATES, nextTemplates], [App.Config.STORAGE_KEYS.DELIVERY_PROFILES, nextProfiles], [App.Workspace.settingsKey(), settings]], old = new Map();
        try {
            writes.forEach(function(e) { old.set(e[0], localStorage.getItem(e[0])); App.Storage.write(e[0], e[1]); });
        } catch (error) {
            old.forEach(function(v, k) { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }); throw error;
        }
        App.State.templates = nextTemplates; App.State.deliveryProfiles = nextProfiles;
        App.Templates.updateSelects(); App.Templates.renderList(); App.UI.renderModeButtons(); this.refresh();
        App.UI.showToast('шаблоны и оформление добавлены · сохраните изменения на github');
    },
    installCss: function() {
        if (document.getElementById('deliveryDesignCss')) return;
        var css = document.createElement('style'); css.id = 'deliveryDesignCss';
        css.textContent = '.delivery-design-bar{display:flex;align-items:center;gap:5px;margin:0 0 7px}.delivery-design-bar label{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted);min-width:0}.delivery-design-bar select{width:145px;max-width:38vw;padding:4px;font-size:11px;background:var(--input-bg);color:var(--text);border:1px solid var(--line)}.delivery-design-bar .catalog-btn{width:26px;height:26px;padding:0;display:inline-flex;align-items:center;justify-content:center}.delivery-design-bar i{margin:0}.delivery-design-overlay{z-index:2200}.delivery-design-editor{width:min(940px,96vw);max-width:940px;max-height:92vh;display:flex;flex-direction:column;padding:18px;gap:8px}.design-scroll{overflow:auto;min-height:0}.design-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.delivery-design-editor label{display:block;font-size:12px;color:var(--accent);margin:8px 0 4px}.delivery-design-editor input,.delivery-design-editor select,.delivery-design-editor textarea{display:block;width:100%;padding:7px;margin-top:4px;background:var(--input-bg);color:var(--text);border:1px solid var(--line);box-sizing:border-box}.delivery-design-editor textarea{font-family:Consolas,monospace;font-size:11px;line-height:1.4;resize:vertical}.delivery-design-editor small,.design-hint{font-size:11px;line-height:1.4;color:var(--muted)}.design-actions{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;padding-top:8px;flex-shrink:0}.delivery-design-editor summary{color:var(--accent);font-size:12px;cursor:pointer;margin-top:10px}@media(max-width:639px){.design-columns{grid-template-columns:minmax(0,1fr)}.delivery-design-editor{padding:10px}.delivery-design-bar label{flex-wrap:wrap;gap:3px}}';
        document.head.appendChild(css);
    }
};

// The existing UI owns initialization and forum switches; keep the selector in sync.
(function() {
    ['updateSelects'].forEach(function(key) {
        var original = App.Templates[key];
        App.Templates[key] = function() { var result = original.apply(this, arguments); App.DeliveryDesigns.renderBar(); return result; };
    });
    ['setVersion', 'setGenerationMode', 'renderModeButtons'].forEach(function(key) {
        var original = App.UI[key];
        App.UI[key] = function() { var result = original.apply(this, arguments); App.DeliveryDesigns.renderBar(); return result; };
    });
    window.addEventListener('beforeunload', function(e) { if (App.DeliveryDesigns.dirtyDraft) { e.preventDefault(); e.returnValue = ''; } });
})();
