App.Workspace = {
    encodeKey: function (value) { return encodeURIComponent(value).replace(/'/g, '%27'); },
    nextProductId: function () { return Math.max(Date.now(), ...App.State.products.map(function (p) { return p.id + 1; }), ...Object.values(App.SKU.registry().owners).map(function (id) { return Number(id) + 1; })); },
    settingsKey: function () { return 'delivery.v2.' + App.State.currentShop + '.settings'; },
    getSettings: function () {
        try { return JSON.parse(localStorage.getItem(this.settingsKey())) || {}; } catch (_) { return {}; }
    },
    init: function () {
        var shop = App.getCurrentShop();
        App.Workspace.renderShopSwitcher();
        try { localStorage.setItem('delivery.v2.last-shop', shop.id); } catch (_) {}
        document.title = shop.name + ' · мастерская доставок';
        document.getElementById('shopTitle').textContent = shop.name;
        var logo = document.getElementById('shopLogo');
        var banner = App.getCurrentBanner();
        if (banner.url) { logo.src = banner.url; logo.alt = shop.name; }
        else document.getElementById('shopLogoContainer').hidden = true;
        document.getElementById('shopFooter').textContent = shop.name;
        if (!App.State.templates.length) {
            var accent = App.State.currentShop === 'peach' ? '#A85A73' : '#D6B891';
            var base = App.Config.DEFAULT_PRODUCT_CARD_TEMPLATE.replace(/#D6B891/g, accent);
            var contexts = App.Config.makeDefaultContexts(App.getDeliveryProfiles());
            Object.values(contexts).forEach(function (c) { c.cardTemplate = c.cardTemplate.replace(/#D6B891/g, accent); });
            App.State.templates = [{ id: 'basic', name: 'основная карточка', fields: structuredClone(App.Config.DEFAULT_TEMPLATE_FIELDS), productCardTemplate: base, contexts: contexts }];
            App.Storage.saveTemplates();
        }
        var profile = App.getCurrentDeliveryProfile();
        App.State.currentDeliveryProfileId = profile.id;
        App.State.currentMode = profile.id;
        var settings = this.getSettings();
        ['catalogColumns', 'catalogHeaderEnabled', 'catalogHeaderEvent', 'catalogHeaderTitle', 'catalogHeaderDescription'].forEach(function (key) {
            if (Object.hasOwn(settings, key)) App.State[key] = settings[key];
        });
        document.addEventListener('input', function (e) {
            if (e.target.closest('#catalogSettings')) App.Workspace.saveCatalogSettings();
        });
        document.addEventListener('change', function (e) {
            if (e.target.closest('#catalogSettings')) App.Workspace.saveCatalogSettings();
        });
        // Keep the shared address book up to date in other open shop tabs.
        window.addEventListener('storage', function (e) {
            if (e.key === App.Config.STORAGE_KEYS.USERS) {
                App.State.users = App.Storage.loadUsers(); App.Users.updateDatalist(); App.Users.refreshFieldHints();
            }
        });
    },
    renderShopSwitcher: function () {
        var header = document.querySelector('.workspace-header');
        if (!header) return;
        var nav = document.createElement('nav');
        nav.id = 'shopSwitcher';
        nav.className = 'shop-switcher';
        nav.setAttribute('aria-label', 'магазины');
        ['peach', 'raven', 'cafeteria'].forEach(function(id) {
            var shop = App.Config.SHOPS[id];
            var link = document.createElement('a');
            link.className = 'shop-switcher-link';
            link.dataset.shop = id;
            link.href = new URL(App.Config.SHOP_FOLDERS[id] + '/', App.Config.BASE_URL).href;
            link.title = shop.name;
            link.setAttribute('aria-label', shop.name);
            if (id === App.State.currentShop) {
                link.setAttribute('aria-current', 'page');
                link.addEventListener('click', function(e) { e.preventDefault(); });
            }
            var icon = document.createElement('i');
            icon.className = shop.icon;
            icon.setAttribute('aria-hidden', 'true');
            link.appendChild(icon);
            // Shop emblems can replace the temporary Font Awesome icons independently.
            if (shop.switcherIcon) {
                var image = document.createElement('img');
                image.alt = '';
                image.src = new URL(shop.switcherIcon, App.Config.BASE_URL).href;
                image.addEventListener('load', function() { icon.hidden = true; });
                image.addEventListener('error', function() { image.remove(); icon.hidden = false; });
                link.appendChild(image);
            }
            nav.appendChild(link);
        });
        var previous = header.querySelector('#shopSwitcher, .back-link');
        if (previous) previous.replaceWith(nav);
        else header.prepend(nav);
    },
    saveCatalogSettings: function () {
        var settings = this.getSettings();
        ['catalogColumns', 'catalogHeaderEnabled', 'catalogHeaderEvent', 'catalogHeaderTitle', 'catalogHeaderDescription'].forEach(function (key) { settings[key] = App.State[key]; });
        App.Storage.write(this.settingsKey(), settings);
    }
};
