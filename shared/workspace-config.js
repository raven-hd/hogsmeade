/* One workspace per shop. All shared code is loaded after this configuration. */
(function () {
    'use strict';
    var requested = document.documentElement.dataset.workspace || new URLSearchParams(location.search).get('shop');
    var shops = {
        raven: { id: 'raven', name: 'под крылом Ворона', subtitle: 'товары, коллекции и маленькие поводы для доставки', icon: 'fa-solid fa-crow', switcherIcon: 'shared/assets/shop-raven.png', color: '#d0b48c' },
        peach: { id: 'peach', name: 'rich peach', subtitle: 'цветы, подарки и все, что пора отправить', icon: 'fa-solid fa-leaf', switcherIcon: 'shared/assets/shop-peach.png', color: '#8b2147' },
        cafeteria: { id: 'cafeteria', name: 'кафетерий', subtitle: 'отдельная мастерская для будущего меню', icon: 'fa-solid fa-mug-hot', switcherIcon: 'shared/assets/shop-cafeteria.png', color: '#a56839' }
    };
    App.State.currentShop = Object.hasOwn(shops, requested) ? requested : 'raven';
    App.Config.SHOPS = shops;
    App.Config.SHOP_FOLDERS = { peach: 'rich-peach', raven: 'under-the-raven-wing', cafeteria: 'cafeteria' };
    App.Config.CLOUD_ENABLED = document.documentElement.dataset.cloud === 'true';
    App.Config.BASE_URL = document.baseURI;
    document.documentElement.dataset.shop = App.State.currentShop;
    App.Config.LEGACY_KEYS = Object.assign({}, App.Config.STORAGE_KEYS);
    Object.keys(App.Config.STORAGE_KEYS).forEach(function (name) {
        App.Config.STORAGE_KEYS[name] = name === 'USERS' ? 'delivery.v2.shared.users' : 'delivery.v2.' + App.State.currentShop + '.' + name.toLowerCase();
    });
    App.Config.DEFAULT_DELIVERY_PROFILES.forEach(function (p) {
        p.cafeteria = { header: '[center]доставка для {{RECIPIENT}} от {{SENDER}}\n', note: '[quote]{{NOTE}}[/quote]\n', productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: '[/center]' };
    });
    App.Config.BANNERS.cafeteria = { id: 'cafeteria', name: 'кафетерий', url: '', width: 400 };
})();
