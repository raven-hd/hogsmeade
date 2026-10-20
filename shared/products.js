/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Модуль работы с товарами (НОВАЯ ВЕРСИЯ)
 */

App.Products = {
    
    // ==================== РЕНДЕРИНГ СПИСКА ====================
    render: function() {
        // Фильтруем товары по текущему магазину
        var query = (document.getElementById('productSearch')?.value || '').trim().toLocaleLowerCase('ru');
        var codeQuery = App.SKU.normalizeSearch(query);
        var filteredProducts = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop && (!query ||
                [p.name, p.group, p.collection, p.category, p.sku].join(' ').toLocaleLowerCase('ru').includes(query) ||
                App.SKU.normalizeSearch(p.sku).includes(codeQuery));
        });

        // Группируем: group → collection → items
        var grouped = Object.create(null); // { groupName: { collectionName: [products] } }
        filteredProducts.forEach(function(p) {
            var g = p.group || p.category || '';
            var c = p.collection || '';
            if (!grouped[g]) grouped[g] = Object.create(null);
            if (!grouped[g][c]) grouped[g][c] = [];
            grouped[g][c].push(p);
        });
        
        var html = '';
        var groupNames = Object.keys(grouped);
        
        for (var gi = 0; gi < groupNames.length; gi++) {
            var groupName = groupNames[gi];
            var collections = grouped[groupName];
            var collectionNames = Object.keys(collections);
            var hasCollections = collectionNames.length > 1 || (collectionNames.length === 1 && collectionNames[0] !== '');
            
            // Считаем общее число товаров в группе
            var totalGroupCount = 0;
            collectionNames.forEach(function(cn) { totalGroupCount += collections[cn].length; });
            
            var isGroupCollapsed = !query && (App.State.collapsedGroups[groupName] || false);
            var escapedGroup = App.UI.escapeHtml(groupName);
            
            if (hasCollections) {
                // Рендерим группу-обёртку
                html += '<div class="group-wrapper">' +
                    '<div class="group-header" onclick="App.Products.toggleGroup(decodeURIComponent(\'' + App.Workspace.encodeKey(groupName) + '\'))">' +
                        '<i class="fa-solid fa-layer-group"></i> ' +
                        '<span class="group-title">' + escapedGroup + '</span>' +
                        ' <span class="category-count">' + totalGroupCount + '</span>' +
                        '<i class="fa-solid fa-chevron-down group-chevron' + (isGroupCollapsed ? ' collapsed' : '') + '"></i>' +
                    '</div>' +
                    '<div class="group-collections' + (isGroupCollapsed ? ' collapsed' : '') + '">';
                
                for (var ci = 0; ci < collectionNames.length; ci++) {
                    var collName = collectionNames[ci];
                    var items = collections[collName];
                    var categoryKey = groupName + '|||' + collName;
                    var isCollapsed = !query && (App.State.collapsedCategories[categoryKey] || false);
                    var itemCount = items.length;
                    var displayName = collName ? collName : groupName;
                    var escapedCatKey = App.UI.escapeHtml(categoryKey);
                    
                    html += '<div class="category-group collection-group">' +
                        '<div class="category-header">' +
                            '<div class="category-title ' + (isCollapsed ? 'collapsed' : '') + '" onclick="App.Products.toggleCategory(decodeURIComponent(\'' + App.Workspace.encodeKey(categoryKey) + '\'))">' +
                                '<i class="fa-solid fa-chevron-down"></i> ' +
                                App.UI.escapeHtml(displayName) +
                                ' <span class="category-count">' + itemCount + '</span>' +
                            '</div>' +
                            '<button type="button" class="random-btn" onclick="App.Products.selectRandomFromKey(decodeURIComponent(\'' + App.Workspace.encodeKey(categoryKey) + '\')); event.stopPropagation()" title="Выбрать случайный товар">' +
                                '<i class="fa-solid fa-dice"></i>' +
                            '</button>' +
                        '</div>' +
                        '<div class="category-items ' + (isCollapsed ? 'collapsed' : '') + '">';
                    
                    html += App.Products._renderItems(items);
                    html += '</div></div>';
                }
                
                html += '</div></div>';
            } else {
                // Нет коллекций — обычная категория
                var collName = collectionNames[0] || '';
                var items = collections[collName];
                var categoryKey = groupName + '|||' + collName;
                var isCollapsed = !query && (App.State.collapsedCategories[groupName] || App.State.collapsedCategories[categoryKey] || false);
                var itemCount = items.length;
                var escapedCat = App.UI.escapeHtml(groupName);
                
                html += '<div class="category-group">' +
                    '<div class="category-header">' +
                        '<div class="category-title ' + (isCollapsed ? 'collapsed' : '') + '" onclick="App.Products.toggleCategory(decodeURIComponent(\'' + App.Workspace.encodeKey(groupName) + '\'))">' +
                            '<i class="fa-solid fa-chevron-down"></i> ' +
                            escapedCat +
                            ' <span class="category-count">' + itemCount + '</span>' +
                        '</div>' +
                        '<button type="button" class="random-btn" onclick="App.Products.selectRandom(decodeURIComponent(\'' + App.Workspace.encodeKey(groupName) + '\')); event.stopPropagation()" title="Выбрать случайный товар">' +
                            '<i class="fa-solid fa-dice"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="category-items ' + (isCollapsed ? 'collapsed' : '') + '">';
                
                html += App.Products._renderItems(items);
                html += '</div></div>';
            }
        }
        
        if (groupNames.length === 0) {
            html = '<div style="color: var(--muted); text-align: center; padding: 20px;">Нет товаров в магазине "' + App.getCurrentShop().name + '"</div>';
        }
        
        document.getElementById('productList').innerHTML = html;
        App.UI.updateCategoryDatalist();
        
        if (App.State.catalogMode === 'catalog') {
            var catalog = App.Message.generateCatalog();
            document.getElementById('output').textContent = catalog;
        } else {
            App.Message.update();
        }
        
        document.getElementById('selectedCount').textContent = App.State.selectedProducts.length;
        
        // Подсчёт суммы выбранных товаров
        var total = 0;
        var hasAnyPrice = false;
        App.State.selectedProducts.forEach(function(id) {
            var p = App.State.products.find(function(p) { return p.id === id; });
            if (p && p.fieldData && p.fieldData.price) {
                var price = parseFloat(p.fieldData.price);
                if (!isNaN(price) && price > 0) {
                    total += price;
                    hasAnyPrice = true;
                }
            }
        });
        var totalDisplay = document.getElementById('totalPriceDisplay');
        var totalEl = document.getElementById('totalPrice');
        if (totalDisplay && totalEl) {
            if (hasAnyPrice && App.State.selectedProducts.length > 0) {
                totalEl.textContent = total % 1 === 0 ? total : total.toFixed(2);
                totalDisplay.style.display = 'inline';
            } else {
                totalDisplay.style.display = 'none';
            }
        }
    },
    
    // ==================== ВСПОМОГАТЕЛЬНЫЙ РЕНДЕР ТОВАРОВ ====================
    _renderItems: function(items) {
        var html = '';
        for (var j = 0; j < items.length; j++) {
            var product = items[j];
            var isSelected = App.State.selectedProducts.indexOf(product.id) > -1;
            var checked = isSelected ? 'checked' : '';
            var selectedClass = isSelected ? ' selected' : '';
            
            var template = App.Templates.getById(product.templateId);
            var templateBadge = template ? '<span class="template-badge">' + App.UI.escapeHtml(template.name) + '</span>' : '';
            
            html += '<div class="product-item' + selectedClass + '" data-id="' + product.id + '">' +
                '<input type="checkbox" ' + checked + ' onchange="App.Products.toggle(' + product.id + ')">' +
                '<div class="product-name" onclick="App.Products.toggle(' + product.id + '); event.stopPropagation()">' + 
                App.UI.escapeHtml(product.name) + ' <span class="product-sku" title="артикул" onclick="event.stopPropagation()">' + App.UI.escapeHtml(product.sku || '') + '</span>' + templateBadge + 
                '</div>' +
                '<div class="product-actions">' +
                    '<button type="button" class="product-actions-btn edit-btn" onclick="App.Products.edit(' + product.id + '); event.stopPropagation()" title="Изменить товар">' +
                        '<i class="fa-solid fa-pencil"></i>' +
                    '</button>' +
                    '<button type="button" class="product-actions-btn delete-btn" onclick="App.Products.delete(' + product.id + '); event.stopPropagation()" title="Удалить товар">' +
                        '<i class="fa-solid fa-trash"></i>' +
                    '</button>' +
                '</div>' +
            '</div>';
        }
        return html;
    },
    
    // ==================== ГРУППЫ ====================
    toggleGroup: function(groupName) {
        App.State.collapsedGroups[groupName] = !App.State.collapsedGroups[groupName];
        App.Storage.saveCollapsedGroups();
        App.Products.render();
    },
    
    // ==================== КАТЕГОРИИ ====================
    toggleCategory: function(key) {
        App.State.collapsedCategories[key] = !App.State.collapsedCategories[key];
        App.Storage.saveCollapsedCategories();
        App.Products.render();
    },
    
    toggleAllCategories: function() {
        var filteredProducts = App.State.products.filter(function(p) { return p.shop === App.State.currentShop; });
        var allKeys = {};
        filteredProducts.forEach(function(p) {
            var g = p.group || p.category || '';
            var c = p.collection || '';
            allKeys[g + '|||' + c] = true;
            allKeys[g] = true;
        });
        var keys = Object.keys(allKeys);
        if (keys.length === 0) return;
        
        var allCollapsed = keys.every(function(k) { return App.State.collapsedCategories[k] || App.State.collapsedGroups[k]; });
        
        keys.forEach(function(k) {
            App.State.collapsedCategories[k] = !allCollapsed;
            App.State.collapsedGroups[k] = !allCollapsed;
        });
        
        App.Storage.saveCollapsedCategories();
        App.Storage.saveCollapsedGroups();
        App.Products.render();
    },
    
    // ==================== ВЫБОР ТОВАРОВ ====================
    toggle: function(id) {
        var product = App.State.products.find(function(p) { return p.id === id; });
        if (!product) return;
        
        // Проверяем есть ли выбранные товары из другого магазина
        var selectedFromOtherShop = App.State.products.filter(function(p) {
            return App.State.selectedProducts.indexOf(p.id) > -1 && p.shop !== product.shop;
        });
        
        // Если есть товары из другого магазина - сбрасываем выборку и предупреждаем
        if (selectedFromOtherShop.length > 0) {
            App.State.selectedProducts = [];
            App.UI.showToast('Нельзя выбирать товары из разных магазинов! Выборка сброшена.', true);
        }
        
        var idx = App.State.selectedProducts.indexOf(id);
        if (idx > -1) {
            App.State.selectedProducts.splice(idx, 1);
        } else {
            App.State.selectedProducts.push(id);
        }
        
        App.Products.render();
    },
    
    selectRandom: function(category) {
        var items = App.State.products.filter(function(p) { 
            return p.shop === App.State.currentShop && (p.group || p.category || '') === category; 
        });
        if (items.length === 0) return;
        var random = items[Math.floor(Math.random() * items.length)];
        var idx = App.State.selectedProducts.indexOf(random.id);
        if (idx === -1) App.State.selectedProducts.push(random.id);
        App.Products.render();
    },
    
    selectRandomFromKey: function(key) {
        var parts = key.split('|||');
        var g = parts[0], c = parts[1];
        var items = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop && (p.group || p.category || '') === g && (p.collection || '') === c;
        });
        if (items.length === 0) return;
        var random = items[Math.floor(Math.random() * items.length)];
        var idx = App.State.selectedProducts.indexOf(random.id);
        if (idx === -1) App.State.selectedProducts.push(random.id);
        App.Products.render();
    },
    
    clearAllSelections: function() {
        App.State.selectedProducts = [];
        App.Products.render();
    },
    
    // ==================== РЕНДЕРИНГ ДИНАМИЧЕСКИХ ПОЛЕЙ ====================
    renderDynamicFields: function(templateId) {
        var template = App.Templates.getById(templateId);
        var container = document.getElementById('dynamicFieldsContainer');
        
        if (!template || !template.fields) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">Выберите шаблон или создайте новый</div>';
            return;
        }
        
        var html = '';
        
        // Рендерим только включённые поля
        var enabledFields = template.fields.filter(function(f) { return f.enabled; });
        
        enabledFields.forEach(function(field) {
            var fieldId = 'field_' + field.id;
            
            html += '<div class="form-group">' +
                '<label>' + App.UI.escapeHtml(field.name) + (field.required ? ' *' : '') + '</label>';
            
            if (field.type === 'textarea') {
                html += '<textarea id="' + fieldId + '" rows="3" placeholder="' + App.UI.escapeHtml(field.placeholder || '') + '" oninput="App.Products.onFieldChange()"></textarea>';
            } else {
                var inputType = field.type === 'number' ? 'number' : 'text';
                html += '<input type="' + inputType + '" id="' + fieldId + '" placeholder="' + App.UI.escapeHtml(field.placeholder || '') + '" oninput="App.Products.onFieldChange()">';
            }
            
            html += '</div>';
        });
        
        container.innerHTML = html;
        App.Images.attachFields(template);
    },
    
    // ==================== ОБРАБОТЧИК ИЗМЕНЕНИЯ ПОЛЕЙ ====================
    onFieldChange: function() {
        // Автоматически обновляем название с капсом и ёлочками
        var nameInput = document.getElementById('simpleName');
        if (nameInput) {
            var rawName = nameInput.value;
            // Не меняем если пользователь уже ввёл ёлочки вручную
            if (rawName && !rawName.startsWith('«')) {
                // Обновляем скрытое поле с форматированным названием
                // но не меняем само поле чтобы не мешать вводу
            }
        }
        
        // Обновляем предпросмотр если на вкладке BB-кода
        if (App.State.currentFormMode === 'advanced') {
            App.Products.updatePreview();
        }
    },
    
    // ==================== ОБНОВЛЕНИЕ ПРЕДПРОСМОТРА ====================
    updatePreview: function() {
        var templateId = document.getElementById('simpleTemplateSelect').value;
        var template = App.Templates.getById(templateId);
        
        if (!template) return;
        
        // Собираем данные из полей
        var fieldData = {};
        var rawName = document.getElementById('simpleName').value.trim();
        
        fieldData.name = App.formatProductName(rawName);
        
        template.fields.forEach(function(field) {
            if (field.enabled) {
                var input = document.getElementById('field_' + field.id);
                if (input) {
                    fieldData[field.id] = input.value;
                }
            }
        });
        
        // Генерируем BB-код карточки
        var contextId = App.State.catalogMode === 'catalog' ? 'catalog' : 'delivery_' + App.State.currentDeliveryProfileId;
        var previewProduct = App.State.products.find(function (p) { return p.id === App.State.editingId; }) || App.Products.draftIdentity;
        var productCard = App.Message.generateProductCard(template, fieldData, contextId, previewProduct);
        document.getElementById('previewDescription').value = productCard;
        
        // Генерируем BB-код этикетки (и других опциональных полей)
        var labelPreview = '';
        
        ['label', 'note1', 'note2'].forEach(function(fieldId) {
            var code = App.Message.generateFieldBBCode(template, fieldData, fieldId, contextId);
            if (code) labelPreview += code + '\n\n';
        });

        var labelContainer = document.getElementById('previewLabelContainer');
        var labelTextarea = document.getElementById('previewLabel');
        
        if (labelPreview.trim()) {
            labelContainer.style.display = 'block';
            labelTextarea.value = labelPreview.trim();
        } else {
            labelContainer.style.display = 'none';
        }
    },
    
    // ==================== ОБРАБОТЧИК СМЕНЫ ШАБЛОНА ====================
    onTemplateSelectChange: function() {
        var select = document.getElementById('simpleTemplateSelect');
        if (!select) return;
        
        var templateId = select.value;
        App.Products.renderDynamicFields(templateId);
        
        // Если редактируем товар, заполняем поля
        if (App.State.editingId) {
            var product = App.State.products.find(function(p) { return p.id === App.State.editingId; });
            if (product && product.fieldData) {
                Object.keys(product.fieldData).forEach(function(fieldId) {
                    var input = document.getElementById('field_' + fieldId);
                    if (input) {
                        input.value = product.fieldData[fieldId] || '';
                    }
                });
            }
        }
    },
    
    // ==================== ПОКАЗАТЬ/СКРЫТЬ ФОРМУ ====================
    toggleAddForm: function() {
        var form = document.getElementById('addForm');
        if (form.classList.contains('hidden')) {
            App.State.editingId = null;
            App.Products.draftIdentity = null;
            document.getElementById('formSku').textContent = 'артикул появится после сохранения';
            ['simpleName','simpleGroup','simpleCollection','simpleCategory'].forEach(function(id) { document.getElementById(id).value = ''; });
            var select = document.getElementById('simpleTemplateSelect');
            App.Products.renderDynamicFields(select.value);
            form.classList.remove('hidden');
            App.UI.switchFormTab('simple');
        } else {
            form.classList.add('hidden');
            App.Products.cancelEdit();
        }
    },
    
    // ==================== СОХРАНЕНИЕ ТОВАРА ====================
    saveProduct: function() {
        var category = document.getElementById('simpleCategory').value.trim();
        var name = document.getElementById('simpleName').value.trim();
        var groupInput = document.getElementById('simpleGroup');
        var collectionInput = document.getElementById('simpleCollection');
        var group = groupInput ? groupInput.value.trim() : '';
        var collection = collectionInput ? collectionInput.value.trim() : '';
        var templateId = document.getElementById('simpleTemplateSelect').value;
        
        if (!category || !name) {
            App.UI.showToast('Заполните категорию и название!', true);
            return;
        }
        
        if (!templateId) {
            App.UI.showToast('Выберите шаблон!', true);
            return;
        }
        
        var template = App.Templates.getById(templateId);
        if (!template) {
            App.UI.showToast('Шаблон не найден!', true);
            return;
        }
        
        // Hidden or temporarily disabled fields remain available if the template enables them again.
        var existingProduct = App.State.products.find(function (p) { return p.id === App.State.editingId; });
        var fieldData = structuredClone(existingProduct?.fieldData || {});
        
        // ВАЖНО: Добавляем название в fieldData!
        fieldData.name = App.formatProductName(name);
        
        template.fields.forEach(function(field) {
            if (field.enabled) {
                var input = document.getElementById('field_' + field.id);
                if (input) {
                    fieldData[field.id] = input.value;
                }
            }
        });
        
        if (template.fields.some(function(f) { return f.enabled && f.required && !String(fieldData[f.id] || '').trim(); })) {
            App.UI.showToast('Заполните обязательные поля шаблона', true); return;
        }

        // Форматируем название для свойства name
        var formattedName = App.formatProductName(name);
        
        var productData = {
            category: category,
            group: group || category,
            collection: collection,
            name: formattedName,
            templateId: templateId,
            fieldData: fieldData,
            shop: App.State.currentShop
        };
        // Применяем миграцию если group не заполнена вручную
        if (!group) {
            productData = App.migrateProductCategory(productData);
        }
        
        if (App.State.editingId) {
            // Редактирование
            var index = App.State.products.findIndex(function(p) { return p.id === App.State.editingId; });
            if (index !== -1) {
                productData.id = App.State.editingId;
                productData.sku = App.State.products[index].sku;
                App.State.products[index] = Object.assign({}, App.State.products[index], productData);
                App.UI.showToast('Товар обновлён!');
            }
        } else {
            // Создание
            productData.id = App.Products.draftIdentity?.id || App.Workspace.nextProductId();
            if (App.Products.draftIdentity) productData.sku = App.Products.draftIdentity.sku;
            App.State.products.push(productData);
            App.UI.showToast('Товар добавлен в магазин "' + App.getCurrentShop().name + '"!');
        }
        
        App.Storage.saveProducts();
        App.Products.render();
        App.Products.cancelEdit();
        document.getElementById('addForm').classList.add('hidden');
    },
    
    // ==================== РЕДАКТИРОВАНИЕ ====================
    edit: function(id) {
        App.Products.draftIdentity = null;
        var product = App.State.products.find(function(p) { return p.id === id; });
        if (!product) return;
        
        App.State.editingId = id;
        
        document.getElementById('addForm').classList.remove('hidden');
        document.getElementById('formTitle').textContent = 'Редактирование товара';
        document.getElementById('formSku').textContent = product.sku || '';
        
        document.getElementById('simpleCategory').value = product.category || '';
        
        var groupInput = document.getElementById('simpleGroup');
        if (groupInput) groupInput.value = product.group || '';
        var collectionInput = document.getElementById('simpleCollection');
        if (collectionInput) collectionInput.value = product.collection || '';
        
        var rawName = product.name.replace(/^«|»$/g, '');
        document.getElementById('simpleName').value = rawName;
        
        var templateSelect = document.getElementById('simpleTemplateSelect');
        if (templateSelect) {
            templateSelect.value = product.templateId || '';
            App.Products.renderDynamicFields(product.templateId);
        }
        
        if (product.fieldData) {
            Object.keys(product.fieldData).forEach(function(fieldId) {
                var input = document.getElementById('field_' + fieldId);
                if (input) {
                    input.value = product.fieldData[fieldId] || '';
                }
            });
        }
        
        App.UI.switchFormTab('simple');
    },
    
    // ==================== УДАЛЕНИЕ ====================
    delete: function(id) {
        if (confirm('Удалить этот товар?')) {
            App.State.products = App.State.products.filter(function(p) { return p.id !== id; });
            var idx = App.State.selectedProducts.indexOf(id);
            if (idx > -1) {
                App.State.selectedProducts.splice(idx, 1);
            }
            App.Storage.saveProducts();
            App.Products.render();
            App.UI.showToast('Товар удалён');
        }
    },
    
    // ==================== ОТМЕНА РЕДАКТИРОВАНИЯ ====================
    cancelEdit: function() {
        App.Products.draftIdentity = null;
        // Просто закрываем форму, не очищая поля
        // Поля очистятся автоматически при следующем открытии/редактировании
        App.State.editingId = null;
        document.getElementById('formTitle').textContent = 'Новый товар';
        document.getElementById('addForm').classList.add('hidden');
    },
    
    // ==================== ИМПОРТ/ЭКСПОРТ ====================
    downloadCatalog: function() { App.Backup.download(); },
    uploadCatalog: function(event) { App.Backup.importCatalog(event); },

    clearCatalog: function() {
        if (confirm('Удалить все товары из каталога? Это действие нельзя отменить!')) {
            App.State.products = [];
            App.State.selectedProducts = [];
            App.Storage.saveProducts();
            App.Products.render();
            App.UI.showToast('Каталог очищен');
        }
    }
};

// Глобальные функции для onclick
function onTemplateSelectChange() { App.Products.onTemplateSelectChange(); }
function toggleAddForm() { App.Products.toggleAddForm(); }
function saveProduct() { App.Products.saveProduct(); }
function cancelEdit() { App.Products.cancelEdit(); }
function toggleAllCategories() { App.Products.toggleAllCategories(); }
function clearAllSelections() { App.Products.clearAllSelections(); }
function downloadCatalog() { App.Products.downloadCatalog(); }
function uploadCatalog(event) { App.Products.uploadCatalog(event); }
function clearCatalog() { App.Products.clearCatalog(); }

