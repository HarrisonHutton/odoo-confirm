(async () => {
    try {
        const settings = await getFilterSettings();
        const currentDomain = window.location.hostname;
        const active = DomainFilter.shouldActivateConfirmation(currentDomain, settings);
        document.documentElement.dataset.odooConfirmActive = active ? "true" : "false";
    } catch (e) {
        document.documentElement.dataset.odooConfirmActive = "true";
    }
})();
