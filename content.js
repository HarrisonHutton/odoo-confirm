/* /web/static/tests/legacy/ignore_missing_deps_start.js */
window.__odooIgnoreMissingDependencies = true;
;
/* /odoo_confirm_module/static/src/core/common/composer_patch.js */
odoo.define('@odoo_confirm_module/core/common/composer_patch', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/views/view_button/view_button', '@web/core/registry', '@mail/core/common/message_confirm_dialog', '@web/core/l10n/translation', '@odoo/owl', '@web/core/user', '@mail/utils/common/format', '@web/core/utils/hooks'], function (require) {
    'use strict';
    let __exports = {};
    const { patch } = require("@web/core/utils/patch");
    const { Composer } = require("@mail/core/common/composer");
    const { ViewButton } = require("@web/views/view_button/view_button");
    const { registry, KeyNotFoundError } = require("@web/core/registry");
    const { MessageConfirmDialog } = require("@mail/core/common/message_confirm_dialog");
    const { _t } = require("@web/core/l10n/translation");
    const { toRaw } = require("@odoo/owl");
    const { user } = require("@web/core/user");
    const { prettifyMessageContent } = require("@mail/utils/common/format");
    const { useService } = require("@web/core/utils/hooks");
    
    async function addConfirmationDialog(message, callback) {
        this.env.services.dialog.add(MessageConfirmDialog, {
            title: "Odoo Confirm 😺",
            prompt: _t("Are you sure you want to send this message?"),
            message: message,
            confirmText: _t("Send it!"),
            onConfirm: callback,
            close: () => { },
        });
    }
    patch(Composer.prototype, {
        async sendMessage() {
            if (this.props.type === "message" && this.props.mode === "extended") {
                const composer = toRaw(this.props.composer);
                const prettyContent = await prettifyMessageContent(composer.text);
                const message = composer.store["mail.message"].insert({
                    body: prettyContent,
                    author: composer.store.Persona.get({
                        type: "partner",
                        id: user.partnerId
                    })
                }, { html: true });
                await addConfirmationDialog.call(this, message, async () => {
                    await super.sendMessage(...arguments);
                });
            } else {
                await super.sendMessage(...arguments);
            }
        }
    });
    patch(ViewButton.prototype, {
        setup() {
            this.store = useService("mail.store");
            super.setup();
        },
    
        onClick(ev) {
            if (this.clickParams.name === "action_send_mail" && !this.props.record.data.subtype_is_log) {
                const message = this.store["mail.message"].insert({
                    body: this.props.record.data.body,
                    author: this.store.Persona.get({
                        type: "partner",
                        id: user.partnerId
                    })
                }, { html: true });
                addConfirmationDialog.call(this, message, () => {
                    super.onClick(...arguments);
                });
            } else {
                super.onClick(...arguments);
            }
        }
    });
    try {
        // MailComposerSendDropdown is not exported, so we get it from the registry
        const MailComposerSendDropdown = registry.category("view_widgets").get("mail_composer_send_dropdown").component;
        patch(MailComposerSendDropdown.prototype, {
            setup() {
                this.store = useService("mail.store");
                super.setup();
            },
    
            async onClickSend() {
                if (!this.props.record.data.subtype_is_log) {
                    const message = this.store["mail.message"].insert({
                        body: this.props.record.data.body,
                        author: this.store.Persona.get({
                            type: "partner",
                            id: user.partnerId
                        })
                    }, { html: true });
                    addConfirmationDialog.call(this, message, async () => {
                        await super.onClickSend(...arguments);
                    });
                } else {
                    await super.onClickSend(...arguments);
                }
            }
        });
    } catch (e) {
        // Odoo versions before 18.0 don't have the MailComposerSendDropdown component
        if (!e instanceof KeyNotFoundError) {
            throw e;
        }
    }
    return __exports;
});
;
/* /web/static/tests/legacy/ignore_missing_deps_stop.js */
window.__odooIgnoreMissingDependencies = false;
;
