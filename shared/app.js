/**
 * "Под крылом Ворона" - Генератор сообщений для форума
 * Инициализация приложения (НОВАЯ ВЕРСИЯ)
 */

App.init = function() {
    
    // Загрузка данных из localStorage
    App.State.users = App.Storage.loadUsers();
    App.State.templates = App.Storage.loadTemplates();
    App.State.products = App.Storage.loadProducts();
    App.Storage.saveProducts();
    var completedTemplates = App.TemplateLibrary.complete(App.State.products, App.State.templates);
    if (completedTemplates.length !== App.State.templates.length) {
        App.State.templates = completedTemplates;
        App.Storage.saveTemplates();
    }
    App.State.collapsedCategories = App.Storage.loadCollapsedCategories();
    App.State.collapsedGroups = App.Storage.loadCollapsedGroups();
    App.State.currentCatalogName = App.Storage.loadCatalogName();
    App.State.deliveryProfiles = App.Storage.loadDeliveryProfiles();
    App.State.currentDeliveryProfileId = App.Storage.loadCurrentDeliveryProfileId();
    
    App.State.currentMode = App.State.currentDeliveryProfileId;
    App.Workspace.init();

    // Авто-миграция категорий в группы/коллекции
    App.State.products = App.State.products.map(function(p) {
        return App.migrateProductCategory(p);
    });
    
    // Рендеринг UI элементов
    App.UI.renderModeButtons();
    App.UI.renderModeToggle();
    App.UI.renderCatalogSettings();
    
    // Обновление интерфейса
    App.UI.updateCatalogNameDisplay();
    App.Users.updateDatalist();
    App.Templates.updateSelects();
    
    // Рендерим динамические поля для первого шаблона
    if (App.State.templates.length > 0) {
        App.Products.renderDynamicFields(App.State.templates[0].id);
    }
    
    App.Products.render();
    
    // Обработчик для записки
    document.getElementById('note').addEventListener('input', function() {
        if (App.State.catalogMode === 'delivery') {
            App.Message.update();
        }
    });
    
    // Закрытие модального окна пользователей по клику вне его
    document.getElementById('usersModal').addEventListener('click', function(e) {
        if (e.target === this) {
            App.Users.closeModal();
        }
    });
    
    // НЕ закрываем модальное окно шаблонов по клику вне - чтобы не потерять данные при случайном клике
    // document.getElementById('templatesModal').addEventListener('click', function(e) {
    //     if (e.target === this) {
    //         App.Templates.closeModal();
    //     }
    // });
    
};

App.start = async function () {
    try {
        App.Images.initCredentials?.();
        await Promise.all([App.Cloud?.bootstrap(), App.UserCloud?.bootstrap()]);
        App.init();
        if (App.Cloud) App.Cloud.watch();
        if (App.UserCloud) App.UserCloud.watch();
    } catch (error) {
        App.UI.showToast('не удалось открыть мастерскую: ' + error.message, true);
    }
};

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.start);
} else {
    App.start();
}
