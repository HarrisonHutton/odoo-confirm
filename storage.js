const FILTER_DEFAULTS = {
    filterEnabled: false,
    filterMode: 'whitelist',
    domains: []
};

const storageArea = chrome?.storage?.sync || globalThis.browser?.storage?.sync || null;

async function getFilterSettings() {
    if (!storageArea) return { ...FILTER_DEFAULTS };
    try {
        return await storageArea.get(FILTER_DEFAULTS);
    } catch (e) {
        console.error('😿 Odoo Confirm: failed to read settings', e);
        return { ...FILTER_DEFAULTS };
    }
}

async function saveFilterSettings(settings) {
    if (!storageArea) throw new Error('Storage API not available');
    await storageArea.set(settings);
}

function createDebouncedSave(delayMs = 400) {
    let timer = null;
    return (settings, onDone) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            try {
                await saveFilterSettings(settings);
                onDone?.(null);
            } catch (e) {
                onDone?.(e);
            }
        }, delayMs);
    };
}
