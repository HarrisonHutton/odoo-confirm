/* /web/static/tests/legacy/ignore_missing_deps_start.js */
window.__odooIgnoreMissingDependencies = true;
;
/* /odoo_confirm_module/static/src/core/common/composer_patch.js */
odoo.define('@odoo_confirm_module/core/common/composer_patch', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/views/view_button/view_button', '@web/core/registry', '@mail/core/common/message_confirm_dialog', '@mail/core/common/message', '@mail/utils/common/format', '@web/core/utils/hooks'], function (require) {
    'use strict';
    let __exports = {};
    const { patch } = require("@web/core/utils/patch");
    const { Composer } = require("@mail/core/common/composer");
    const { ViewButton } = require("@web/views/view_button/view_button");
    const { registry, KeyNotFoundError } = require("@web/core/registry");
    const { MessageConfirmDialog } = require("@mail/core/common/message_confirm_dialog");
    const { Message } = require("@mail/core/common/message");
    const { prettifyMessageContent } = require("@mail/utils/common/format");
    const { useService } = require("@web/core/utils/hooks");
    const userModule = require("@web/core/user");
    async function addConfirmationDialog(body, attachment_ids, callback) {
        const service = this.store["mail.message"] ? this.store["mail.message"] : this.store.Message;
        const message = service.insert({
            body,
            attachment_ids,
            attachments: attachment_ids,
            author: this.store.Persona.get({
                type: "partner",
                id: this.user.partnerId
            })
        }, { html: true });
        this.env.services.dialog.add(MessageConfirmDialog, {
            title: "Odoo Confirm 😺",
            prompt: "Are you sure you want to send this message?",
            message,
            messageComponent: Message,
            confirmText: "Send",
            onConfirm: callback,
            close: () => { },
        });
    }
    patch(Composer.prototype, {
        setup() {
            this.user = userModule ? userModule.user : useService("user");
            super.setup();
        },
        async sendMessage() {
            if (this.props.type === "message" && this.props.mode === "extended") {
                const text = this.props.composer.textInputContent ? this.props.composer.textInputContent : this.props.composer.text;
                const body = await prettifyMessageContent(text);
                await addConfirmationDialog.call(this, body, this.props.composer.attachments, async () => {
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
            this.user = userModule ? userModule.user : useService("user");
            super.setup();
        },
        onClick(ev) {
            const data = this.props.record.data;
            if (this.clickParams.name === "action_send_mail" && !data.subtype_is_log) {
                addConfirmationDialog.call(this, data.body, data.attachment_ids._currentIds, async () => {
                    super.onClick(...arguments);
                });
            } else {
                super.onClick(...arguments);
            }
        }
    });
    try {
        const MailComposerSendDropdown = registry.category("view_widgets").get("mail_composer_send_dropdown").component;
        patch(MailComposerSendDropdown.prototype, {
            setup() {
                this.store = useService("mail.store");
                this.user = userModule.user;
                super.setup();
            },
            async onClickSend() {
                const data = this.props.record.data;
                if (!data.subtype_is_log) {
                    addConfirmationDialog.call(this, data.body, data.attachment_ids._currentIds, async () => {
                        await super.onClickSend(...arguments);
                    });
                } else {
                    await super.onClickSend(...arguments);
                }
            }
        });
    } catch (e) {
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
