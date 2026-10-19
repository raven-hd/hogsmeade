/**
 * "Под крылом Ворона" - Редактор структуры каталога
 * Управление группами и коллекциями: переименование, перемещение, объединение, разбивка
 */

App.CatalogEditor = {

    // Текущий выбранный элемент — хранится в объекте, НЕ в onclick-строках
    _selected: null, // { type: 'group'|'collection', group: '...', collection: '...' }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ ====================

    getStructure: function() {
        var filtered = App.State.products.filter(function(p) {
            return p.shop === App.State.currentShop;
        });
        var structure = Object.create(null);
        filtered.forEach(function(p) {
            var g = p.group || p.category || '';
            var c = p.collection || '';
            if (!structure[g]) structure[g] = Object.create(null);
            if (!structure[g][c]) structure[g][c] = [];
            structure[g][c].push(p);
        });
        return structure;
    },

    updateProducts: function(ids, changes) {
        App.State.products = App.State.products.map(function(p) {
            if (ids.indexOf(p.id) === -1) return p;
            var updated = Object.assign({}, p);
            if (changes.group      !== undefined) updated.group      = changes.group;
            if (changes.collection !== undefined) updated.collection = changes.collection;
            if (changes.category   !== undefined) updated.category   = changes.category;
            return updated;
        });
        App.Storage.saveProducts();
        App.Products.render();
    },

    idsInGroup: function(groupName) {
        return App.State.products
            .filter(function(p) {
                return p.shop === App.State.currentShop &&
                       (p.group || p.category || '') === groupName;
            })
            .map(function(p) { return p.id; });
    },

    idsInCollection: function(groupName, collectionName) {
        return App.State.products
            .filter(function(p) {
                return p.shop === App.State.currentShop &&
                       (p.group || p.category || '') === groupName &&
                       (p.collection || '') === collectionName;
            })
            .map(function(p) { return p.id; });
    },

    // ==================== ОТКРЫТИЕ / ЗАКРЫТИЕ ====================

    openModal: function() {
        App.CatalogEditor._selected = null;
        App.CatalogEditor.renderModal();
        document.getElementById('catalogEditorModal').classList.remove('hidden');
    },

    closeModal: function() {
        document.getElementById('catalogEditorModal').classList.add('hidden');
    },

    // ==================== РЕНДЕРИНГ ДЕРЕВА ====================

    renderModal: function() {
        var modal = document.getElementById('catalogEditorModal');
        if (!modal) return;

        var structure = App.CatalogEditor.getStructure();
        var groupNames = Object.keys(structure);

        if (groupNames.length === 0) {
            modal.querySelector('.catalog-editor-body').innerHTML =
                '<div style="text-align:center;padding:40px;opacity:0.6;">' +
                '<i class="fa-solid fa-box-open" style="font-size:32px;display:block;margin-bottom:12px;"></i>' +
                'Каталог пуст</div>';
            return;
        }

        var html = '<div class="ced-layout">';

        // Левая колонка — дерево
        html += '<div class="ced-tree" id="cedTree">';
        html += '<div class="ced-tree-header">Структура каталога</div>';

        groupNames.forEach(function(groupName) {
            var collections = structure[groupName];
            var collectionNames = Object.keys(collections);
            var totalCount = collectionNames.reduce(function(s, c) { return s + collections[c].length; }, 0);

            // data-атрибуты — кириллица в них безопасна, т.к. не попадает в JS-контекст
            html += '<div class="ced-group-node">' +
                '<div class="ced-group-label ced-clickable" ' +
                    'data-type="group" ' +
                    'data-group="' + App.UI.escapeHtml(groupName) + '">' +
                    '<i class="fa-solid fa-layer-group"></i> ' +
                    '<span>' + App.UI.escapeHtml(groupName) + '</span>' +
                    '<span class="ced-count">' + totalCount + '</span>' +
                '</div>';

            collectionNames.forEach(function(colName) {
                var count = collections[colName].length;
                html += '<div class="ced-collection-node ced-clickable" ' +
                    'data-type="collection" ' +
                    'data-group="' + App.UI.escapeHtml(groupName) + '" ' +
                    'data-collection="' + App.UI.escapeHtml(colName) + '">' +
                    '<i class="fa-solid fa-tag"></i> ' +
                    '<span>' + (colName ? App.UI.escapeHtml(colName) : '<em style="opacity:0.55;">без коллекции</em>') + '</span>' +
                    '<span class="ced-count">' + count + '</span>' +
                '</div>';
            });

            html += '</div>';
        });

        html += '</div>'; // ced-tree

        html += '<div class="ced-panel" id="cedPanel">' +
            '<div class="ced-panel-empty">' +
            '<i class="fa-solid fa-arrow-pointer"></i><br>' +
            'Выберите группу или коллекцию слева' +
            '</div></div>';

        html += '</div>'; // ced-layout

        modal.querySelector('.catalog-editor-body').innerHTML = html;

        // Делегированный обработчик на всё дерево — не нужно передавать строки в onclick
        var tree = document.getElementById('cedTree');
        tree.addEventListener('click', function(e) {
            var node = e.target.closest('.ced-clickable');
            if (!node) return;

            // Снимаем предыдущую подсветку
            tree.querySelectorAll('.ced-clickable').forEach(function(el) {
                el.classList.remove('selected');
            });
            node.classList.add('selected');

            var type       = node.dataset.type;
            var group      = node.dataset.group;
            var collection = node.dataset.collection || '';

            App.CatalogEditor._selected = { type: type, group: group, collection: collection };

            if (type === 'group') {
                App.CatalogEditor.renderGroupPanel(group);
            } else {
                App.CatalogEditor.renderCollectionPanel(group, collection);
            }
        });

        // Восстанавливаем выбранный элемент после перерисовки
        if (App.CatalogEditor._selected) {
            var sel = App.CatalogEditor._selected;
            var selector = sel.type === 'group'
                ? '.ced-clickable[data-type="group"][data-group="' + App.UI.escapeHtml(sel.group) + '"]'
                : '.ced-clickable[data-type="collection"][data-group="' + App.UI.escapeHtml(sel.group) + '"][data-collection="' + App.UI.escapeHtml(sel.collection) + '"]';
            var node = tree.querySelector(selector);
            if (node) node.classList.add('selected');

            if (sel.type === 'group') {
                App.CatalogEditor.renderGroupPanel(sel.group);
            } else {
                App.CatalogEditor.renderCollectionPanel(sel.group, sel.collection);
            }
        }
    },

    // ==================== ПАНЕЛЬ ГРУППЫ ====================

    renderGroupPanel: function(groupName) {
        var panel = document.getElementById('cedPanel');
        if (!panel) return;

        var structure    = App.CatalogEditor.getStructure();
        var collections  = structure[groupName] || {};
        var colNames     = Object.keys(collections).filter(function(c) { return c !== ''; });
        var otherGroups  = Object.keys(structure).filter(function(g) { return g !== groupName; });

        var html = '<div class="ced-panel-title">' +
            '<i class="fa-solid fa-layer-group"></i> ' +
            App.UI.escapeHtml(groupName) +
        '</div>';

        // 1. Переименовать группу
        html += App.CatalogEditor._section('Переименовать группу',
            '<div class="ced-row">' +
            '<input type="text" id="ced_renameGroup_val" value="' + App.UI.escapeHtml(groupName) + '">' +
            '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.renameGroup()" title="Применить">' +
                '<i class="fa-solid fa-check"></i>' +
            '</button>' +
            '</div>'
        );

        // 2. Превратить в коллекцию другой группы
        if (otherGroups.length > 0) {
            var opts = otherGroups.map(function(g) {
                return '<option value="' + App.UI.escapeHtml(g) + '">' + App.UI.escapeHtml(g) + '</option>';
            }).join('');

            html += App.CatalogEditor._section('Превратить в коллекцию',
                '<p class="ced-hint">Все товары из <b>' + App.UI.escapeHtml(groupName) + '</b> станут коллекцией внутри выбранной группы</p>' +
                '<div class="ced-row">' +
                '<select id="ced_mergeInto_target"><option value="">— целевая группа —</option>' + opts + '</select>' +
                '<input type="text" id="ced_mergeInto_colName" value="' + App.UI.escapeHtml(groupName) + '" placeholder="Название коллекции">' +
                '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.groupToCollection()" title="Переместить">' +
                    '<i class="fa-solid fa-arrow-right"></i>' +
                '</button>' +
                '</div>'
            );
        }

        // 3. Объединить коллекции
        if (colNames.length >= 2) {
            var cbs = colNames.map(function(c) {
                return '<label class="ced-check">' +
                    '<input type="checkbox" name="ced_merge_col" value="' + App.UI.escapeHtml(c) + '" checked> ' +
                    App.UI.escapeHtml(c) + '</label>';
            }).join('');

            html += App.CatalogEditor._section('Объединить коллекции',
                '<p class="ced-hint">Отметьте коллекции для объединения</p>' +
                '<div class="ced-checkboxes">' + cbs + '</div>' +
                '<div class="ced-row" style="margin-top:8px;">' +
                '<input type="text" id="ced_mergeCol_name" placeholder="Название объединённой коллекции">' +
                '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.mergeCollections()" title="Объединить">' +
                    '<i class="fa-solid fa-compress"></i>' +
                '</button>' +
                '</div>'
            );
        }

        panel.innerHTML = html;
    },

    // ==================== ПАНЕЛЬ КОЛЛЕКЦИИ ====================

    renderCollectionPanel: function(groupName, collectionName) {
        var panel = document.getElementById('cedPanel');
        if (!panel) return;

        var structure   = App.CatalogEditor.getStructure();
        var items       = (structure[groupName] && structure[groupName][collectionName]) || [];
        var allGroups   = Object.keys(structure);
        var displayName = collectionName || 'без коллекции';

        var html = '<div class="ced-panel-title">' +
            '<i class="fa-solid fa-tag"></i> ' +
            App.UI.escapeHtml(displayName) +
            ' <span style="opacity:0.4;font-size:12px;font-weight:400;">в группе ' + App.UI.escapeHtml(groupName) + '</span>' +
        '</div>';

        // 1. Переименовать коллекцию
        html += App.CatalogEditor._section('Переименовать коллекцию',
            '<div class="ced-row">' +
            '<input type="text" id="ced_renameCol_val" value="' + App.UI.escapeHtml(collectionName) + '">' +
            '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.renameCollection()" title="Применить">' +
                '<i class="fa-solid fa-check"></i>' +
            '</button>' +
            '</div>'
        );

        // 2. Переместить в другую группу
        var groupOpts = allGroups.map(function(g) {
            return '<option value="' + App.UI.escapeHtml(g) + '"' + (g === groupName ? ' selected' : '') + '>' +
                App.UI.escapeHtml(g) + '</option>';
        }).join('');

        html += App.CatalogEditor._section('Переместить в другую группу',
            '<div class="ced-row">' +
            '<select id="ced_moveCol_target">' + groupOpts + '</select>' +
            '<input type="text" id="ced_moveCol_newName" value="' + App.UI.escapeHtml(collectionName) + '" placeholder="Название в новой группе">' +
            '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.moveCollection()" title="Переместить">' +
                '<i class="fa-solid fa-arrow-right"></i>' +
            '</button>' +
            '</div>'
        );

        // 3. Разбить коллекцию
        if (items.length >= 2) {
            var itemCbs = items.map(function(p) {
                return '<label class="ced-check">' +
                    '<input type="checkbox" name="ced_split_item" value="' + p.id + '"> ' +
                    App.UI.escapeHtml(p.name) + '</label>';
            }).join('');

            html += App.CatalogEditor._section('Разбить на две коллекции',
                '<p class="ced-hint">Отмеченные товары перейдут в новую коллекцию, остальные останутся</p>' +
                '<div class="ced-checkboxes">' + itemCbs + '</div>' +
                '<div class="ced-row" style="margin-top:8px;">' +
                '<input type="text" id="ced_split_newName" placeholder="Название новой коллекции">' +
                '<button type="button" class="ced-action-btn" onclick="App.CatalogEditor.splitCollection()" title="Разбить">' +
                    '<i class="fa-solid fa-scissors"></i>' +
                '</button>' +
                '</div>'
            );
        }

        panel.innerHTML = html;
    },

    // ==================== ДЕЙСТВИЯ (читают this._selected) ====================

    renameGroup: function() {
        var sel = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'group') return;
        var oldName = sel.group;
        var newName = (document.getElementById('ced_renameGroup_val').value || '').trim();
        if (!newName)          { App.UI.showToast('Введите название!', true); return; }
        if (newName === oldName) { App.UI.showToast('Название не изменилось'); return; }

        var structure = App.CatalogEditor.getStructure();
        if (structure[newName] && !confirm('Группа "' + newName + '" уже существует. Объединить товары?')) return;

        App.CatalogEditor.updateProducts(App.CatalogEditor.idsInGroup(oldName), { group: newName });
        App.CatalogEditor._selected = { type: 'group', group: newName };
        App.UI.showToast('Переименовано → "' + newName + '"');
        App.CatalogEditor.renderModal();
    },

    groupToCollection: function() {
        var sel = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'group') return;
        var groupName   = sel.group;
        var targetGroup = document.getElementById('ced_mergeInto_target').value;
        var colName     = (document.getElementById('ced_mergeInto_colName').value || '').trim();
        if (!targetGroup) { App.UI.showToast('Выберите целевую группу!', true); return; }
        if (!colName)     { App.UI.showToast('Введите название коллекции!', true); return; }

        var structure = App.CatalogEditor.getStructure();
        if (structure[targetGroup] && structure[targetGroup][colName] &&
            !confirm('Коллекция "' + colName + '" уже есть. Объединить?')) return;

        App.CatalogEditor.updateProducts(
            App.CatalogEditor.idsInGroup(groupName),
            { group: targetGroup, collection: colName, category: targetGroup + ' ' + colName }
        );
        App.CatalogEditor._selected = { type: 'collection', group: targetGroup, collection: colName };
        App.UI.showToast('"' + groupName + '" → "' + targetGroup + ' / ' + colName + '"');
        App.CatalogEditor.renderModal();
    },

    mergeCollections: function() {
        var sel = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'group') return;
        var groupName = sel.group;
        var checked   = document.querySelectorAll('input[name="ced_merge_col"]:checked');
        var selected  = Array.from(checked).map(function(cb) { return cb.value; });
        var newName   = (document.getElementById('ced_mergeCol_name').value || '').trim();
        if (selected.length < 2) { App.UI.showToast('Выберите минимум 2 коллекции!', true); return; }
        if (!newName)             { App.UI.showToast('Введите название!', true); return; }

        selected.forEach(function(colName) {
            App.CatalogEditor.updateProducts(
                App.CatalogEditor.idsInCollection(groupName, colName),
                { collection: newName, category: groupName + ' ' + newName }
            );
        });
        App.CatalogEditor._selected = { type: 'collection', group: groupName, collection: newName };
        App.UI.showToast('Объединено → "' + newName + '"');
        App.CatalogEditor.renderModal();
    },

    renameCollection: function() {
        var sel = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'collection') return;
        var groupName  = sel.group;
        var oldColName = sel.collection;
        var newName    = (document.getElementById('ced_renameCol_val').value || '').trim();
        if (!newName)             { App.UI.showToast('Введите название!', true); return; }
        if (newName === oldColName) { App.UI.showToast('Название не изменилось'); return; }

        var structure = App.CatalogEditor.getStructure();
        if (structure[groupName] && structure[groupName][newName] &&
            !confirm('Коллекция "' + newName + '" уже существует. Объединить?')) return;

        App.CatalogEditor.updateProducts(
            App.CatalogEditor.idsInCollection(groupName, oldColName),
            { collection: newName, category: groupName + ' ' + newName }
        );
        App.CatalogEditor._selected = { type: 'collection', group: groupName, collection: newName };
        App.UI.showToast('Переименовано → "' + newName + '"');
        App.CatalogEditor.renderModal();
    },

    moveCollection: function() {
        var sel        = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'collection') return;
        var fromGroup  = sel.group;
        var colName    = sel.collection;
        var toGroup    = document.getElementById('ced_moveCol_target').value;
        var newColName = (document.getElementById('ced_moveCol_newName').value || '').trim();
        if (!toGroup)    { App.UI.showToast('Выберите группу!', true); return; }
        if (!newColName) { App.UI.showToast('Введите название!', true); return; }
        if (toGroup === fromGroup && newColName === colName) { App.UI.showToast('Ничего не изменилось'); return; }

        var structure = App.CatalogEditor.getStructure();
        if (toGroup !== fromGroup && structure[toGroup] && structure[toGroup][newColName] &&
            !confirm('Коллекция "' + newColName + '" уже есть в "' + toGroup + '". Объединить?')) return;

        App.CatalogEditor.updateProducts(
            App.CatalogEditor.idsInCollection(fromGroup, colName),
            { group: toGroup, collection: newColName, category: toGroup + ' ' + newColName }
        );
        App.CatalogEditor._selected = { type: 'collection', group: toGroup, collection: newColName };
        App.UI.showToast('Перемещено в "' + toGroup + '"');
        App.CatalogEditor.renderModal();
    },

    splitCollection: function() {
        var sel        = App.CatalogEditor._selected;
        if (!sel || sel.type !== 'collection') return;
        var groupName  = sel.group;
        var colName    = sel.collection;
        var checked    = document.querySelectorAll('input[name="ced_split_item"]:checked');
        var selectedIds = Array.from(checked).map(function(cb) { return parseInt(cb.value); });
        var newColName = (document.getElementById('ced_split_newName').value || '').trim();
        if (selectedIds.length === 0) { App.UI.showToast('Отметьте товары!', true); return; }
        if (!newColName)               { App.UI.showToast('Введите название!', true); return; }

        var allIds = App.CatalogEditor.idsInCollection(groupName, colName);
        if (selectedIds.length === allIds.length) {
            App.UI.showToast('Оставьте хотя бы один товар в исходной коллекции!', true); return;
        }

        App.CatalogEditor.updateProducts(
            selectedIds,
            { collection: newColName, category: groupName + ' ' + newColName }
        );
        App.CatalogEditor._selected = { type: 'collection', group: groupName, collection: newColName };
        App.UI.showToast(selectedIds.length + ' товаров → "' + newColName + '"');
        App.CatalogEditor.renderModal();
    },

    // ==================== РЕНДЕР СЕКЦИИ ====================

    _section: function(title, content) {
        return '<div class="ced-section">' +
            '<div class="ced-section-title">' + title + '</div>' +
            '<div class="ced-section-body">' + content + '</div>' +
        '</div>';
    }
};

function openCatalogEditorModal()  { App.CatalogEditor.openModal(); }
function closeCatalogEditorModal() { App.CatalogEditor.closeModal(); }

