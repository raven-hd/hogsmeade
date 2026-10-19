/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Модуль работы с пользователями (6 режимов)
 */

App.Users = {
    
    // ==================== DATALIST ====================
    updateDatalist: function() {
        var datalist = document.getElementById('usersList');
        if (datalist) {
            datalist.innerHTML = App.State.users.map(function(u) {
                return '<option value="' + App.UI.escapeHtml(u.name) + '">';
            }).join('');
        }
    },
    
    // ==================== BB-КОД ПОЛЬЗОВАТЕЛЯ ====================
    getBBCode: function(name) {
        var user = App.State.users.find(function(u) {
            return u.name.toLowerCase() === name.toLowerCase();
        });
        if (!user) return null;
        
        var profile = App.getCurrentDeliveryProfile();
        var userField = profile ? profile.userField : App.getCurrentMode().userField;
        var userId = user[userField];
        
        if (!userId) return null;
        
        return '[mention=' + userId + ']' + user.name + '[/mention]';
    },
    
    // Проверить, есть ли у пользователя индекс для текущего профиля доставки
    checkUserHasProfileId: function(userName) {
        var user = App.State.users.find(function(u) {
            return u.name.toLowerCase() === userName.toLowerCase();
        });
        if (!user) return { found: false };
        
        var profile = App.getCurrentDeliveryProfile();
        var userField = profile ? profile.userField : App.getCurrentMode().userField;
        var userId = user[userField];
        
        return {
            found: true,
            hasId: !!userId,
            userId: userId || '',
            profileName: profile ? profile.name : App.getCurrentMode().name,
            userField: userField
        };
    },
    
    // ==================== ПОЛУЧЕНИЕ BB-КОДА С КАСТОМНЫМ ИМЕНЕМ ====================
    getBBCodeWithCustomName: function(userId, customName) {
        if (!userId || !customName) return null;
        return '[mention=' + userId + ']' + customName + '[/mention]';
    },
    
    // ==================== ОБРАБОТКА ВВОДА ПОЛУЧАТЕЛЯ ====================
    onRecipientInput: function() {
        var input = document.getElementById('recipient');
        var value = input.value.trim();
        var currentId = document.getElementById('recipientId').value;
        
        if (currentId) {
            // Уже есть ID — просто показываем подсказку
            var hintEl = document.getElementById('recipientHint');
            hintEl.textContent = '✓ Найден в базе (ID: ' + currentId + '). Можете изменить падеж.';
            hintEl.style.display = 'block';
            hintEl.style.color = '#4CAF50';
        } else if (value.length > 2) {
            var user = App.State.users.find(function(u) {
                return u.name.toLowerCase() === value.toLowerCase();
            });
            
            if (user) {
                var check = App.Users.checkUserHasProfileId(value);
                if (check.hasId) {
                    document.getElementById('recipientId').value = check.userId;
                    var hintEl = document.getElementById('recipientHint');
                    hintEl.textContent = '✓ Найден в базе (ID: ' + check.userId + '). Можете изменить падеж.';
                    hintEl.style.display = 'block';
                    hintEl.style.color = '#4CAF50';
                } else {
                    // Пользователь есть, но нет индекса для этого профиля
                    var hintEl = document.getElementById('recipientHint');
                    hintEl.innerHTML = '⚠ Пользователь найден, но у него нет индекса для профиля <b>' + App.UI.escapeHtml(check.profileName) + '</b>. ' +
                        'Нужно добавить поле <b>' + check.userField + '</b>. ' +
                        '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(user.name) + '\'); return false;">Исправить →</a>';
                    hintEl.style.display = 'block';
                    hintEl.style.color = '#E8A87C';
                }
            } else {
                var hintEl = document.getElementById('recipientHint');
                hintEl.innerHTML = '⚠ Не найден в базе. ' +
                    '<a href="#" onclick="App.Users.openModalAndPrefill(\'' + App.UI.escapeHtml(value) + '\'); return false;">Добавить →</a>';
                hintEl.style.display = 'block';
                hintEl.style.color = '#E8A87C';
            }
        } else {
            document.getElementById('recipientHint').style.display = 'none';
        }
        
        if (App.State.catalogMode === 'delivery') App.Message.update();
        App.Users.updateDeliveryAddressBar();
    },
    
    onRecipientSelect: function() {
        var input = document.getElementById('recipient');
        var value = input.value.trim();
        
        var check = App.Users.checkUserHasProfileId(value);
        
        if (check.found) {
            if (check.hasId) {
                document.getElementById('recipientId').value = check.userId;
                var hintEl = document.getElementById('recipientHint');
                hintEl.textContent = '✓ Найден в базе (ID: ' + check.userId + '). Можете изменить падеж.';
                hintEl.style.display = 'block';
                hintEl.style.color = '#4CAF50';
            } else {
                var user = App.State.users.find(function(u) { return u.name.toLowerCase() === value.toLowerCase(); });
                var hintEl = document.getElementById('recipientHint');
                hintEl.innerHTML = '⚠ Пользователь найден, но у него нет индекса для профиля <b>' + App.UI.escapeHtml(check.profileName) + '</b>. ' +
                    '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(user ? user.name : value) + '\'); return false;">Исправить →</a>';
                hintEl.style.display = 'block';
                hintEl.style.color = '#E8A87C';
            }
        }
        
        if (App.State.catalogMode === 'delivery') App.Message.update();
        App.Users.updateDeliveryAddressBar();
    },
    
    // Функция для сброса ID (вызывается при желании выбрать другого пользователя)
    resetRecipient: function() {
        document.getElementById('recipientId').value = '';
        document.getElementById('recipientHint').style.display = 'none';
        document.getElementById('recipient').value = '';
        document.getElementById('recipient').focus();
        App.Users.updateDeliveryAddressBar();
    },
    
    // ==================== ОБРАБОТКА ВВОДА ОТПРАВИТЕЛЯ ====================
    onSenderInput: function() {
        var input = document.getElementById('sender');
        var value = input.value.trim();
        var currentId = document.getElementById('senderId').value;
        
        if (currentId) {
            var hintEl = document.getElementById('senderHint');
            hintEl.textContent = '✓ Найден в базе (ID: ' + currentId + '). Можете изменить падеж.';
            hintEl.style.display = 'block';
            hintEl.style.color = '#4CAF50';
        } else if (value.length > 2) {
            var user = App.State.users.find(function(u) {
                return u.name.toLowerCase() === value.toLowerCase();
            });
            
            if (user) {
                var check = App.Users.checkUserHasProfileId(value);
                if (check.hasId) {
                    document.getElementById('senderId').value = check.userId;
                    var hintEl = document.getElementById('senderHint');
                    hintEl.textContent = '✓ Найден в базе (ID: ' + check.userId + '). Можете изменить падеж.';
                    hintEl.style.display = 'block';
                    hintEl.style.color = '#4CAF50';
                } else {
                    var hintEl = document.getElementById('senderHint');
                    hintEl.innerHTML = '⚠ Пользователь найден, но у него нет индекса для профиля <b>' + App.UI.escapeHtml(check.profileName) + '</b>. ' +
                        '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(user.name) + '\'); return false;">Исправить →</a>';
                    hintEl.style.display = 'block';
                    hintEl.style.color = '#E8A87C';
                }
            } else {
                var hintEl = document.getElementById('senderHint');
                hintEl.innerHTML = '⚠ Не найден в базе. ' +
                    '<a href="#" onclick="App.Users.openModalAndPrefill(\'' + App.UI.escapeHtml(value) + '\'); return false;">Добавить →</a>';
                hintEl.style.display = 'block';
                hintEl.style.color = '#E8A87C';
            }
        } else {
            document.getElementById('senderHint').style.display = 'none';
        }
        
        if (App.State.catalogMode === 'delivery') App.Message.update();
    },
    
    onSenderSelect: function() {
        var input = document.getElementById('sender');
        var value = input.value.trim();
        
        var check = App.Users.checkUserHasProfileId(value);
        
        if (check.found) {
            if (check.hasId) {
                document.getElementById('senderId').value = check.userId;
                var hintEl = document.getElementById('senderHint');
                hintEl.textContent = '✓ Найден в базе (ID: ' + check.userId + '). Можете изменить падеж.';
                hintEl.style.display = 'block';
                hintEl.style.color = '#4CAF50';
            } else {
                var user = App.State.users.find(function(u) { return u.name.toLowerCase() === value.toLowerCase(); });
                var hintEl = document.getElementById('senderHint');
                hintEl.innerHTML = '⚠ Пользователь найден, но у него нет индекса для профиля <b>' + App.UI.escapeHtml(check.profileName) + '</b>. ' +
                    '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(user ? user.name : value) + '\'); return false;">Исправить →</a>';
                hintEl.style.display = 'block';
                hintEl.style.color = '#E8A87C';
            }
        }
        
        if (App.State.catalogMode === 'delivery') App.Message.update();
    },
    
    // Функция для сброса ID отправителя
    resetSender: function() {
        document.getElementById('senderId').value = '';
        document.getElementById('senderHint').style.display = 'none';
        document.getElementById('sender').value = '';
        document.getElementById('sender').focus();
    },
    
    // ==================== МОДАЛЬНОЕ ОКНО ====================
    openModal: function() {
        App.Users.renderList();
        document.getElementById('usersModal').classList.remove('hidden');
    },
    
    closeModal: function() {
        document.getElementById('usersModal').classList.add('hidden');
        App.Users.cancelEdit();
    },
    
    // Перечитать подсказки полей после смены профиля
    refreshFieldHints: function() {
        var recipientInput = document.getElementById('recipient');
        var senderInput = document.getElementById('sender');
        
        // Сбрасываем сохранённые ID — они могли быть от другого профиля
        var recipientId = document.getElementById('recipientId');
        var senderId = document.getElementById('senderId');
        
        if (recipientInput && recipientInput.value.trim()) {
            // Пересчитываем ID для нового профиля
            var rName = recipientInput.value.trim();
            var rCheck = App.Users.checkUserHasProfileId(rName);
            if (rCheck.found) {
                if (rCheck.hasId) {
                    if (recipientId) recipientId.value = rCheck.userId;
                    var hintEl = document.getElementById('recipientHint');
                    if (hintEl) {
                        hintEl.textContent = '✓ ID обновлён для профиля ' + App.UI.escapeHtml(rCheck.profileName) + ' (ID: ' + rCheck.userId + ')';
                        hintEl.style.display = 'block';
                        hintEl.style.color = '#4CAF50';
                    }
                } else {
                    if (recipientId) recipientId.value = '';
                    var hintEl = document.getElementById('recipientHint');
                    if (hintEl) {
                        hintEl.innerHTML = '⚠ У пользователя нет индекса для профиля <b>' + App.UI.escapeHtml(rCheck.profileName) + '</b>. ' +
                            '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(rName) + '\'); return false;">Исправить →</a>';
                        hintEl.style.display = 'block';
                        hintEl.style.color = '#E8A87C';
                    }
                }
            }
        }
        
        if (senderInput && senderInput.value.trim()) {
            var sName = senderInput.value.trim();
            var sCheck = App.Users.checkUserHasProfileId(sName);
            if (sCheck.found) {
                if (sCheck.hasId) {
                    if (senderId) senderId.value = sCheck.userId;
                    var hintEl = document.getElementById('senderHint');
                    if (hintEl) {
                        hintEl.textContent = '✓ ID обновлён для профиля ' + App.UI.escapeHtml(sCheck.profileName) + ' (ID: ' + sCheck.userId + ')';
                        hintEl.style.display = 'block';
                        hintEl.style.color = '#4CAF50';
                    }
                } else {
                    if (senderId) senderId.value = '';
                    var hintEl = document.getElementById('senderHint');
                    if (hintEl) {
                        hintEl.innerHTML = '⚠ У пользователя нет индекса для профиля <b>' + App.UI.escapeHtml(sCheck.profileName) + '</b>. ' +
                            '<a href="#" onclick="App.Users.openModalForEdit(\'' + App.UI.escapeHtml(sName) + '\'); return false;">Исправить →</a>';
                        hintEl.style.display = 'block';
                        hintEl.style.color = '#E8A87C';
                    }
                }
            }
        }
        App.Users.updateDeliveryAddressBar();
    },
    
    // Открыть базу и сразу перейти к редактированию пользователя по имени
    openModalForEdit: function(name) {
        App.Users.openModal();
        var idx = App.State.users.findIndex(function(u) {
            return u.name.toLowerCase() === name.toLowerCase();
        });
        if (idx !== -1) {
            App.Users.edit(idx);
            // Прокручиваем к форме
            setTimeout(function() {
                var nameInput = document.getElementById('newUserName');
                if (nameInput) nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    },
    
    // Открыть базу и подставить имя для нового пользователя
    openModalAndPrefill: function(name) {
        App.Users.openModal();
        var nameInput = document.getElementById('newUserName');
        if (nameInput) {
            nameInput.value = name;
            nameInput.focus();
            // Подчёркиваем что имя уже заполнено
            nameInput.style.borderColor = '#D6B891';
            setTimeout(function() { nameInput.style.borderColor = ''; }, 2000);
        }
    },
    
    // ==================== РЕНДЕРИНГ СПИСКА ====================
    _sortAlpha: false,
    
    toggleSort: function() {
        App.Users._sortAlpha = !App.Users._sortAlpha;
        var btn = document.getElementById('userSortBtn');
        if (btn) btn.classList.toggle('active', App.Users._sortAlpha);
        App.Users.renderList();
    },
    
    filterList: function() {
        App.Users.renderList();
    },
    
    renderList: function() {
        var container = document.getElementById('usersListModal');
        if (!container) return;
        
        var query = '';
        var searchInput = document.getElementById('userSearchInput');
        if (searchInput) query = searchInput.value.trim().toLowerCase();
        
        var users = App.State.users.slice();
        
        // Фильтрация
        if (query) {
            users = users.map(function(u, i) { return { user: u, idx: i }; })
                .filter(function(item) { return item.user.name.toLowerCase().includes(query); });
        } else {
            users = users.map(function(u, i) { return { user: u, idx: i }; });
        }
        
        // Сортировка
        if (App.Users._sortAlpha) {
            users.sort(function(a, b) { return a.user.name.localeCompare(b.user.name, 'ru'); });
        }
        
        if (users.length === 0) {
            container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;">' +
                (query ? 'Ничего не найдено' : 'Пользователей пока нет') + '</div>';
            return;
        }
        
        var html = '';
        users.forEach(function(item) {
            var user = item.user;
            var index = item.idx;
            
            var ids = [];
            if (user.hogsmeadeId) ids.push('Хогсм: ' + user.hogsmeadeId);
            if (user.hogwartsId)  ids.push('Хогв: '  + user.hogwartsId);
            if (user.gryffindorId) ids.push('Гриф: ' + user.gryffindorId);
            if (user.ravenclawId)  ids.push('Когт: '  + user.ravenclawId);
            if (user.hufflepuffId) ids.push('Пуфф: ' + user.hufflepuffId);
            if (user.slytherinId)  ids.push('Слиз: '  + user.slytherinId);
            var idsText = ids.length > 0 ? ids.join(' | ') : '<em>нет ID</em>';
            
            // Адреса — маленькие иконки
            var addrBadges = '';
            if (user.addrHogsmeade) addrBadges += '<span class="user-addr-badge" title="' + App.UI.escapeHtml(user.addrHogsmeade) + '"><i class="fa-solid fa-tents"></i></span>';
            if (user.addrHogwarts)  addrBadges += '<span class="user-addr-badge" title="' + App.UI.escapeHtml(user.addrHogwarts) + '"><i class="fa-brands fa-fort-awesome"></i></span>';
            
            html += '<div class="user-item">' +
                '<span>' + App.UI.escapeHtml(user.name) + (addrBadges ? ' ' + addrBadges : '') + '</span>' +
                '<span class="ids">' + (ids.length ? App.UI.escapeHtml(idsText) : '<em>нет ID</em>') + '</span>' +
                '<button type="button" class="product-actions-btn edit-btn" onclick="App.Users.edit(' + index + ')" title="Редактировать">' +
                '<i class="fa-solid fa-pencil"></i></button>' +
                '<button type="button" class="product-actions-btn delete-btn" onclick="App.Users.delete(' + index + ')" title="Удалить">' +
                '<i class="fa-solid fa-trash"></i></button>' +
                '</div>';
        });
        container.innerHTML = html;
    },
    
    // ==================== АДРЕС ДОСТАВКИ ====================
    
    // Получить адрес получателя для текущего профиля
    getRecipientAddress: function() {
        var recipientName = document.getElementById('recipient') ? document.getElementById('recipient').value.trim() : '';
        if (!recipientName) return null;
        
        var user = App.State.users.find(function(u) {
            return u.name.toLowerCase() === recipientName.toLowerCase();
        });
        if (!user) return null;
        
        var profile = App.getCurrentDeliveryProfile();
        var profileId = profile ? profile.id : 'hogsmeade';
        
        // Маппинг profileId → поле адреса
        var addrField = profileId === 'hogwarts' ? 'addrHogwarts' : 'addrHogsmeade';
        var address = user[addrField] || '';
        return /^https?:\/\//i.test(address) ? address : null;
    },
    
    // Обновить строку адреса доставки в UI
    updateDeliveryAddressBar: function() {
        var bar   = document.getElementById('deliveryAddressBar');
        var link  = document.getElementById('deliveryAddressLink');
        var label = document.getElementById('deliveryAddressLabel');
        if (!bar || !link) return;
        
        var addr = App.Users.getRecipientAddress();
        if (addr) {
            var profile = App.getCurrentDeliveryProfile();
            label.textContent = (profile ? profile.name : 'Адрес') + ':';
            link.textContent = addr;
            link.href = addr;
            bar.style.display = 'flex';
        } else {
            bar.style.display = 'none';
        }
    },
    
    copyDeliveryAddress: function() {
        var addr = App.Users.getRecipientAddress();
        if (!addr) return;
        navigator.clipboard.writeText(addr).then(function() {
            App.UI.showToast('Адрес скопирован!');
        });
    },
    
    // ==================== CRUD ====================
    edit: function(index) {
        var user = App.State.users[index];
        if (!user) return;
        
        document.getElementById('newUserName').value = user.name || '';
        document.getElementById('newUserHogsmeade').value = user.hogsmeadeId || '';
        document.getElementById('newUserHogwarts').value = user.hogwartsId || '';
        document.getElementById('newUserGryffindor').value = user.gryffindorId || '';
        document.getElementById('newUserRavenclaw').value = user.ravenclawId || '';
        document.getElementById('newUserHufflepuff').value = user.hufflepuffId || '';
        document.getElementById('newUserSlytherin').value = user.slytherinId || '';
        document.getElementById('newUserAddrHogsmeade').value = user.addrHogsmeade || '';
        document.getElementById('newUserAddrHogwarts').value = user.addrHogwarts || '';
        
        App.State.editingUserIndex = index;
        document.getElementById('saveUserBtn').textContent = 'Сохранить';
        document.getElementById('cancelUserEditBtn').style.display = 'block';
    },
    
    cancelEdit: function() {
        App.State.editingUserIndex = null;
        document.getElementById('newUserName').value = '';
        document.getElementById('newUserHogsmeade').value = '';
        document.getElementById('newUserHogwarts').value = '';
        document.getElementById('newUserGryffindor').value = '';
        document.getElementById('newUserRavenclaw').value = '';
        document.getElementById('newUserHufflepuff').value = '';
        document.getElementById('newUserSlytherin').value = '';
        document.getElementById('newUserAddrHogsmeade').value = '';
        document.getElementById('newUserAddrHogwarts').value = '';
        document.getElementById('saveUserBtn').textContent = 'Добавить';
        document.getElementById('cancelUserEditBtn').style.display = 'none';
    },
    
    save: function() {
        var name           = document.getElementById('newUserName').value.trim();
        var hogsmeadeId    = document.getElementById('newUserHogsmeade').value.trim();
        var hogwartsId     = document.getElementById('newUserHogwarts').value.trim();
        var gryffindorId   = document.getElementById('newUserGryffindor').value.trim();
        var ravenclawId    = document.getElementById('newUserRavenclaw').value.trim();
        var hufflepuffId   = document.getElementById('newUserHufflepuff').value.trim();
        var slytherinId    = document.getElementById('newUserSlytherin').value.trim();
        var addrHogsmeade  = document.getElementById('newUserAddrHogsmeade').value.trim();
        var addrHogwarts   = document.getElementById('newUserAddrHogwarts').value.trim();
        
        if (!name) {
            App.UI.showToast('Введите имя пользователя!', true);
            return;
        }
        
        var userData = {
            name: name,
            hogsmeadeId: hogsmeadeId,
            hogwartsId: hogwartsId,
            gryffindorId: gryffindorId,
            ravenclawId: ravenclawId,
            hufflepuffId: hufflepuffId,
            slytherinId: slytherinId,
            addrHogsmeade: addrHogsmeade,
            addrHogwarts: addrHogwarts
        };
        
        if (App.State.editingUserIndex !== null) {
            var existingIndex = App.State.users.findIndex(function(u, idx) {
                return u.name.toLowerCase() === name.toLowerCase() && idx !== App.State.editingUserIndex;
            });
            if (existingIndex !== -1) {
                App.UI.showToast('Пользователь с таким именем уже существует!', true);
                return;
            }
            
            App.State.users[App.State.editingUserIndex] = userData;
            App.UI.showToast('Пользователь обновлен!');
        } else {
            var exists = App.State.users.find(function(u) {
                return u.name.toLowerCase() === name.toLowerCase();
            });
            if (exists) {
                App.UI.showToast('Пользователь уже существует!', true);
                return;
            }
            
            App.State.users.push(userData);
            App.UI.showToast('Пользователь добавлен!');
        }
        
        App.Storage.saveUsers();
        App.Users.updateDatalist();
        App.Users.renderList();
        App.Users.cancelEdit();
    },
    
    delete: function(index) {
        if (confirm('Удалить этого пользователя?')) {
            App.State.users.splice(index, 1);
            App.Storage.saveUsers();
            App.Users.updateDatalist();
            App.Users.renderList();
        }
    },
    
    // ==================== ИМПОРТ/ЭКСПОРТ ====================
    download: function() {
        var dataStr = JSON.stringify(App.State.users, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'users_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        App.UI.showToast('База пользователей скачана!');
    },
    
    upload: function(event) {
        var file = event.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var source = JSON.parse(e.target.result);
                var uploaded = App.Backup.validateUsers(Array.isArray(source) ? source : source.users);
                if (!Array.isArray(uploaded)) {
                    throw new Error('Файл должен содержать массив');
                }
                
                if (confirm('Загрузить ' + uploaded.length + ' пользователей? Текущая база будет заменена.')) {
                    uploaded = uploaded.map(function(u) {
                        return {
                            name: u.name || '',
                            hogsmeadeId: u.hogsmeadeId || '',
                            hogwartsId: u.hogwartsId || '',
                            gryffindorId: u.gryffindorId || '',
                            ravenclawId: u.ravenclawId || '',
                            hufflepuffId: u.hufflepuffId || '',
                            slytherinId: u.slytherinId || '',
                            addrHogsmeade: u.addrHogsmeade || '',
                            addrHogwarts: u.addrHogwarts || ''
                        };
                    });
                    
                    App.State.users = uploaded;
                    App.Storage.saveUsers();
                    App.Users.updateDatalist();
                    App.Users.renderList();
                    App.UI.showToast('База пользователей загружена!');
                }
            } catch (error) {
                App.UI.showToast('Ошибка: ' + error.message, true);
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};

function openUsersModal() { App.Users.openModal(); }
function closeUsersModal() { App.Users.closeModal(); }
function saveUser() { App.Users.save(); }
function cancelUserEdit() { App.Users.cancelEdit(); }
function downloadUsers() { App.Users.download(); }
function uploadUsers(event) { App.Users.upload(event); }

