odoo.define('@odoo_confirm_module/core/common/composer_patch', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/core/confirmation_dialog/confirmation_dialog', '@web/views/view_button/view_button', '@web/core/registry'], function (require) {
    'use strict';
    let __exports = {};
    const { patch } = require("@web/core/utils/patch");
    const { Composer } = require("@mail/core/common/composer");
    const { ConfirmationDialog } = require("@web/core/confirmation_dialog/confirmation_dialog");
    const { ViewButton } = require("@web/views/view_button/view_button");
    const { registry, KeyNotFoundError } = require("@web/core/registry");
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
                }
                ,
                cancel: () => { }
                ,
            })
        }
    });
    patch(ViewButton.prototype, {
        onClick(ev) {
            if (this.clickParams.name !== "action_send_mail" || this.props.record.data.subtype_is_log) {
                return super.onClick(...arguments);
            }
            this.env.services.dialog.add(ConfirmationDialog, {
                title: "Odoo Confirm 😺",
                body: "Are you sure you want to send this message?",
                confirmLabel: "Send",
                confirm: () => {
                    super.onClick(...arguments);
                }
                ,
                cancel: () => { }
                ,
            })
        }
    });
    try {
        const MailComposerSendDropdown = registry.category("view_widgets").get("mail_composer_send_dropdown").component;
        patch(MailComposerSendDropdown.prototype, {
            async onClickSend() {
                if (this.props.record.data.subtype_is_log) {
                    return await super.onClickSend(...arguments);
                }
                this.env.services.dialog.add(ConfirmationDialog, {
                    title: "Odoo Confirm 😺",
                    body: "Are you sure you want to send this message?",
                    confirmLabel: "Send",
                    confirm: async () => {
                        await super.onClickSend(...arguments);
                    }
                    ,
                    cancel: () => { }
                    ,
                })
            }
        });
    } catch (e) {
        if (!e instanceof KeyNotFoundError) {
            throw e;
        }
    }
    return __exports;
});