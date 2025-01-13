odoo.define('@odoo_confirm/core/common/composer_patch', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/core/confirmation_dialog/confirmation_dialog'], function (require) {
    'use strict';
    let __exports = {};
    const { patch } = require("@web/core/utils/patch");
    const { Composer } = require("@mail/core/common/composer");
    const { ConfirmationDialog } = require("@web/core/confirmation_dialog/confirmation_dialog");
    patch(Composer.prototype, {
        async sendMessage() {
            if (this.props.type == "note") {
                return await super.sendMessage(...arguments);
            }
            this.env.services.dialog.add(ConfirmationDialog, {
                title: "Odoo Confirm 😺",
                body: "Are you sure you want to send this message?",
                confirmLabel: "Send",
                confirm: async () => {
                    await super.sendMessage(...arguments);
                },
                cancel: () => { },
            })
        }
    });
    return __exports;
});