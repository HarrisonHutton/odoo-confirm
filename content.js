function loadOdooConfirm() {
    if (document.documentElement.dataset.odooConfirmActive === 'false') {
        return;
    }

    const version = window.odoo?.info?.server_version?.replace(/\+e$/, '');
    if (!version) {
        return;
    }

    const supportedVersions = ['18.0', 'saas~18.2', 'saas~18.3', 'saas~18.4', '19.0', 'saas~19.1', 'saas~19.2', 'saas~19.3', 'saas~19.4'];
    if (!supportedVersions.includes(version)) {
        console.log(`😿 Odoo Confirm does not support Odoo version ${version} (yet)
Make a request at https://github.com/HarrisonHutton/odoo-confirm/issues`);
        return;
    }

    window.__odooIgnoreMissingDependencies = true;
    const funcName = `odoo_confirm_${version.replace(/[~.]/g, '_')}`;
    window[funcName]();
    window.__odooIgnoreMissingDependencies = false;
}

loadOdooConfirm();
