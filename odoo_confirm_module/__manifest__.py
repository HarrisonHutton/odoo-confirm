{
    "name": "Odoo Confirm",
    "author": "juwu-odoo",
    "version": "0.0.1",
    "category": "Custom Modules",
    "website": "https://github.com/hahu-odoo/odoo-confirm",
    "depends": ["mail"],
    "data": [],
    "demo": [],
    "assets": {
        "web.assets_backend": [
            'web/static/tests/legacy/ignore_missing_deps_start.js',
            "odoo_confirm_module/static/src/core/common/composer_patch.js",
            'web/static/tests/legacy/ignore_missing_deps_stop.js',
        ],
    },
}
