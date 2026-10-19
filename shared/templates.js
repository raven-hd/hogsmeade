/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Модуль управления шаблонами (ПЕРЕРАБОТАННЫЙ - 2 шага)
 */

App.Templates = {
    
    // ==================== ПОЛУЧЕНИЕ ШАБЛОНА ====================
    getById: function(id) {
        var template = App.State.templates.find(function(t) { return t.id === id; });
        return template || null;
    },
    
    // ==================== ОБНОВЛЕНИЕ СЕЛЕКТОВ ====================
    updateSelects: function() {
        var simpleSelect = document.getElementById('simpleTemplateSelect');
        if (!simpleSelect) return;
        
        simpleSelect.innerHTML = '';
        
        if (App.State.templates.length === 0) {
            simpleSelect.innerHTML = '<option value="">Нет шаблонов - создайте новый</option>';
            return;
        }
        
        App.State.templates.forEach(function(template) {
            var option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            simpleSelect.appendChild(option);
        });
    },
    
    // ==================== МОДАЛЬНОЕ ОКНО ====================
    openModal: function() {
        App.Templates.renderList();
        document.getElementById('templatesModal').classList.remove('hidden');
    },
    
    closeModal: function() {
        document.getElementById('templatesModal').classList.add('hidden');
        App.Templates.cancelWizard();
    },
    
    // ==================== РЕНДЕРИНГ СПИСКА ====================
    renderList: function() {
        var container = document.getElementById('templatesListModal');
        
        if (App.State.templates.length === 0) {
            container.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 20px;">Шаблонов пока нет. Создайте первый!</div>';
        } else {
            var html = '';
            App.State.templates.forEach(function(template) {
                var fieldsCount = template.fields ? template.fields.filter(function(f) { return f.enabled; }).length : 0;
                var optionalCount = 0;
                if (template.optionalFields) {
                    ['label', 'note1', 'note2'].forEach(function(fieldId) {
                        if (template.optionalFields[fieldId] && template.optionalFields[fieldId].enabled) optionalCount++;
                    });
                }
                html += '<div class="template-item">' +
                    '<div class="template-info">' +
                    '<strong>' + App.UI.escapeHtml(template.name) + '</strong>' +
                    '<span style="opacity: 0.7; font-size: 0.9em;">' + fieldsCount + ' полей + ' + optionalCount + ' опциональных</span>' +
                    '</div>' +
                    '<div class="template-actions">' +
                    '<button type="button" class="product-actions-btn edit-btn" onclick="App.Templates.edit(\'' + template.id + '\')" title="Редактировать">' +
                    '<i class="fa-solid fa-pencil"></i>' +
                    '</button>' +
                    '<button type="button" class="product-actions-btn delete-btn" onclick="App.Templates.delete(\'' + template.id + '\')" title="Удалить">' +
                    '<i class="fa-solid fa-trash"></i>' +
                    '</button>' +
                    '</div>' +
                    '</div>';
            });
            container.innerHTML = html;
        }
        
        // Рендерим секцию профилей доставки
        App.Templates.renderDeliveryProfilesSection();
    },
    
    // ==================== ПРОФИЛИ ДОСТАВКИ ====================
    renderDeliveryProfilesSection: function() {
        var existing = document.getElementById('deliveryProfilesSection');
        if (existing) existing.remove();
        
        var profiles = App.getDeliveryProfiles();
        var currentId = App.State.currentDeliveryProfileId;
        
        var html = '<div id="deliveryProfilesSection" style="margin-top: 20px; border-top: 1px solid var(--line); padding-top: 16px;">' +
            '<h4 style="color: var(--accent); margin: 0 0 8px;">Профили доставки</h4>' +
            '<p style="opacity: 0.7; font-size: 13px; margin-bottom: 12px;">Хогсмид и Хогвартс — разные форматы сообщения и разные индексы пользователей</p>' +
            '<div class="delivery-profiles-list">';
        
        profiles.forEach(function(profile) {
            var isActive = profile.id === currentId;
            var isCustom = App.State.deliveryProfiles.find(function(p) { return p.id === profile.id; });
            
            html += '<div class="delivery-profile-item' + (isActive ? ' active' : '') + '">' +
                '<div class="delivery-profile-info">' +
                '<i class="' + profile.icon + '" style="margin-right: 8px;"></i>' +
                '<strong>' + App.UI.escapeHtml(profile.name) + '</strong>' +
                (isActive ? ' <span style="color: #4CAF50; font-size: 12px;">● активен</span>' : '') +
                '<span style="opacity: 0.6; font-size: 12px; margin-left: 8px;">индекс: ' + profile.userField + '</span>' +
                '</div>' +
                '<div class="delivery-profile-actions">' +
                (!isActive ? '<button type="button" class="product-actions-btn" onclick="App.Templates.activateProfile(\'' + profile.id + '\')" title="Активировать профиль"><i class="fa-solid fa-circle-check"></i></button>' : '') +
                '<button type="button" class="product-actions-btn edit-btn" onclick="App.Templates.editProfile(\'' + profile.id + '\')" title="Редактировать профиль">' +
                '<i class="fa-solid fa-pencil"></i></button>' +
                (isCustom ? '<button type="button" class="product-actions-btn delete-btn" onclick="App.Templates.deleteProfile(\'' + profile.id + '\')" title="Удалить профиль">' +
                '<i class="fa-solid fa-trash"></i></button>' : '') +
                '</div>' +
                '</div>';
        });
        
        html += '</div>' +
            '<button type="button" class="catalog-btn" onclick="App.Templates.showNewProfileForm()" style="margin-top:10px;" title="Новый профиль доставки">' +
            '<i class="fa-solid fa-plus"></i></button>' +
            '<div id="profileFormContainer"></div>' +
            '</div>';
        
        var listView = document.getElementById('templatesListView');
        var modalButtons = document.getElementById('templateModalButtons');
        if (listView && modalButtons) {
            modalButtons.insertAdjacentHTML('beforebegin', html);
        }
    },
    
    activateProfile: function(profileId) {
        App.State.currentMode = profileId;
        App.State.currentDeliveryProfileId = profileId;
        App.Storage.saveCurrentDeliveryProfileId();
        App.UI.renderModeButtons();
        App.Users.refreshFieldHints();
        App.Message.update();
        App.Templates.renderDeliveryProfilesSection();
        App.UI.showToast('Профиль доставки изменён');
    },
    
    editProfile: function(profileId) {
        var profiles = App.getDeliveryProfiles();
        var profile = profiles.find(function(p) { return p.id === profileId; });
        if (!profile) return;
        
        App.Templates.showProfileForm(JSON.parse(JSON.stringify(profile)));
    },
    
    deleteProfile: function(profileId) {
        if (!confirm('Удалить профиль доставки?')) return;
        App.State.deliveryProfiles = App.State.deliveryProfiles.filter(function(p) { return p.id !== profileId; });
        App.Storage.saveDeliveryProfiles();
        if (App.State.currentDeliveryProfileId === profileId) {
            App.State.currentMode = 'hogsmeade';
            App.State.currentDeliveryProfileId = 'hogsmeade';
            App.Storage.saveCurrentDeliveryProfileId();
        }
        App.UI.renderModeButtons();
        App.Templates.renderDeliveryProfilesSection();
        App.UI.showToast('Профиль удалён');
    },
    
    showNewProfileForm: function() {
        App.Templates.showProfileForm({
            id: '',
            name: '',
            icon: 'fa-solid fa-tents',
            userField: 'hogsmeadeId',
            raven: { header: '', note: '', productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: '' },
            peach: { header: '', note: '', productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: '' }
        });
    },
    
    showProfileForm: function(profile) {
        var container = document.getElementById('profileFormContainer');
        if (!container) return;
        
        var ravenProfile = App.Config.DEFAULT_DELIVERY_PROFILES.find(function(p) { return p.id === 'raven'; });
        
        container.innerHTML = '<div class="profile-form" style="margin-top: 12px; background: var(--input-bg); padding: 14px; border-radius: 8px;">' +
            '<div class="form-row" style="margin-bottom: 8px;">' +
                '<div><label style="font-size:12px;">ID профиля</label>' +
                '<input type="text" id="pf_id" value="' + App.UI.escapeHtml(profile.id) + '" placeholder="hogsmeade2" style="font-size:12px;"></div>' +
                '<div><label style="font-size:12px;">Название</label>' +
                '<input type="text" id="pf_name" value="' + App.UI.escapeHtml(profile.name) + '" placeholder="Хогсмид 2" style="font-size:12px;"></div>' +
            '</div>' +
            '<div class="form-row" style="margin-bottom: 8px;">' +
                '<div><label style="font-size:12px;">Иконка (FA класс)</label>' +
                '<input type="text" id="pf_icon" value="' + App.UI.escapeHtml(profile.icon) + '" placeholder="fa-solid fa-tents" style="font-size:12px;"></div>' +
                '<div><label style="font-size:12px;">Поле индекса пользователя</label>' +
                '<select id="pf_userField" style="font-size:12px;">' +
                    '<option value="hogsmeadeId"' + (profile.userField === 'hogsmeadeId' ? ' selected' : '') + '>hogsmeadeId</option>' +
                    '<option value="hogwartsId"' + (profile.userField === 'hogwartsId' ? ' selected' : '') + '>hogwartsId</option>' +
                    '<option value="gryffindorId"' + (profile.userField === 'gryffindorId' ? ' selected' : '') + '>gryffindorId</option>' +
                    '<option value="ravenclawId"' + (profile.userField === 'ravenclawId' ? ' selected' : '') + '>ravenclawId</option>' +
                    '<option value="hufflepuffId"' + (profile.userField === 'hufflepuffId' ? ' selected' : '') + '>hufflepuffId</option>' +
                    '<option value="slytherinId"' + (profile.userField === 'slytherinId' ? ' selected' : '') + '>slytherinId</option>' +
                '</select></div>' +
            '</div>' +
            '<label style="font-size:12px; color:var(--accent);">Шаблон сообщения этого магазина:</label>' +
            '<textarea id="pf_raven_header" rows="3" placeholder="Заголовок..." style="font-size:11px; font-family:monospace; margin-bottom:4px;">' + App.UI.escapeHtml((profile[App.State.currentShop] || {}).header || '') + '</textarea>' +
            '<textarea id="pf_raven_note" rows="2" placeholder="Шаблон записки..." style="font-size:11px; font-family:monospace; margin-bottom:4px;">' + App.UI.escapeHtml((profile[App.State.currentShop] || {}).note || '') + '</textarea>' +
            '<textarea id="pf_raven_footer" rows="2" placeholder="Подвал..." style="font-size:11px; font-family:monospace;">' + App.UI.escapeHtml((profile[App.State.currentShop] || {}).footer || '') + '</textarea>' +
            '<div style="display:flex; gap:8px; margin-top:10px;">' +
                '<button type="button" onclick="App.Templates.saveProfileForm(\'' + App.UI.escapeHtml(profile.id) + '\')">Сохранить</button>' +
                '<button type="button" onclick="document.getElementById(\'profileFormContainer\').innerHTML=\'\'">Отмена</button>' +
            '</div>' +
        '</div>';
    },
    
    saveProfileForm: function(originalId) {
        var id = document.getElementById('pf_id').value.trim();
        var name = document.getElementById('pf_name').value.trim();
        var icon = document.getElementById('pf_icon').value.trim();
        var userField = document.getElementById('pf_userField').value;
        var ravenHeader = document.getElementById('pf_raven_header').value;
        var ravenNote = document.getElementById('pf_raven_note').value;
        var ravenFooter = document.getElementById('pf_raven_footer').value;
        
        if (!/^[a-zA-Z0-9_ -]*$/.test(icon)) { App.UI.showToast('Некорректный класс иконки', true); return; }
        if (!id || !name) { App.UI.showToast('Заполните ID и название!', true); return; }
        
        var profileData = {
            id: id,
            name: name,
            icon: icon || 'fa-solid fa-tents',
            userField: userField,
            raven: { header: ravenHeader, note: ravenNote, productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: ravenFooter },
            peach: { header: ravenHeader, note: ravenNote, productBlock: '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: ravenFooter }
        };
        
        var previous = App.getDeliveryProfiles().find(function(p) { return p.id === originalId; });
        if (previous) profileData = Object.assign({}, previous, profileData);
        delete profileData.raven; delete profileData.peach;
        ['raven', 'peach', 'cafeteria'].forEach(function(shop) {
            if (previous && previous[shop]) profileData[shop] = previous[shop];
        });
        profileData[App.State.currentShop] = { header: ravenHeader, note: ravenNote, productBlock: previous?.[App.State.currentShop]?.productBlock || '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}', footer: ravenFooter };
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) { App.UI.showToast('ID: только латиница, цифры, дефис и подчеркивание', true); return; }
        var existIdx = App.State.deliveryProfiles.findIndex(function(p) { return p.id === originalId || p.id === id; });
        if (existIdx !== -1) {
            App.State.deliveryProfiles[existIdx] = profileData;
        } else {
            App.State.deliveryProfiles.push(profileData);
        }
        
        App.Backup.validateProfiles(App.State.deliveryProfiles);
        App.Storage.saveDeliveryProfiles();
        App.UI.renderModeButtons();
        App.Message.update();
        App.Templates.renderDeliveryProfilesSection();
        document.getElementById('profileFormContainer').innerHTML = '';
        App.UI.showToast('Профиль "' + name + '" сохранён!');
    },
    
    // ==================== ПОКАЗАТЬ ФОРМУ СОЗДАНИЯ ====================
    showTemplateForm: function() {
        document.getElementById('templatesListView').style.display = 'none';
        document.getElementById('templateWizard').classList.remove('hidden');
        App.State.templateWizardStep = 1;
        App.State.editingTemplateId = null;
        App.State.tempTemplate = null; // Очищаем временный шаблон
        App.Templates.initWizard();
    },
    
    // ==================== ИНИЦИАЛИЗАЦИЯ МАСТЕРА ====================
    initWizard: function() {
        if (!App.State.editingTemplateId) {
            App.State.editingTemplateId = 'temp_' + Date.now();
        }
        
        App.Templates.updateWizardStep();
    },
    
    // ==================== ОБНОВЛЕНИЕ ШАГА МАСТЕРА ====================
    updateWizardStep: function() {
        var step = App.State.templateWizardStep;
        
        // Обновляем индикаторы (теперь 3 шага)
        for (var i = 1; i <= 3; i++) {
            var indicator = document.getElementById('wizardStep' + i);
            if (indicator) {
                if (i < step) {
                    indicator.className = 'wizard-step-indicator completed';
                } else if (i === step) {
                    indicator.className = 'wizard-step-indicator active';
                } else {
                    indicator.className = 'wizard-step-indicator';
                }
            }
        }
        
        // Рендерим контент шага
        var content = document.getElementById('wizardContent');
        if (step === 1) {
            content.innerHTML = App.Templates.renderStep1();
        } else if (step === 2) {
            content.innerHTML = App.Templates.renderStep2();
        } else if (step === 3) {
            content.innerHTML = App.Templates.renderStep3();
        }
        
        // Обновляем кнопки
        document.getElementById('wizardPrevBtn').style.display = step === 1 ? 'none' : 'inline-block';
        document.getElementById('wizardNextBtn').style.display = step === 3 ? 'none' : 'inline-block';
        document.getElementById('wizardSaveBtn').style.display = step === 3 ? 'inline-block' : 'none';
    },
    
    // ==================== ШАГ 1: ПОЛЯ ШАБЛОНА ====================
    renderStep1: function() {
        var template = App.Templates.getTempTemplate();
        
        var html = '<div class="wizard-step-content">' +
            '<h4>Шаг 1: Поля карточки товара</h4>' +
            '<p style="opacity: 0.8; margin-bottom: 15px;">Задайте набор полей. На шаге 2 вы настроите как они используются в каталоге и при доставке.</p>' +
            
            '<div class="form-group">' +
            '<label>Название шаблона</label>' +
            '<input type="text" id="wizardTemplateName" value="' + (template.name || '') + '" placeholder="Например: Rich Peach Букеты">' +
            '</div>' +
            
            '<div class="fields-configurator">' +
            '<table class="fields-table">' +
            '<thead><tr>' +
            '<th style="width:36px;">Вкл</th>' +
            '<th>Название поля</th>' +
            '<th style="width:110px;">Тип</th>' +
            '<th>Placeholder</th>' +
            '</tr></thead>' +
            '<tbody>';
        
        // Для каждого поля создаём строку
        template.fields.forEach(function(field, index) {
            html += '<tr>' +
                '<td><input type="checkbox" id="field_enabled_' + index + '" ' + (field.enabled ? 'checked' : '') + '></td>' +
                '<td><input type="text" id="field_name_' + index + '" value="' + App.UI.escapeHtml(field.name) + '"></td>' +
                '<td><select id="field_type_' + index + '">' +
                '<option value="text"' + (field.type === 'text' ? ' selected' : '') + '>Текст</option>' +
                '<option value="textarea"' + (field.type === 'textarea' ? ' selected' : '') + '>Большой текст</option>' +
                '<option value="url"' + (field.type === 'url' ? ' selected' : '') + '>URL</option>' +
                '<option value="number"' + (field.type === 'number' ? ' selected' : '') + '>Число</option>' +
                '</select></td>' +
                '<td><input type="text" id="field_placeholder_' + index + '" value="' + App.UI.escapeHtml(field.placeholder || '') + '"></td>' +
                '</tr>';
        });
        
        html += '</tbody></table></div></div>';
        
        return html;
    },
    
    // ==================== ШАГ 2: ОФОРМЛЕНИЕ ПО КОНТЕКСТАМ ====================
    renderStep2: function() {
        var template = App.Templates.getTempTemplate();
        var profiles = App.getDeliveryProfiles();
        
        // Список всех включённых полей — для подсказки плейсхолдеров
        var enabledFields = template.fields.filter(function(f) { return f.enabled; });
        var placeholderHint = '{{name}}, ' + enabledFields.map(function(f) {
            return '<code>{{' + f.id + '}}</code>';
        }).join(', ');
        
        // Контексты: каталог + один на каждый профиль доставки
        var contexts = [{ id: 'catalog', label: '📦 Каталог', icon: 'fa-table-cells', isDelivery: false }];
        profiles.forEach(function(p) {
            contexts.push({ id: 'delivery_' + p.id, label: '📬 ' + p.name, icon: p.icon, isDelivery: true, profileId: p.id });
        });
        
        // Убеждаемся что у шаблона есть структура contexts
        if (!template.contexts) template.contexts = {};
        contexts.forEach(function(ctx) {
            if (!template.contexts[ctx.id]) {
                template.contexts[ctx.id] = {
                    cardTemplate: ctx.id === 'catalog'
                        ? (template.productCardTemplate || App.Config.DEFAULT_CATALOG_CARD_TEMPLATE)
                        : (template.productCardTemplate || App.Config.DEFAULT_PRODUCT_CARD_TEMPLATE),
                    optionalFields: {
                        label: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.label },
                        note1: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.note1 },
                        note2: { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES.note2 }
                    }
                };
            }
        });
        
        // Запоминаем активную вкладку
        var activeCtxId = App.State._step2ActiveCtx || contexts[0].id;
        App.State._step2ActiveCtx = activeCtxId;
        
        var html = '<div class="wizard-step-content">' +
            '<h4>Шаг 2: Оформление по контекстам</h4>' +
            '<p style="opacity:0.8; margin-bottom:12px;">Каждый контекст — отдельный BB-код. Используйте только нужные плейсхолдеры.</p>' +
            '<div class="placeholder-hint" style="margin-bottom:14px;">' +
            '<strong>Доступные плейсхолдеры:</strong> ' + placeholderHint +
            '</div>' +
            // Вкладки
            '<div class="ctx-tabs">';
        
        contexts.forEach(function(ctx) {
            var isActive = ctx.id === activeCtxId;
            html += '<button type="button" class="ctx-tab' + (isActive ? ' active' : '') + '" ' +
                'onclick="App.Templates.switchCtxTab(\'' + ctx.id + '\')">' +
                '<i class="' + (ctx.isDelivery ? ctx.icon : 'fa-solid fa-table-cells') + '"></i> ' +
                App.UI.escapeHtml(ctx.label.replace(/^📦 |^📬 /, '')) +
                '</button>';
        });
        html += '</div>'; // ctx-tabs
        
        // Содержимое каждой вкладки
        contexts.forEach(function(ctx) {
            var isActive = ctx.id === activeCtxId;
            var ctxData = template.contexts[ctx.id];
            
            html += '<div class="ctx-tab-content' + (isActive ? ' active' : '') + '" id="ctx_content_' + ctx.id + '">';
            
            // BB-код карточки
            html += '<div class="form-group">' +
                '<label>BB-код карточки товара</label>' +
                '<textarea id="ctx_card_' + ctx.id + '" rows="10" ' +
                'style="font-family:monospace; font-size:12px;" ' +
                'placeholder="BB-код карточки товара...">' +
                App.UI.escapeHtml(ctxData.cardTemplate || '') +
                '</textarea>';
            
            if (!ctx.isDelivery) {
                html += '<small style="opacity:0.7;">В каталоге — обычно без типа товара, без этикетки и маркеров. Только визуал.</small>';
            } else {
                html += '<small style="opacity:0.7;">В доставке — карточка товара без шапки/записки. Шапка берётся из профиля "' + App.UI.escapeHtml(ctx.label.replace(/^📬 /, '')) + '".</small>';
            }
            html += '</div>';
            
            // Опциональные поля — только для доставки
            if (ctx.isDelivery) {
                html += '<div class="optional-fields-section">' +
                    '<h5 style="color:var(--accent); margin:16px 0 8px;">Опциональные поля</h5>' +
                    '<p style="opacity:0.7; font-size:13px; margin-bottom:12px;">Добавляются после карточки если заполнены. BB-код может отличаться для каждого режима доставки.</p>';
                
                ['label', 'note1', 'note2'].forEach(function(fieldId) {
                    var fieldNames = { label: 'Этикетка', note1: 'Примечание 1', note2: 'Примечание 2' };
                    var optData = ctxData.optionalFields && ctxData.optionalFields[fieldId]
                        ? ctxData.optionalFields[fieldId]
                        : { enabled: false, template: App.Config.DEFAULT_FIELD_TEMPLATES[fieldId] };
                    
                    var cbId = 'opt_' + ctx.id + '_' + fieldId + '_enabled';
                    var taId = 'opt_' + ctx.id + '_' + fieldId + '_template';
                    
                    html += '<div class="optional-field-item">' +
                        '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">' +
                        '<input type="checkbox" id="' + cbId + '" ' + (optData.enabled ? 'checked' : '') +
                        ' onchange="App.Templates.toggleOptField(\'' + ctx.id + '\',\'' + fieldId + '\')">' +
                        '<strong>' + fieldNames[fieldId] + '</strong>' +
                        '</label>' +
                        '<div id="opt_' + ctx.id + '_' + fieldId + '_wrap" style="' + (optData.enabled ? '' : 'display:none;') + ' margin-top:8px;">' +
                        '<textarea id="' + taId + '" rows="2" style="font-family:monospace; font-size:11px; width:100%;">' +
                        App.UI.escapeHtml(optData.template || App.Config.DEFAULT_FIELD_TEMPLATES[fieldId]) +
                        '</textarea>' +
                        '<small style="opacity:0.7;">Используйте {{' + fieldId + '}} для вставки значения</small>' +
                        '</div>' +
                        '</div>';
                });
                
                html += '</div>';
            }
            
            html += '</div>'; // ctx-tab-content
        });
        
        html += '</div>'; // wizard-step-content
        return html;
    },
    
    // Переключение вкладки контекста на шаге 2
    switchCtxTab: function(ctxId) {
        App.Templates.saveStep2Data(); // сохраняем текущую перед переключением
        App.State._step2ActiveCtx = ctxId;
        
        document.querySelectorAll('.ctx-tab').forEach(function(btn) { btn.classList.remove('active'); });
        document.querySelectorAll('.ctx-tab-content').forEach(function(el) { el.classList.remove('active'); });
        
        var activeBtn = Array.from(document.querySelectorAll('.ctx-tab')).find(function(btn) {
            return btn.textContent.trim() && btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(ctxId);
        });
        if (activeBtn) activeBtn.classList.add('active');
        
        var activeContent = document.getElementById('ctx_content_' + ctxId);
        if (activeContent) activeContent.classList.add('active');
    },
    
    // Переключение опционального поля на шаге 2
    toggleOptField: function(ctxId, fieldId) {
        var cb = document.getElementById('opt_' + ctxId + '_' + fieldId + '_enabled');
        var wrap = document.getElementById('opt_' + ctxId + '_' + fieldId + '_wrap');
        if (cb && wrap) wrap.style.display = cb.checked ? 'block' : 'none';
    },
    
    // Сохранение данных шага 2 (вызывается при переключении вкладки и при переходе на следующий шаг)
    saveStep2Data: function() {
        var template = App.Templates.getTempTemplate();
        if (!template.contexts) return;
        
        Object.keys(template.contexts).forEach(function(ctxId) {
            var cardTA = document.getElementById('ctx_card_' + ctxId);
            if (cardTA) template.contexts[ctxId].cardTemplate = cardTA.value;
            
            // Опциональные поля
            var ctxData = template.contexts[ctxId];
            if (!ctxData.optionalFields) ctxData.optionalFields = {};
            
            ['label', 'note1', 'note2'].forEach(function(fieldId) {
                var cb = document.getElementById('opt_' + ctxId + '_' + fieldId + '_enabled');
                var ta = document.getElementById('opt_' + ctxId + '_' + fieldId + '_template');
                if (cb || ta) {
                    ctxData.optionalFields[fieldId] = {
                        enabled: cb ? cb.checked : false,
                        template: ta ? ta.value : (App.Config.DEFAULT_FIELD_TEMPLATES[fieldId] || '')
                    };
                }
            });
        });
        
        App.State.tempTemplate = template;
    },
    
    // ==================== ПЕРЕКЛЮЧЕНИЕ ОПЦИОНАЛЬНОГО ПОЛЯ (legacy) ====================
    toggleOptionalField: function(fieldId) {
        var checkbox = document.getElementById('optional_' + fieldId + '_enabled');
        var content = document.getElementById('optional_' + fieldId + '_content');
        if (checkbox && content) content.style.display = checkbox.checked ? 'block' : 'none';
    },
    
    // ==================== ПОЛУЧИТЬ ВРЕМЕННЫЙ ШАБЛОН ====================
    getTempTemplate: function() {
        if (!App.State.tempTemplate) {
            if (App.State.editingTemplateId && !App.State.editingTemplateId.startsWith('temp_')) {
                var existing = App.Templates.getById(App.State.editingTemplateId);
                if (existing) {
                    App.State.tempTemplate = JSON.parse(JSON.stringify(existing));
                    // Добавляем contexts если их нет (миграция старых шаблонов)
                    if (!App.State.tempTemplate.contexts) {
                        App.State.tempTemplate.contexts = App.Config.makeDefaultContexts(App.getDeliveryProfiles());
                        // Перенос старого productCardTemplate
                        if (existing.productCardTemplate) {
                            Object.keys(App.State.tempTemplate.contexts).forEach(function(ctxId) {
                                App.State.tempTemplate.contexts[ctxId].cardTemplate = existing.productCardTemplate;
                            });
                        }
                        // Перенос старых optionalFields
                        if (existing.optionalFields) {
                            Object.keys(App.State.tempTemplate.contexts).forEach(function(ctxId) {
                                if (ctxId !== 'catalog') {
                                    App.State.tempTemplate.contexts[ctxId].optionalFields = JSON.parse(JSON.stringify(existing.optionalFields));
                                }
                            });
                        }
                    }
                    return App.State.tempTemplate;
                }
            }
            
            // Новый шаблон
            App.State.tempTemplate = {
                id: App.State.editingTemplateId,
                name: '',
                fields: JSON.parse(JSON.stringify(App.Config.DEFAULT_TEMPLATE_FIELDS)),
                contexts: App.Config.makeDefaultContexts(App.getDeliveryProfiles())
            };
        }
        
        // Убеждаемся что contexts есть всегда
        if (!App.State.tempTemplate.contexts) {
            App.State.tempTemplate.contexts = App.Config.makeDefaultContexts(App.getDeliveryProfiles());
        }
        
        return App.State.tempTemplate;
    },
    
    // ==================== ШАГ 3: ПРЕДПРОСМОТР ====================
    renderStep3: function() {
        var template = App.Templates.getTempTemplate();
        var profiles = App.getDeliveryProfiles();
        
        var contexts = [{ id: 'catalog', label: 'Каталог', isDelivery: false }];
        profiles.forEach(function(p) {
            contexts.push({ id: 'delivery_' + p.id, label: p.name, isDelivery: true, profile: p });
        });
        
        var activeCtxId = App.State._step3ActiveCtx || contexts[0].id;
        App.State._step3ActiveCtx = activeCtxId;
        
        // Пример данных для предпросмотра
        var exampleData = { name: '«ПРИМЕР ТОВАРА»' };
        template.fields.forEach(function(f) {
            if (f.enabled) exampleData[f.id] = '[' + f.name.toUpperCase() + ']';
        });
        exampleData.image = 'https://via.placeholder.com/300x300?text=Фото';
        exampleData.label = '[ТЕКСТ ЭТИКЕТКИ]';
        exampleData.note1 = '[ПРИМЕЧАНИЕ 1]';
        exampleData.note2 = '[ПРИМЕЧАНИЕ 2]';
        
        var html = '<div class="wizard-step-content">' +
            '<h4>Шаг 3: Предпросмотр</h4>' +
            '<p style="opacity:0.8; margin-bottom:12px;">Проверьте итоговый BB-код для каждого контекста. Можно редактировать прямо здесь — изменения сохранятся.</p>' +
            '<div class="ctx-tabs">';
        
        contexts.forEach(function(ctx) {
            var isActive = ctx.id === activeCtxId;
            html += '<button type="button" class="ctx-tab' + (isActive ? ' active' : '') + '" ' +
                'onclick="App.Templates.switchStep3Tab(\'' + ctx.id + '\')">' + ctx.label + '</button>';
        });
        html += '</div>';
        
        contexts.forEach(function(ctx) {
            var isActive = ctx.id === activeCtxId;
            var ctxData = (template.contexts && template.contexts[ctx.id]) || {};
            var cardTemplate = ctxData.cardTemplate || '';
            
            // Строим полный BB-код для предпросмотра
            var preview = '';
            
            if (!ctx.isDelivery) {
                // Каталог — только карточка
                preview = App.Templates._applyExampleData(cardTemplate, exampleData, template.fields);
            } else {
                // Доставка — шапка профиля + карточка + опциональные поля
                var profile = ctx.profile;
                var shopTemplate = profile ? (profile[App.State.currentShop] || {}) : {};
                
                if (shopTemplate.header) {
                    preview += shopTemplate.header
                        .replace(/\{\{RECIPIENT\}\}/g, '[mention=000]Получатель[/mention]')
                        .replace(/\{\{SENDER\}\}/g, '[mention=000]Отправитель[/mention]');
                }
                if (shopTemplate.note) {
                    preview += shopTemplate.note.replace(/\{\{NOTE\}\}/g, 'Текст записки');
                }
                
                var card = App.Templates._applyExampleData(cardTemplate, exampleData, template.fields);
                var labelBB = '', note1BB = '', note2BB = '';
                
                if (ctxData.optionalFields) {
                    if (ctxData.optionalFields.label && ctxData.optionalFields.label.enabled) {
                        labelBB = ctxData.optionalFields.label.template.replace(/\{\{label\}\}/g, exampleData.label);
                    }
                    if (ctxData.optionalFields.note1 && ctxData.optionalFields.note1.enabled) {
                        note1BB = ctxData.optionalFields.note1.template.replace(/\{\{note1\}\}/g, exampleData.note1);
                    }
                    if (ctxData.optionalFields.note2 && ctxData.optionalFields.note2.enabled) {
                        note2BB = ctxData.optionalFields.note2.template.replace(/\{\{note2\}\}/g, exampleData.note2);
                    }
                }
                
                var productBlock = shopTemplate.productBlock || '{{PRODUCT}}\n\n{{LABEL}}{{NOTE1}}{{NOTE2}}';
                preview += productBlock
                    .replace(/\{\{PRODUCT\}\}/g, card)
                    .replace(/\{\{LABEL\}\}/g, labelBB)
                    .replace(/\{\{NOTE1\}\}/g, note1BB)
                    .replace(/\{\{NOTE2\}\}/g, note2BB);
                
                if (shopTemplate.footer) preview += shopTemplate.footer;
            }
            
            html += '<div class="ctx-tab-content' + (isActive ? ' active' : '') + '" id="step3_content_' + ctx.id + '">' +
                '<textarea readonly id="step3_preview_' + ctx.id + '" rows="20" ' +
                'style="font-family:monospace; font-size:11px; width:100%;">' +
                App.UI.escapeHtml(preview) +
                '</textarea>' +
                '<small style="opacity:0.7;">проверочный пример. оформление меняется на шаге 2, шапка — в профиле доставки. Изменения сохранятся в шаблоне.</small>' +
                '</div>';
        });
        
        html += '</div>';
        return html;
    },
    
    // Применить пример данных к BB-коду карточки
    _applyExampleData: function(cardTemplate, exampleData, fields) {
        var result = cardTemplate.replace(/\{\{name\}\}/g, exampleData.name);
        if (fields) {
            fields.forEach(function(f) {
                if (f.enabled) {
                    result = result.replace(new RegExp('\\{\\{' + f.id + '\\}\\}', 'g'), exampleData[f.id] || '');
                }
            });
        }
        return result;
    },
    
    switchStep3Tab: function(ctxId) {
        App.State._step3ActiveCtx = ctxId;
        document.querySelectorAll('#wizardContent .ctx-tab').forEach(function(btn) { btn.classList.remove('active'); });
        document.querySelectorAll('#wizardContent .ctx-tab-content').forEach(function(el) { el.classList.remove('active'); });
        
        // Найти кнопку по onclick
        var btns = document.querySelectorAll('#wizardContent .ctx-tab');
        btns.forEach(function(btn) {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(ctxId)) btn.classList.add('active');
        });
        var cont = document.getElementById('step3_content_' + ctxId);
        if (cont) cont.classList.add('active');
    },
    
    // ==================== НАВИГАЦИЯ МАСТЕРА ====================
    nextStep: function() {
        // Сохраняем данные текущего шага
        App.Templates.saveStepData();
        
        if (App.State.templateWizardStep < 3) {
            App.State.templateWizardStep++;
            App.Templates.updateWizardStep();
        }
    },
    
    prevStep: function() {
        if (App.State.templateWizardStep > 1) {
            App.State.templateWizardStep--;
            App.Templates.updateWizardStep();
        }
    },
    
    goToStep: function(step) {
        if (step >= 1 && step <= 3) {
            App.Templates.saveStepData();
            App.State.templateWizardStep = step;
            App.Templates.updateWizardStep();
        }
    },
    
    // ==================== СОХРАНЕНИЕ ДАННЫХ ШАГА ====================
    saveStepData: function() {
        var step = App.State.templateWizardStep;
        var template = App.Templates.getTempTemplate();
        
        if (step === 1) {
            var nameInput = document.getElementById('wizardTemplateName');
            if (nameInput) template.name = nameInput.value.trim();
            
            template.fields.forEach(function(field, index) {
                var enabledCb  = document.getElementById('field_enabled_'     + index);
                var nameInp    = document.getElementById('field_name_'        + index);
                var typeSelect = document.getElementById('field_type_'        + index);
                var phInput    = document.getElementById('field_placeholder_' + index);
                
                if (enabledCb)  field.enabled     = enabledCb.checked;
                if (nameInp)    field.name        = nameInp.value;
                if (typeSelect) field.type        = typeSelect.value;
                if (phInput)    field.placeholder = phInput.value;
            });
            
        } else if (step === 2) {
            App.Templates.saveStep2Data();
            
        } else if (step === 3) {
            // Сохраняем отредактированные BB-коды из textarea предпросмотра обратно в contexts
            if (template.contexts) {
                Object.keys(template.contexts).forEach(function(ctxId) {
                    var ta = document.getElementById('step3_preview_' + ctxId);
                    if (!ta) return;
                    // Пытаемся извлечь карточку товара из отредактированного текста
                    // Для простоты: сохраняем весь отредактированный блок как fullPreview
                    template.contexts[ctxId].fullPreview = ta.value;
                });
            }
        }
        
        App.State.tempTemplate = template;
    },
    
    // ==================== СОХРАНЕНИЕ ШАБЛОНА ====================
    saveTemplate: function() {
        App.Templates.saveStepData();
        var template = App.State.tempTemplate;
        
        
        // Проверка
        if (!template || !template.name || template.name.trim() === '') {
            console.error('Нет названия шаблона!');
            App.UI.showToast('Введите название шаблона!', true);
            App.State.templateWizardStep = 1;
            App.Templates.updateWizardStep();
            return;
        }
        
        
        // Добавляем дефолтные шаблоны доставки (на основе магазина)
        template.deliveryTemplates = App.Config.DEFAULT_DELIVERY_TEMPLATES;
        
        // Если это новый шаблон
        if (!template.id || template.id.startsWith('temp_')) {
            template.id = 'template_' + Date.now();
            App.State.templates.push(template);
        } else {
            // Обновляем существующий
            var index = App.State.templates.findIndex(function(t) { return t.id === template.id; });
            if (index !== -1) {
                App.State.templates[index] = template;
            } else {
                // На всякий случай добавляем как новый
                template.id = 'template_' + Date.now();
                App.State.templates.push(template);
            }
        }
        
        App.Storage.saveTemplates();
        App.Templates.updateSelects();
        App.UI.showToast('Шаблон "' + template.name + '" сохранён!');
        App.Templates.cancelWizard();
        App.Templates.renderList();
    },
    
    // ==================== ОТМЕНА МАСТЕРА ====================
    cancelWizard: function() {
        document.getElementById('templateWizard').classList.add('hidden');
        document.getElementById('templatesListView').style.display = 'block';
        App.State.templateWizardStep = 1;
        App.State.editingTemplateId = null;
        App.State.tempTemplate = null; // Очищаем временный шаблон
    },
    
    // ==================== РЕДАКТИРОВАНИЕ ====================
    edit: function(id) {
        App.State.editingTemplateId = id;
        App.State.templateWizardStep = 1;
        App.State.tempTemplate = null; // Очищаем, чтобы загрузился нужный шаблон
        document.getElementById('templatesListView').style.display = 'none';
        document.getElementById('templateWizard').classList.remove('hidden');
        App.Templates.updateWizardStep();
    },
    
    // ==================== УДАЛЕНИЕ ====================
    delete: function(id) {
        if (App.State.products.some(function(p) { return p.templateId === id; })) { App.UI.showToast('Этот шаблон используется товарами. Сначала смените их шаблон.', true); return; }
        if (confirm('Удалить этот шаблон?')) {
            App.State.templates = App.State.templates.filter(function(t) { return t.id !== id; });
            App.Storage.saveTemplates();
            App.Templates.updateSelects();
            App.Templates.renderList();
            App.UI.showToast('Шаблон удалён');
        }
    },
    
    // ==================== ИМПОРТ/ЭКСПОРТ ====================
    download: function() {
        var dataStr = JSON.stringify(App.State.templates, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'templates_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        App.UI.showToast('Шаблоны скачаны!');
    },
    
    upload: function(event) {
        var file = event.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var uploaded = JSON.parse(e.target.result);
                if (!Array.isArray(uploaded)) {
                    throw new Error('Файл должен содержать массив');
                }
                
                if (confirm('Загрузить ' + uploaded.length + ' шаблонов? Текущие шаблоны будут заменены.')) {
                    uploaded = App.Backup.validateTemplates(uploaded);
                    App.Storage.write('TEMPLATES', uploaded);
                    App.State.templates = uploaded;
                    App.Storage.saveTemplates();
                    App.Templates.updateSelects();
                    App.Templates.renderList();
                    App.UI.showToast('Шаблоны загружены!');
                }
            } catch (error) {
                App.UI.showToast('Ошибка: ' + error.message, true);
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};

function openTemplatesModal() { App.Templates.openModal(); }
function closeTemplatesModal() { App.Templates.closeModal(); }
function showTemplateForm() { App.Templates.showTemplateForm(); }
function downloadTemplates() { App.Templates.download(); }
function uploadTemplates(event) { App.Templates.upload(event); }

