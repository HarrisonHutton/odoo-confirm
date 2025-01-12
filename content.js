// Multiple attempts since @web and @mail are not available immediately
attempts = 5;

interval = setInterval(() => {
    if (attempts <= 0) {
        clearInterval(interval);
        console.log("Failed to load Odoo Confirm");
        return;
    }

    try {
        // Compiled from odoo_confirm_module
        odoo.define('@odoo_confirm/core/common/composer_patch', ['@web/core/utils/patch', '@mail/core/common/composer'], function (require) {
            'use strict';
            let __exports = {};
            const { patch } = require("@web/core/utils/patch");
            const { Composer } = require("@mail/core/common/composer");
            patch(Composer.prototype, {
                async sendMessage() {
                    if (this.props.type != "note" && !confirm("Are you sure you want to send this message?")) {
                        return;
                    }
                    await super.sendMessage(...arguments);
                }
            });
            return __exports;
        });
    }
    catch (e) {
        attempts--;
        return;
    }

    clearInterval(interval);
    console.log("Odoo Confirm Loaded 🚀");
}, 500);