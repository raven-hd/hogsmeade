App.Workspace = {
    encodeKey: function (value) { return encodeURIComponent(value).replace(/'/g, '%27'); },
    nextProductId: function () { return Math.max(Date.now(), ...App.State.products.map(function (p) { return p.id + 1; }), ...Object.values(App.SKU.registry().owners).map(function (id) { return Number(id) + 1; })); },
    settingsKey: function () { return 'delivery.v2.' + App.State.currentShop + '.settings'; },
    getSettings: function () {
        try { return JSON.parse(localStorage.getItem(this.settingsKey())) || {}; } catch (_) { return {}; }
    },
    init: function () {
        var shop = App.getCurrentShop();
        App.Workspace.renderDashboardLink();
        App.Workspace.compactToolbar();
        try { localStorage.setItem('delivery.v2.last-shop', shop.id); } catch (_) {}
        document.title = shop.name + ' · мастерская доставок';
        App.Workspace.renderShopHeading(shop);
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
    renderShopHeading: function (shop) {
        var title = document.getElementById('shopTitle');
        title.hidden = false;
        title.className = 'shop-name';
        title.textContent = shop.name;
        var branding = document.getElementById('shopLogoContainer');
        branding.className = 'shop-heading';
        branding.hidden = false;
        branding.replaceChildren(title);
        if (shop.id === 'raven') {
            var subtitle = document.createElement('p');
            subtitle.className = 'shop-subtitle';
            subtitle.textContent = 'оригинальные товары башни воздуха est. 2014';
            branding.appendChild(subtitle);
        }
        var footer = document.querySelector('footer .footer-text');
        var credit = document.createElement('span');
        credit.id = 'shopFooter';
        credit.textContent = '© Blake Cringe Production & Ellington Cockroach Entertainment';
        footer.replaceChildren(credit);
    },
    renderDashboardLink: function () {
        var header = document.querySelector('.workspace-header');
        if (!header) return;
        var link = document.createElement('a');
        link.className = 'back-link';
        link.href = 'https://raven-hd.github.io/dashboard.html';
        link.title = 'общий дашборд';
        link.setAttribute('aria-label', link.title);
        header.setAttribute('role', 'navigation');
        header.setAttribute('aria-label', 'управление магазином');
        var icon = document.createElement('i');
        icon.className = 'fa-solid fa-arrow-left';
        icon.setAttribute('aria-hidden', 'true');
        link.appendChild(icon);
        var previous = header.querySelector('#shopSwitcher, .back-link');
        if (previous) previous.replaceWith(link);
        else header.prepend(link);
    },
    compactToolbar: function () {
        var actions = document.querySelector('.workspace-actions');
        var cloud = document.getElementById('cloudBar');
        if (!actions || !cloud) return;
        actions.appendChild(cloud);
        var save = document.getElementById('cloudSave');
        var icon = document.createElement('i');
        icon.className = 'fa-solid fa-cloud-arrow-up';
        icon.setAttribute('aria-hidden', 'true');
        save.replaceChildren(icon);
        save.title = 'сохранить каталог и шаблоны на github';
        save.setAttribute('aria-label', save.title);
        if (!App.Cloud?.initialized) {
            save.disabled = true;
            document.getElementById('cloudLoad').disabled = true;
        }
    },
    saveCatalogSettings: function () {
        var settings = this.getSettings();
        ['catalogColumns', 'catalogHeaderEnabled', 'catalogHeaderEvent', 'catalogHeaderTitle', 'catalogHeaderDescription'].forEach(function (key) { settings[key] = App.State[key]; });
        App.Storage.write(this.settingsKey(), settings);
    }
};

// The module is loaded after the header markup, before cloud data starts loading.
App.Workspace.renderDashboardLink();
App.Workspace.compactToolbar();
