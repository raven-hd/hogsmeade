/* Validated, namespaced browser storage. Legacy keys are read, never removed. */
App.Storage = {
    read: function (name, fallback) {
        var key = App.Config.STORAGE_KEYS[name];
        var value = localStorage.getItem(key);
        if (value === null) {
            var old = App.Config.LEGACY_KEYS[name];
            // A future cafeteria must start empty, not inherit either existing shop.
            if (App.State.currentShop === 'cafeteria' && name !== 'USERS') return structuredClone(fallback);
            value = localStorage.getItem(old);
            if (value === null) return structuredClone(fallback);
        }
        try {
            var data = name === 'CURRENT_DELIVERY_PROFILE' || name === 'CATALOG_NAME' ? value : JSON.parse(value);
            if (Array.isArray(fallback) && !Array.isArray(data)) throw new Error('ожидается список');
            if (fallback && !Array.isArray(fallback) && typeof fallback === 'object' && (!data || Array.isArray(data) || typeof data !== 'object')) throw new Error('ожидается объект');
            if (name === 'PRODUCTS') {
                data = App.Backup.validateProducts(data, true);
                if (localStorage.getItem(key) !== null) App.CatalogRouting.persistRepair(key, value, data);
            }
            if (name === 'TEMPLATES') data = App.Backup.validateTemplates(data);
            if (name === 'USERS') data = App.Backup.validateUsers(data);
            if (name === 'DELIVERY_PROFILES') data = App.Backup.validateProfiles(data);
            // Complete one-time migration only after validation, even for an empty list.
            if (localStorage.getItem(key) === null) App.Storage.write(name, data);
            return data;
        } catch (error) {
            App.UI.showToast('Не удалось прочитать данные: ' + error.message + '. Исходная запись сохранена.', true);
            throw error; // Never replace a damaged catalog with an apparently empty one.
        }
    },
    write: function (name, data) {
        try {
            var serialized = name === 'CATALOG_NAME' || name === 'CURRENT_DELIVERY_PROFILE' ? String(data) : JSON.stringify(data);
            localStorage.setItem(App.Config.STORAGE_KEYS[name] || name, serialized);
            if (App.Cloud) App.Cloud.schedule();
            if (name === 'USERS' && App.UserCloud) App.UserCloud.schedule();
        } catch (error) {
            App.UI.showToast('Не удалось сохранить изменения. Скачайте резервную копию: память браузера может быть заполнена.', true);
            throw error;
        }
    },
    loadProducts: function () { return this.read('PRODUCTS', []); },
    saveProducts: function () { App.SKU.commit(App.State.products); },
    loadUsers: function () { return this.read('USERS', App.Config.DEFAULT_USERS); },
    saveUsers: function () { this.write('USERS', App.State.users); },
    loadTemplates: function () { return this.read('TEMPLATES', []); },
    saveTemplates: function () { this.write('TEMPLATES', App.State.templates); },
    loadCollapsedCategories: function () { return this.read('COLLAPSED', {}); },
    saveCollapsedCategories: function () { this.write('COLLAPSED', App.State.collapsedCategories); },
    loadCollapsedGroups: function () { return this.read('COLLAPSED_GROUPS', {}); },
    saveCollapsedGroups: function () { this.write('COLLAPSED_GROUPS', App.State.collapsedGroups); },
    loadCatalogName: function () { return this.read('CATALOG_NAME', ''); },
    saveCatalogName: function (name) { this.write('CATALOG_NAME', name); App.State.currentCatalogName = name; },
    loadDeliveryProfiles: function () { return this.read('DELIVERY_PROFILES', []); },
    saveDeliveryProfiles: function () { this.write('DELIVERY_PROFILES', App.State.deliveryProfiles); },
    loadCurrentDeliveryProfileId: function () { return this.read('CURRENT_DELIVERY_PROFILE', 'hogsmeade'); },
    saveCurrentDeliveryProfileId: function () { this.write('CURRENT_DELIVERY_PROFILE', App.State.currentDeliveryProfileId); }
};
