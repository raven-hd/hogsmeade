/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Конфигурация и глобальное состояние (НОВАЯ ВЕРСИЯ)
 */

// Глобальный namespace приложения
var App = App || {};

// ==================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
App.State = {
    products: [],
    selectedProducts: [],
    editingId: null,
    currentMode: 'hogsmeade',
    collapsedCategories: {},
    collapsedGroups: {},
    currentFormMode: 'simple',
    currentCatalogName: '',
    currentShop: 'raven',
    users: [],
    editingUserIndex: null,
    templates: [],
    editingTemplateId: null,
    tempTemplate: null,
    templateWizardStep: 1,
    userWarnings: {},
    catalogMode: 'delivery',
    catalogColumns: 4,
    catalogHeaderEnabled: true,
    catalogHeaderEvent: '',
    catalogHeaderTitle: '',
    catalogHeaderDescription: '',
    // Профили доставки
    deliveryProfiles: [],          // Пользовательские профили (загружаются из localStorage)
    currentDeliveryProfileId: 'hogsmeade' // ID активного профиля
};

// ==================== КОНСТАНТЫ ====================
App.Config = {
    // Ключи localStorage
    STORAGE_KEYS: {
        PRODUCTS: 'forumProducts',
        SKU_REGISTRY: 'forumSkuRegistry',
        USERS: 'forumUsers',
        TEMPLATES: 'forumTemplates',
        COLLAPSED: 'collapsedCategories',
        CATALOG_NAME: 'currentCatalogName',
        DELIVERY_PROFILES: 'deliveryProfiles',
        CURRENT_DELIVERY_PROFILE: 'currentDeliveryProfile',
        COLLAPSED_GROUPS: 'collapsedGroups'
    },
    
    // Режимы (форумы)
    MODES: [
        { id: 'hogsmeade', name: 'Хогсмид', icon: 'fa-solid fa-tents', userField: 'hogsmeadeId' },
        { id: 'hogwarts', name: 'Хогвартс', icon: 'fa-brands fa-fort-awesome', userField: 'hogwartsId' },
        { id: 'gryffindor', name: 'Гриффиндор', icon: 'fas fa-fire', userField: 'gryffindorId', color: '#740001' },
        { id: 'ravenclaw', name: 'Когтевран', icon: 'fas fa-wind', userField: 'ravenclawId', color: '#0e1a40' },
        { id: 'hufflepuff', name: 'Пуффендуй', icon: 'fas fa-seedling', userField: 'hufflepuffId', color: '#ecb939' },
        { id: 'slytherin', name: 'Слизерин', icon: 'fas fa-water', userField: 'slytherinId', color: '#1a472a' }
    ],
    
    // Баннеры для доставки
    BANNERS: {
        raven: {
            id: 'raven',
            name: 'Под крылом Ворона',
            url: 'https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png',
            width: 600
        },
        peach: {
            id: 'peach',
            name: 'Rich Peach',
            url: 'https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png',
            width: 400
        }
    },
    
    // Магазины
    SHOPS: {
        raven: {
            id: 'raven',
            name: 'Под крылом Ворона',
            icon: 'fa-solid fa-crow',
            color: '#D6B891'
        },
        peach: {
            id: 'peach',
            name: 'Rich Peach',
            icon: 'fa-solid fa-leaf',
            color: '#E8A87C'
        }
    },
    
    // Дефолтные пользователи
    DEFAULT_USERS: [],
    
    // Профили доставки (Хогсмид / Хогвартс) - настраиваемые
    DEFAULT_DELIVERY_PROFILES: [
        {
            id: 'hogsmeade',
            name: 'Хогсмид',
            icon: 'fa-solid fa-tents',
            userField: 'hogsmeadeId',
            raven: {
                header: '[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            },
            peach: {
                header: '[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            }
        },
        {
            id: 'hogwarts',
            name: 'Хогвартс',
            icon: 'fa-brands fa-fort-awesome',
            userField: 'hogwartsId',
            raven: {
                header: '[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            },
            peach: {
                header: '[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            }
        }
    ],
    
    // Стандартные поля для нового шаблона
    DEFAULT_TEMPLATE_FIELDS: [
        { 
            id: 'image', 
            name: 'Изображение', 
            placeholder: 'URL картинки', 
            type: 'url', 
            enabled: true,
            required: false,
            showInCatalog: true,
            showInDelivery: true
        },
        { 
            id: 'productType', 
            name: 'Тип товара', 
            placeholder: 'букет, свеча ароматическая...', 
            type: 'text', 
            enabled: true,
            required: false,
            showInCatalog: false,
            showInDelivery: true
        },
        { 
            id: 'composition', 
            name: 'Состав', 
            placeholder: 'розы, лаванда...', 
            type: 'text', 
            enabled: true,
            required: false,
            showInCatalog: true,
            showInDelivery: true
        },
        { 
            id: 'description', 
            name: 'Описание', 
            placeholder: 'Описание товара...', 
            type: 'textarea', 
            enabled: true,
            required: false,
            showInCatalog: true,
            showInDelivery: true
        },
        { 
            id: 'price', 
            name: 'Цена', 
            placeholder: '45', 
            type: 'number', 
            enabled: true,
            required: false,
            showInCatalog: true,
            showInDelivery: false
        },
        { 
            id: 'label', 
            name: 'Этикетка', 
            placeholder: 'Текст этикетки...', 
            type: 'textarea', 
            enabled: true,
            required: false,
            showInCatalog: false,
            showInDelivery: true
        },
        { 
            id: 'note1', 
            name: 'Примечание 1', 
            placeholder: 'Дополнительная информация...', 
            type: 'textarea', 
            enabled: false,
            required: false,
            showInCatalog: false,
            showInDelivery: true
        },
        { 
            id: 'note2', 
            name: 'Примечание 2', 
            placeholder: 'Дополнительная информация...', 
            type: 'textarea', 
            enabled: false,
            required: false,
            showInCatalog: false,
            showInDelivery: true
        }
    ],
    
    // Дефолтный BB-код карточки товара — используется как основа для всех контекстов
    DEFAULT_PRODUCT_CARD_TEMPLATE: '[center][width=300][img]{{image}}[/img][/width]\n[size=120][b][color=#8f714a]{{productType}}[/color][/b][/size]\n[size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]',
    
    // Дефолтный BB-код для каталога (без типа товара)
    DEFAULT_CATALOG_CARD_TEMPLATE: '[center][width=300][img]{{image}}[/img][/width]\n[size=150][b][color=#D6B891]{{name}}[/color][/b][/size]\n[size=85][color=#A1817E]{{composition}}[/color][/size]\n[color=#D6B891]•[/color]\n{{description}}\n[/center]',
    
    // Дефолтные BB-шаблоны для опциональных полей (используются как образец)
    DEFAULT_FIELD_TEMPLATES: {
        label: '[center][width=450][more=ЭТИКЕТКА][justify]{{label}}[/justify][/more][/width][/center]',
        note1: '[color=#D6B891]•[/color] [size=85][color=#A1817E]\n[b]{{note1}}[/b][/color][/size]',
        note2: '[color=#D6B891]•[/color] [size=85][color=#A1817E]\n{{note2}}[/color][/size]'
    },
    
    // Дефолтная структура контекстов шаблона
    // contexts: { catalog: {...}, delivery_<profileId>: {...} }
    makeDefaultContexts: function(profiles) {
        var ctx = {};
        // Каталог
        ctx['catalog'] = {
            cardTemplate: App.Config.DEFAULT_CATALOG_CARD_TEMPLATE,
            optionalFields: {}
        };
        // Для каждого профиля доставки
        profiles.forEach(function(p) {
            ctx['delivery_' + p.id] = {
                cardTemplate: App.Config.DEFAULT_PRODUCT_CARD_TEMPLATE,
                optionalFields: {
                    label: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.label },
                    note1: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.note1 },
                    note2: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.note2 }
                }
            };
        });
        return ctx;
    },
    
    // Дефолтные шаблоны сообщений доставки
    DEFAULT_DELIVERY_TEMPLATES: {
        hogsmeade: {
            raven: {
                header: '[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            },
            peach: {
                header: '[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][i]{{NOTE}}[/i][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            }
        },
        hogwarts: {
            raven: {
                header: '[center][width=600][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/under-the-raven-wing/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            },
            peach: {
                header: '[center][width=400][img]https://raw.githubusercontent.com/raven-hd/hogsmeade/main/rich-peach/images/branding/delivery-banner.png[/img][/width]\n[width=600]Доставка для {{RECIPIENT}} от {{SENDER}}\n',
                note: '[more=ЗАПИСКА][quote][i]{{NOTE}}[/i][/quote][/more]\n\n',
                productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}',
                footer: '\n[/width][/center]'
            }
        }
    }
};


// ==================== ХЕЛПЕРЫ ====================
App.getCurrentMode = function() {
    return App.Config.MODES.find(function(m) { return m.id === App.State.currentMode; }) || App.Config.MODES[0];
};

App.getModeById = function(id) {
    return App.Config.MODES.find(function(m) { return m.id === id; }) || App.Config.MODES[1];
};

App.isHogsmeadeMode = function() {
    return App.State.currentMode === 'hogsmeade';
};

App.getCurrentBanner = function() {
    return App.Config.BANNERS[App.State.currentShop] || App.Config.BANNERS.raven;
};

App.getCurrentShop = function() {
    return App.Config.SHOPS[App.State.currentShop] || App.Config.SHOPS.raven;
};

// Автоматическое преобразование названия в капс с ёлочками
App.formatProductName = function(name) {
    if (!name) return '';
    var trimmed = name.trim();
    if (!trimmed) return '';
    
    // Убираем существующие кавычки если есть
    trimmed = trimmed.replace(/^[«»"']+|[«»"']+$/g, '');
    
    // Преобразуем в верхний регистр и добавляем ёлочки
    return '«' + trimmed.toUpperCase() + '»';
};

// ==================== ХЕЛПЕРЫ ПРОФИЛЕЙ ДОСТАВКИ ====================
App.getDeliveryProfiles = function() {
    // Объединяем встроенные профили с пользовательскими
    var defaults = App.Config.DEFAULT_DELIVERY_PROFILES;
    var custom = App.State.deliveryProfiles || [];
    // Кастомные с тем же id перезаписывают встроенные
    var result = defaults.map(function(d) {
        var override = custom.find(function(c) { return c.id === d.id; });
        return override ? override : d;
    });
    // Добавляем полностью новые кастомные профили
    custom.forEach(function(c) {
        var exists = result.find(function(r) { return r.id === c.id; });
        if (!exists) result.push(c);
    });
    return result;
};

App.getCurrentDeliveryProfile = function() {
    var profiles = App.getDeliveryProfiles();
    var profile = profiles.find(function(p) { return p.id === App.State.currentDeliveryProfileId; });
    return profile || profiles[0];
};

// Авто-миграция: "Свечи ДСВ" → group: "Свечи", collection: "ДСВ"
App.migrateProductCategory = function(product) {
    if (product.group) return product; // Уже мигрирован
    
    var category = (product.category || '').trim();
    
    // Паттерн "Группа [Коллекция]" или "Группа (Коллекция)"
    var bracketMatch = category.match(/^(.+?)\s*[\[\(](.+?)[\]\)]\s*$/);
    if (bracketMatch) {
        product.group = bracketMatch[1].trim();
        product.collection = bracketMatch[2].trim();
        return product;
    }
    
    // Паттерн "Группа ТЕГ" — первое слово как группа, остальное как коллекция
    // Известные слова-группы (с нормализацией регистра)
    var knownGroups = ['свечи', 'букеты', 'леденцы', 'сиропы', 'воздух', 'крем-мед', 'топпинг'];
    var lowerCat = category.toLowerCase();
    
    for (var i = 0; i < knownGroups.length; i++) {
        var g = knownGroups[i];
        if (lowerCat.startsWith(g)) {
            var rest = category.slice(g.length).trim();
            // Нормализуем название группы: первая заглавная
            var groupName = category.slice(0, g.length);
            groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1).toLowerCase();
            product.group = groupName;
            product.collection = rest || '';
            return product;
        }
    }
    
    // Не распознано — оставляем category как есть, group = category, collection = ''
    product.group = category;
    product.collection = '';
    return product;
};
