/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * UI утилиты (НОВАЯ ВЕРСИЯ)
 */

App.UI = {
    
    // ==================== TOAST УВЕДОМЛЕНИЯ ====================
    showToast: function(message, isWarning) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        var toast = document.createElement('div');
        toast.className = 'toast' + (isWarning ? ' warning' : '');
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() { toast.remove(); }, 3000);
    },
    
    // ==================== ПЕРЕКЛЮЧАТЕЛЬ МАГАЗИНОВ ====================
    // ==================== ПЕРЕКЛЮЧЕНИЕ ПРОФИЛЯ ДОСТАВКИ ====================
    setVersion: function(modeId) {
        App.State.currentMode = modeId;
        App.State.currentDeliveryProfileId = modeId;
        App.Storage.saveCurrentDeliveryProfileId();
        
        // Обновляем активную кнопку
        var buttons = document.querySelectorAll('.version-btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.mode === modeId) btn.classList.add('active');
        });
        
        // Обновляем подсказки для получателя и отправителя
        // (перечитать индексы с учётом нового профиля)
        App.Users.refreshFieldHints();
        
        App.Message.update();
    },
    
    // Рендеринг кнопок режимов — теперь по профилям доставки
    renderModeButtons: function() {
        var container = document.getElementById('modeButtonsContainer');
        if (!container) return;
        
        var profiles = App.getDeliveryProfiles();
        var html = '';
        profiles.forEach(function(profile) {
            var isActive = profile.id === App.State.currentDeliveryProfileId;
            html += '<button type="button" class="version-btn' + (isActive ? ' active' : '') + '" ' +
                'data-mode="' + profile.id + '" ' +
                'onclick="setVersion(\'' + profile.id + '\')" ' +
                'aria-label="' + App.UI.escapeHtml(profile.name) + '" title="' + App.UI.escapeHtml(profile.name) + '">' +
                '<i class="' + App.UI.escapeHtml(profile.icon) + '"></i>' +
                '</button>';
        });
        container.innerHTML = html;
    },
    
    // ==================== РЕЖИМ ГЕНЕРАЦИИ (ДОСТАВКА / КАТАЛОГ) ====================
    renderModeToggle: function() {
        // Добавляем переключатель режима в header правой панели
        var panelHeader = document.querySelectorAll('.panel-header')[1]; // Вторая панель
        if (!panelHeader) return;
        
        var modeToggle = document.getElementById('generationModeToggle');
        if (modeToggle) return; // Уже есть
        
        // Находим контейнер с кнопками
        var buttonsContainer = panelHeader.querySelector('div[style*="gap"]');
        if (!buttonsContainer) return;
        
        var toggleHtml = '<div class="generation-mode-toggle" id="generationModeToggle">' +
            '<button type="button" class="catalog-btn mode-toggle-btn' + (App.State.catalogMode === 'delivery' ? ' active' : '') + '" ' +
                'onclick="App.UI.setGenerationMode(\'delivery\')" title="Режим сообщения доставки">' +
                '<i class="fa-solid fa-truck"></i>' +
            '</button>' +
            '<button type="button" class="catalog-btn mode-toggle-btn' + (App.State.catalogMode === 'catalog' ? ' active' : '') + '" ' +
                'onclick="App.UI.setGenerationMode(\'catalog\')" title="Режим каталога (таблица)">' +
                '<i class="fa-solid fa-table-cells"></i>' +
            '</button>' +
            '</div>';
        
        // Вставляем перед кнопками управления
        buttonsContainer.insertAdjacentHTML('afterbegin', toggleHtml);
    },
    
    setGenerationMode: function(mode) {
        App.State.catalogMode = mode;
        
        // Обновляем кнопки
        var buttons = document.querySelectorAll('.mode-toggle-btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        var activeBtn = mode === 'delivery' ? buttons[0] : buttons[1];
        if (activeBtn) activeBtn.classList.add('active');
        
        // Скрываем/показываем поля доставки
        var deliveryFields = ['recipient', 'sender', 'note'].map(function(id) {
            return document.getElementById(id);
        }).filter(function(el) { return el; }).map(function(el) {
            return el.closest('.form-group');
        });
        
        deliveryFields.forEach(function(field) {
            if (field) {
                field.style.display = mode === 'delivery' ? 'block' : 'none';
            }
        });
        
        // Показываем/скрываем настройки каталога
        App.UI.toggleCatalogSettings(mode === 'catalog');
        
        // ВАЖНО: Обновляем вывод сразу после переключения
        if (mode === 'catalog') {
            var catalog = App.Message.generateCatalog();
            document.getElementById('output').textContent = catalog;
        } else {
            App.Message.update();
        }
    },
    
    // ==================== НАСТРОЙКИ КАТАЛОГА ====================
    renderCatalogSettings: function() {
        var formFields = document.querySelector('.form-fields');
        if (!formFields) return;
        
        if (document.getElementById('catalogSettings')) return;
        
        // Устанавливаем дефолтные значения если их нет
        if (typeof App.State.catalogColumns === 'undefined') App.State.catalogColumns = 4;
        if (typeof App.State.catalogHeaderEnabled === 'undefined') App.State.catalogHeaderEnabled = true;
        if (typeof App.State.catalogHeaderEvent === 'undefined') App.State.catalogHeaderEvent = '';
        if (typeof App.State.catalogHeaderTitle === 'undefined') App.State.catalogHeaderTitle = '';
        if (typeof App.State.catalogHeaderDescription === 'undefined') App.State.catalogHeaderDescription = '';
        
        var settingsHtml = '<div id="catalogSettings" class="catalog-settings" style="display: none;">' +
            '<div class="form-group">' +
                '<label>Количество столбцов</label>' +
                '<input type="number" id="catalogColumnsInput" value="' + App.State.catalogColumns + '" min="1" max="6" oninput="App.UI.updateCatalogColumns()">' +
            '</div>' +
            
            '<div class="form-group">' +
                '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">' +
                    '<label style="margin: 0;">Шапка таблицы</label>' +
                    '<label class="toggle-switch">' +
                        '<input type="checkbox" id="catalogHeaderEnabled" ' + (App.State.catalogHeaderEnabled ? 'checked' : '') + ' onchange="App.UI.toggleCatalogHeader()">' +
                        '<span class="toggle-slider"></span>' +
                    '</label>' +
                '</div>' +
                
                '<div id="catalogHeaderFields" style="' + (App.State.catalogHeaderEnabled ? '' : 'display:none;') + '">' +
                    '<div style="margin-bottom: 8px;">' +
                        '<label style="font-size: 13px; opacity: 0.8;">Событие / Праздник</label>' +
                        '<input type="text" id="catalogHeaderEvent" value="' + App.UI.escapeHtml(App.State.catalogHeaderEvent) + '" ' +
                            'placeholder="День Св. Валентина" oninput="App.UI.updateCatalogHeaderData()">' +
                        '<small style="opacity: 0.6; font-size: 11px;">Например: День Св. Валентина, Хэллоуин, Новый Год</small>' +
                    '</div>' +
                    '<div style="margin-bottom: 8px;">' +
                        '<label style="font-size: 13px; opacity: 0.8;">Заголовок (тип товара)</label>' +
                        '<input type="text" id="catalogHeaderTitle" value="' + App.UI.escapeHtml(App.State.catalogHeaderTitle) + '" ' +
                            'placeholder="БУКЕТЫ И КОМПОЗИЦИИ ИЗ ЖИВЫХ ЦВЕТОВ" oninput="App.UI.updateCatalogHeaderData()">' +
                        '<small style="opacity: 0.6; font-size: 11px;">Например: БУКЕТЫ, СВЕЧИ АРОМАТИЧЕСКИЕ, СИРОПЫ</small>' +
                    '</div>' +
                    '<div style="margin-bottom: 8px;">' +
                        '<label style="font-size: 13px; opacity: 0.8;">Описание коллекции</label>' +
                        '<textarea id="catalogHeaderDescription" rows="3" ' +
                            'placeholder="Описание коллекции..." oninput="App.UI.updateCatalogHeaderData()">' +
                            App.UI.escapeHtml(App.State.catalogHeaderDescription) +
                        '</textarea>' +
                        '<small style="opacity: 0.6; font-size: 11px;">Подробное описание коллекции или концепции</small>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>';
        
        formFields.insertAdjacentHTML('beforeend', settingsHtml);
    },
    
    toggleCatalogSettings: function(show) {
        var settings = document.getElementById('catalogSettings');
        if (settings) {
            settings.style.display = show ? 'block' : 'none';
        }
    },
    
    updateCatalogColumns: function() {
        var input = document.getElementById('catalogColumnsInput');
        if (input) {
            App.State.catalogColumns = Math.max(1, Math.min(6, parseInt(input.value) || 4));
            if (App.State.catalogMode === 'catalog') {
                var catalog = App.Message.generateCatalog();
                document.getElementById('output').textContent = catalog;
            }
        }
    },
    
    toggleCatalogHeader: function() {
        var checkbox = document.getElementById('catalogHeaderEnabled');
        var fields = document.getElementById('catalogHeaderFields');
        
        if (checkbox) {
            App.State.catalogHeaderEnabled = checkbox.checked;
            if (fields) {
                fields.style.display = checkbox.checked ? 'block' : 'none';
            }
            
            if (App.State.catalogMode === 'catalog') {
                var catalog = App.Message.generateCatalog();
                document.getElementById('output').textContent = catalog;
            }
        }
    },
    
    updateCatalogHeaderData: function() {
        var eventInput = document.getElementById('catalogHeaderEvent');
        var titleInput = document.getElementById('catalogHeaderTitle');
        var descInput = document.getElementById('catalogHeaderDescription');
        
        if (eventInput) App.State.catalogHeaderEvent = eventInput.value;
        if (titleInput) App.State.catalogHeaderTitle = titleInput.value;
        if (descInput) App.State.catalogHeaderDescription = descInput.value;
        
        if (App.State.catalogMode === 'catalog') {
            var catalog = App.Message.generateCatalog();
            document.getElementById('output').textContent = catalog;
        }
    },
    
    // ==================== TABS ФОРМЫ ====================
    switchFormTab: function(mode) {
        App.State.currentFormMode = mode;
        var tabs = document.querySelectorAll('.form-tab');
        var contents = document.querySelectorAll('.tab-content');
        
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        for (var i = 0; i < contents.length; i++) {
            contents[i].classList.remove('active');
        }
        
        if (mode === 'simple') {
            document.querySelector('.form-tab:nth-child(1)').classList.add('active');
            document.getElementById('simpleMode').classList.add('active');
        } else {
            document.querySelector('.form-tab:nth-child(2)').classList.add('active');
            document.getElementById('advancedMode').classList.add('active');
            // Обновляем предпросмотр при переключении на BB-код режим
            if (App.Products && App.Products.updatePreview) {
                App.Products.updatePreview();
            }
        }
    },
    
    // ==================== ОТОБРАЖЕНИЕ ИМЕНИ КАТАЛОГА ====================
    updateCatalogNameDisplay: function() {
        var el = document.getElementById('catalogName');
        if (App.State.currentCatalogName) {
            el.textContent = '(' + App.State.currentCatalogName + ')';
        } else {
            el.textContent = '';
        }
    },
    
    // ==================== DATALIST КАТЕГОРИЙ / ГРУПП / КОЛЛЕКЦИЙ ====================
    updateCategoryDatalist: function() {
        var categories = [];
        var groups = [];
        var collections = [];
        
        App.State.products.forEach(function(p) {
            var cat = p.category || '';
            var grp = p.group || cat;
            var col = p.collection || '';
            
            if (cat && categories.indexOf(cat) === -1) categories.push(cat);
            if (grp && groups.indexOf(grp) === -1) groups.push(grp);
            if (col && collections.indexOf(col) === -1) collections.push(col);
        });
        
        var catList = document.getElementById('categoryList');
        if (catList) catList.innerHTML = categories.map(function(c) { return '<option value="' + App.UI.escapeHtml(c) + '">'; }).join('');
        
        var grpList = document.getElementById('groupList');
        if (grpList) grpList.innerHTML = groups.map(function(g) { return '<option value="' + App.UI.escapeHtml(g) + '">'; }).join('');
        
        var colList = document.getElementById('collectionList');
        if (colList) colList.innerHTML = collections.map(function(c) { return '<option value="' + App.UI.escapeHtml(c) + '">'; }).join('');
        
        // Авто-заполнение категории при изменении группы/коллекции
        var groupInput = document.getElementById('simpleGroup');
        var collectionInput = document.getElementById('simpleCollection');
        var categoryInput = document.getElementById('simpleCategory');
        
        if (groupInput && !groupInput._autoFillWired) {
            groupInput._autoFillWired = true;
            var autoFill = function() {
                var g = groupInput.value.trim();
                var c = collectionInput ? collectionInput.value.trim() : '';
                if (categoryInput) {
                    categoryInput.value = c ? g + ' ' + c : g;
                }
            };
            groupInput.addEventListener('input', autoFill);
            if (collectionInput) collectionInput.addEventListener('input', autoFill);
        }
    },
    
    // ==================== ХЕЛПЕР ====================
    escapeHtml: function(str) {
        if (str == null) return '';
        return String(str).replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }
};

// Глобальные функции для onclick в HTML
function setVersion(modeId) { App.UI.setVersion(modeId); }
function switchFormTab(mode) { App.UI.switchFormTab(mode); }

