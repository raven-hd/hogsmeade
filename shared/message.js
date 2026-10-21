/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Модуль генерации BB-кода (НОВАЯ ВЕРСИЯ)
 */

App.Message = {
    
    // ==================== ПОЛУЧЕНИЕ КОНТЕКСТА ШАБЛОНА ====================
    // contextId: 'catalog' | 'delivery_hogsmeade' | 'delivery_hogwarts' | ...
    getTemplateContext: function(template, contextId) {
        var ctx = Object.assign({}, App.Message.getStoredTemplateContext(template, contextId));
        var extras = ctx.optionalFields || {};
        // Keep old notes in the one editable card. Automatic labels are retired.
        if (contextId !== 'catalog') {
            ['note1', 'note2'].forEach(function(id) {
                var field = extras[id];
                if (field?.enabled && !(ctx.cardTemplate || '').includes('{{' + id + '}}')) {
                    ctx.cardTemplate = (ctx.cardTemplate || '') + '{{#' + id + '}}\n\n' + (field.template || '{{' + id + '}}') + '{{/' + id + '}}';
                }
            });
        }
        delete ctx.optionalFields;
        delete ctx.fullPreview;
        delete ctx.pricePlacement;
        return ctx;
    },

    getStoredTemplateContext: function(template, contextId) {
        // Новая структура с contexts
        if (template.contexts && template.contexts[contextId]) {
            return template.contexts[contextId];
        }
        // Missing delivery variants must inherit another delivery, never the catalog.
        if (contextId !== 'catalog' && !template.productCardTemplate) {
            var profile = App.getDeliveryProfiles().find(function (p) { return 'delivery_' + p.id === contextId; });
            var baseId = profile?.userField === 'hogsmeadeId' ? 'delivery_hogsmeade' : 'delivery_hogwarts';
            var base = template.contexts?.[baseId] || template.contexts?.delivery_hogsmeade;
            if (base) return base;
        }
        // Compatibility with older templates; new variants use the appropriate base card.
        return {
            cardTemplate: template.productCardTemplate || (contextId === 'catalog' ? App.Config.DEFAULT_CATALOG_CARD_TEMPLATE : App.Config.DEFAULT_PRODUCT_CARD_TEMPLATE),
            optionalFields: template.optionalFields || {}
        };
    },
    
    // ==================== ГЕНЕРАЦИЯ BB-КОДА КАРТОЧКИ ====================
    generateProductCard: function(template, fieldData, contextId, product) {
        var ctx = App.Message.getTemplateContext(template, contextId || 'catalog');
        var cardTemplate = ctx.cardTemplate || template.productCardTemplate || '';
        
        if (!cardTemplate) return '';
        
        var values = { name: fieldData.name ?? '' };
        (template.fields || []).forEach(function(field) { values[field.id] = field.enabled ? (fieldData[field.id] ?? '') : ''; });
        values.sku = product?.sku || '';
        values.payment = !contextId || contextId === 'catalog' || template.fields?.some(function(f) { return f.id === 'price' && !f.enabled; }) ? '' : App.Message.generatePayment(product, fieldData);
        // Process optional wrappers before inserting values, so product text stays literal.
        var section = /\{\{#([a-zA-Z0-9_-]+)\}\}((?:(?!\{\{[#/])[\s\S])*?)\{\{\/\1\}\}/g;
        var previous;
        do {
            previous = cardTemplate;
            cardTemplate = cardTemplate.replace(section, function(_, id, body) {
                return String(values[id] ?? '').trim() ? body : '';
            });
        } while (cardTemplate !== previous);
        return App.Message.interpolate(cardTemplate, values);
    },

    generatePayment: function(product, fieldData) {
        var data = fieldData || product?.fieldData || {};
        var price = String(data.price ?? '').trim();
        if (!price) return '';
        var account = App.Workspace.getSettings().paymentAccount ?? (App.State.currentShop === 'cafeteria' ? '' : '217');
        return /^\d+$/.test(account) && product?.sku ? '[pay to=' + account + ' comment=' + product.sku + ']' + price + '[/pay]' : price + ' г';
    },

    catalogPriceInRow: function() { return true; },

    catalogRowPayment: function(product) {
        return App.Message.generatePayment(product);
    },

    interpolate: function(text, values) {
        return String(text).replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, function(match, key) { return Object.hasOwn(values, key) ? String(values[key] ?? '') : match; });
    },

    // Compatibility for old profile product blocks: everything is now in PRODUCT.
    generateFieldBBCode: function() { return ''; },

    // ==================== ПОЛУЧЕНИЕ ШАБЛОНА ДОСТАВКИ ====================
    getDeliveryTemplate: function() {
        // Определяем магазин по выбранным товарам
        var selectedProducts = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop && App.State.selectedProducts.indexOf(p.id) > -1;
        });
        var bannerId = App.State.currentShop || 'raven';
        if (selectedProducts.length > 0 && selectedProducts[0].shop) {
            bannerId = selectedProducts[0].shop;
        }
        
        // Берём активный профиль доставки
        var profile = App.getCurrentDeliveryProfile();
        
        return App.Message.deliveryTemplateFor(profile, bannerId);
    },

    deliveryTemplateFor: function(profile, bannerId) {
        if (!profile) {
            console.warn('Профиль доставки не найден, используем fallback');
            return App.Config.DEFAULT_DELIVERY_TEMPLATES.hogwarts.raven;
        }
        
        // Профиль содержит блоки raven/peach
        var shopTemplate = profile[bannerId];
        
        if (!shopTemplate) {
            // Если у профиля нет своих шаблонов — пробуем из DEFAULT_DELIVERY_TEMPLATES
            var fallback = App.Config.DEFAULT_DELIVERY_TEMPLATES[profile.id];
            return (fallback && fallback[bannerId]) || App.Config.DEFAULT_DELIVERY_TEMPLATES.hogwarts.raven;
        }
        
        return shopTemplate;
    },
    
    // ==================== ОБНОВЛЕНИЕ СООБЩЕНИЯ ====================
    update: function() {
        if (App.State.catalogMode === 'catalog') { document.getElementById('output').textContent = App.Message.generateCatalog(); return; }
        var recipient = document.getElementById('recipient').value.trim();
        var recipientId = document.getElementById('recipientId').value.trim();
        var sender = document.getElementById('sender').value.trim();
        var senderId = document.getElementById('senderId').value.trim();
        var note = document.getElementById('note').value.trim();
        
        
        if (App.State.selectedProducts.length === 0) {
            document.getElementById('output').textContent = 'Выберите товары и заполните поля выше';
            return;
        }
        
        var selected = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop && App.State.selectedProducts.indexOf(p.id) > -1;
        });
        
        selected.forEach(function(p, i) {
        });
        
        // Обрабатываем получателя
        var recipientDisplay = '';
        if (recipient) {
            if (recipientId) {
                // Есть сохранённый ID - используем его с кастомным именем
                recipientDisplay = App.Users.getBBCodeWithCustomName(recipientId, recipient);
            } else {
                // Нет ID - пробуем найти в базе по имени
                var userBBCode = App.Users.getBBCode(recipient);
                if (userBBCode) {
                    recipientDisplay = userBBCode;
                } else {
                    // Не найден - используем @имя
                    recipientDisplay = '@' + recipient;
                }
            }
        }
        
        // Обрабатываем отправителя (аналогично)
        var senderDisplay = '';
        if (sender) {
            if (senderId) {
                // Есть сохранённый ID - используем его с кастомным именем
                senderDisplay = App.Users.getBBCodeWithCustomName(senderId, sender);
            } else {
                // Нет ID - пробуем найти в базе по имени
                var senderBBCode = App.Users.getBBCode(sender);
                if (senderBBCode) {
                    senderDisplay = senderBBCode;
                } else {
                    // Не найден - используем @имя
                    senderDisplay = '@' + sender;
                }
            }
        }
        
        // Получаем шаблон доставки
        var msgTemplate = App.Message.getDeliveryTemplate();
        
        var message = '';
        
        // Include the header even without names, keeping its BBCode balanced with the footer.
        if (msgTemplate.header) {
            var header = msgTemplate.header;
            if (!recipientDisplay && !senderDisplay) header = header.replace(/для \{\{RECIPIENT\}\} от \{\{SENDER\}\}/gi, '').replace(/для \{\{RECIPIENT\}\}/gi, '').replace(/от \{\{SENDER\}\}/gi, '');
            else if (!recipientDisplay) header = header.replace(/для \{\{RECIPIENT\}\}\s*/gi, '');
            else if (!senderDisplay) header = header.replace(/\s*от \{\{SENDER\}\}/gi, '');
            message += App.Message.interpolate(header, { RECIPIENT: recipientDisplay, SENDER: senderDisplay });
        }
        if (note && msgTemplate.note) message += App.Message.interpolate(msgTemplate.note, { NOTE: note });

        // Товары
        for (var i = 0; i < selected.length; i++) {
            var product = selected[i];
            var template = App.Templates.getById(product.templateId);
            
            if (!template) {
                document.getElementById('output').textContent = 'Не найден шаблон товара «' + product.name + '». Загрузите нужный шаблон или выберите другой в карточке товара.';
                return;
            }
            
            // Контекст доставки = delivery_<profileId>
            var profile = App.getCurrentDeliveryProfile();
            var contextId = profile ? ('delivery_' + profile.id) : 'delivery_hogsmeade';
            
            var productCard = App.Message.generateProductCard(template, product.fieldData || {}, contextId, product);
            var labelBBCode = App.Message.generateFieldBBCode(template, product.fieldData || {}, 'label', contextId);
            var note1BBCode = App.Message.generateFieldBBCode(template, product.fieldData || {}, 'note1', contextId);
            var note2BBCode = App.Message.generateFieldBBCode(template, product.fieldData || {}, 'note2', contextId);
            
            // Используем productBlock из шаблона
            if (msgTemplate.productBlock) {
                var productBlock = App.Message.interpolate(msgTemplate.productBlock, { PRODUCT: productCard, LABEL: labelBBCode, NOTE1: note1BBCode, NOTE2: note2BBCode });
                message += productBlock;
            } else {
                message += productCard;
                if (labelBBCode) message += '\n\n' + labelBBCode;
                if (note1BBCode) message += '\n\n' + note1BBCode;
                if (note2BBCode) message += '\n\n' + note2BBCode;
            }
            
            // Разделитель между товарами
            if (i < selected.length - 1) {
                message += '\n\n\n\n';
            }
        }
        
        // Подвал
        if (msgTemplate.footer) {
            message += msgTemplate.footer;
        }
        
        document.getElementById('output').textContent = message;
    },
    
    // ==================== ГЕНЕРАЦИЯ КАТАЛОГА (ТАБЛИЦА) ====================
    generateCatalog: function() {
        App.Storage.saveProducts();
        if (App.State.selectedProducts.length === 0) {
            return 'Выберите товары для каталога';
        }
        
        var selected = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop && App.State.selectedProducts.indexOf(p.id) > -1;
        });
        
        var columns = Math.max(1, Math.min(6, parseInt(App.State.catalogColumns) || 4));
        var headerEnabled = App.State.catalogHeaderEnabled !== false;
        
        var catalog = '[center][width=1200][table]';
        
        // Шапка таблицы (если включена)
        if (headerEnabled) {
            var event = (App.State.catalogHeaderEvent || '').trim();
            var title = (App.State.catalogHeaderTitle || '').trim();
            var description = (App.State.catalogHeaderDescription || '').trim();
            
            // Только если хотя бы одно поле заполнено
            if (event || title || description) {
                catalog += '[tr][td colspan=' + columns + ' v=middle h=center][color=#D6B891][size=150][b]\n';
                
                // Всегда добавляем SPECIAL EDITION если есть событие
                if (event) {
                    catalog += '[right][b][size=70][color=#8F714A24][icon]fas fa-crow[/icon]SPECIAL  EDITION[/color][/size][/b]\n';
                    catalog += '[b][size=90][color=#D6B89224][' + event + '][/color][/size][/b][/right]\n';
                }
                
                // Заголовок
                if (title) {
                    catalog += title + '[/b][/size][/color]\n';
                } else {
                    catalog += '[/b][/size][/color]\n';
                }
                
                // Описание (без закрывающих тегов, они уже есть выше)
                if (description) {
                    catalog += description;
                }
                
                catalog += '[/td][/tr]\n';
            }
        }
        
        // Товары в таблице с чередованием цен
        var rows = Math.ceil(selected.length / columns);
        
        for (var row = 0; row < rows; row++) {
            // Строка с товарами
            catalog += '[tr]';
            
            for (var col = 0; col < columns; col++) {
                var index = row * columns + col;
                
                if (index < selected.length) {
                    var product = selected[index];
                    var template = App.Templates.getById(product.templateId);
                    
                    if (template && product.fieldData) {
                        var productCard = App.Message.generateProductCard(template, product.fieldData, 'catalog', product);
                        catalog += '[td][center]\n' + productCard + '\n[/center][/td]';
                    } else {
                        catalog += '[td][center]' + (product.name || 'Товар без данных') + '[/center][/td]';
                    }
                } else {
                    catalog += '[td][/td]';
                }
            }
            
            catalog += '[/tr]\n';
            
            // Строка с ценами сразу после товаров (если есть цены)
            if (selected.slice(row * columns, (row + 1) * columns).some(function(p) { return !!App.Message.catalogRowPayment(p); })) {
                catalog += '[tr]\n';
                
                for (var col = 0; col < columns; col++) {
                    var index = row * columns + col;
                    
                    if (index < selected.length) {
                        var product = selected[index];
                        var priceText = App.Message.catalogRowPayment(product);
                        if (priceText) {
                            catalog += '[tdt=transparent]\n' + priceText + '\n[/tdt]\n';
                        } else {
                            catalog += '[tdt=transparent][/tdt]\n';
                        }
                    } else {
                        catalog += '[tdt=transparent][/tdt]\n';
                    }
                }
                
                catalog += '[/tr]\n';
            }
        }
        
        catalog += '[/table][/width]\n[/center]';
        
        return catalog;
    },
    
    // ==================== КОПИРОВАНИЕ ====================
    copy: async function() {
        var text = document.getElementById('output').textContent;
        if (!App.State.selectedProducts.length) { App.UI.showToast('Сначала выберите товары', true); return; }
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
            else {
                var area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
                var copied = document.execCommand('copy'); area.remove();
                if (!copied) throw new Error('copy');
            }
            App.UI.showToast('Сообщение скопировано');
        } catch (_) { App.UI.showToast('Браузер запретил копирование. Выделите текст сообщения и скопируйте вручную.', true); }
    }

};

function copyMessage() { App.Message.copy(); }

