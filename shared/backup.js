/* Versioned full-shop backup, with compatibility for old assortment arrays. */
App.Backup = {
    assertList: function (value, title) { if (!Array.isArray(value)) throw new Error(title + ': ожидается список'); },
    validateProducts: function (list, filterShop) {
        this.assertList(list, 'товары');
        var ids = new Set();
        return list.map(function (p) {
            if (!p || typeof p.name !== 'string' || !p.name.trim()) throw new Error('товар без названия');
            if (!Number.isSafeInteger(p.id) || ids.has(p.id)) throw new Error('у товаров должны быть уникальные числовые ID');
            ids.add(p.id);
            if (p.templateId != null && !/^[a-zA-Z0-9_-]+$/.test(String(p.templateId))) throw new Error('некорректный ID шаблона');
            if (p.fieldData != null && (typeof p.fieldData !== 'object' || Array.isArray(p.fieldData))) throw new Error('некорректные поля товара');
            var result = Object.assign({}, p, { shop: App.CatalogRouting.resolve(p), fieldData: Object.assign({}, p.fieldData || {}) });
            ['category', 'group', 'collection'].forEach(function (key) { if (result[key] != null && typeof result[key] !== 'string') throw new Error('некорректная группа или коллекция'); });
            if (!result.fieldData.name) result.fieldData.name = result.name;
            return App.migrateProductCategory(result);
        }).filter(function (p) { return !filterShop || p.shop === App.State.currentShop; });
    },
    validateTemplates: function (list) {
        this.assertList(list, 'шаблоны');
        var ids = new Set();
        list.forEach(function (t) {
            if (!t || typeof t.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(t.id) || ids.has(t.id) || typeof t.name !== 'string' || !Array.isArray(t.fields)) throw new Error('некорректный шаблон');
            ids.add(t.id);
            var fields = new Set();
            t.fields.forEach(function (f) {
                if (!f || typeof f.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(f.id) || fields.has(f.id) || typeof f.name !== 'string') throw new Error('некорректное поле шаблона');
                fields.add(f.id);
            });
        });
        return list;
    },
    validateUsers: function (list) {
        this.assertList(list, 'пользователи');
        list.forEach(function (u) { if (!u || typeof u.name !== 'string' || !u.name.trim()) throw new Error('пользователь без имени'); });
        return list;
    },
    validateProfiles: function (list) {
        this.assertList(list, 'профили');
        var ids = new Set();
        list.forEach(function (p) {
            if (!p || typeof p.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(p.id) || ids.has(p.id) || typeof p.name !== 'string' || typeof p.icon !== 'string' || !/^[a-zA-Z0-9_ -]*$/.test(p.icon) || !/^(hogsmeade|hogwarts|gryffindor|ravenclaw|hufflepuff|slytherin)Id$/.test(p.userField)) throw new Error('некорректный профиль доставки');
            ids.add(p.id);
        });
        return list;
    },
    download: function () {
        App.Workspace.saveCatalogSettings();
        App.Storage.saveProducts();
        var data = { format: 'delivery-studio', version: 2, shop: App.State.currentShop, exportedAt: new Date().toISOString(), skuRegistry: App.SKU.registry(), products: App.State.products, templates: App.State.templates, deliveryProfiles: App.State.deliveryProfiles, catalogName: App.State.currentCatalogName, currentDeliveryProfileId: App.State.currentDeliveryProfileId, settings: App.Workspace.getSettings(), users: App.State.users };
        var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        var link = document.createElement('a'); link.href = url; link.download = App.State.currentShop + '-backup-' + new Date().toISOString().slice(0, 10) + '.json'; link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        App.UI.showToast('Сохранены товары, шаблоны, настройки и общая база людей');
    },
    restore: async function (event) { return this.importFile(event, true); },
    importCatalog: async function (event) { return this.importFile(event, false); },
    importFile: async function (event, full) {
        var input = event.target, file = input.files[0]; if (!file) return;
        try {
            var data = JSON.parse(await file.text()), bundle = !Array.isArray(data);
            var catalogPackage = bundle && data.version === 3 && data.kind === 'catalog-package';
            if (bundle && (data.format !== 'delivery-studio' || !(data.version === 2 || catalogPackage))) throw new Error('неизвестный формат резервной копии');
            if (bundle && data.shop !== App.State.currentShop) throw new Error('эта копия относится к другому магазину');
            var source = bundle ? data.products : data;
            var products = this.validateProducts(source, true);
            if (source.length && !products.length) throw new Error('в файле нет товаров этого магазина');
            var templates = bundle ? this.validateTemplates(data.templates) : App.State.templates;
            if (catalogPackage) {
                var importedIds = new Set(templates.map(function (t) { return t.id; }));
                templates = App.State.templates.filter(function (t) { return !importedIds.has(t.id); }).concat(templates);
            }
            templates = App.TemplateLibrary.complete(products, templates);
            var missing = products.filter(function (p) { return !templates.some(function (t) { return t.id === p.templateId; }); });
            if (missing.length) throw new Error('не найдены шаблоны для ' + missing.length + ' товаров. Сначала загрузите старые шаблоны через «шаблоны → загрузить», затем ассортимент');
            if (bundle && !catalogPackage) {
                this.validateProfiles(data.deliveryProfiles);
                if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) throw new Error('некорректные настройки');
                if (data.settings.deliveryDesigns != null) data.settings.deliveryDesigns = App.DeliveryDesigns.validate(data.settings.deliveryDesigns);
            }
            var skuPlan = App.SKU.plan(products, bundle ? data.skuRegistry : null);
            if (!confirm('Заменить каталог магазина «' + App.getCurrentShop().name + '»? Товаров: ' + products.length + (catalogPackage ? '. Нужные шаблоны загрузятся вместе с товарами; настройки магазина сохранятся.' : bundle ? '. Шаблоны и настройки тоже будут восстановлены.' : '. Товары отбираются по сохраненному магазину и проверенным правилам переноса.'))) return;
            var changes = { PRODUCTS: skuPlan.products, TEMPLATES: templates, SKU_REGISTRY: skuPlan.registry };
            if (bundle && !catalogPackage) Object.assign(changes, { TEMPLATES: templates, DELIVERY_PROFILES: data.deliveryProfiles, CATALOG_NAME: String(data.catalogName || ''), CURRENT_DELIVERY_PROFILE: /^[a-zA-Z0-9_-]+$/.test(data.currentDeliveryProfileId || '') ? data.currentDeliveryProfileId : 'hogsmeade' });
            if (full && bundle && !catalogPackage && data.users && confirm('Восстановить также общую базу людей? Она используется всеми магазинами.')) changes.USERS = this.validateUsers(data.users);
            // Roll back the entire import if any browser-storage write fails.
            var old = new Map();
            try {
                Object.keys(changes).forEach(function (key) { var storageKey = App.Config.STORAGE_KEYS[key]; old.set(storageKey, localStorage.getItem(storageKey)); App.Storage.write(key, changes[key]); });
                if (bundle && !catalogPackage) { var key = App.Workspace.settingsKey(); old.set(key, localStorage.getItem(key)); App.Storage.write(key, data.settings); }
            } catch (e) {
                old.forEach(function (value, key) { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); }); throw e;
            }
            location.reload();
        } catch (error) { App.UI.showToast('Импорт отменен: ' + error.message, true); }
        finally { input.value = ''; }
    }
};
