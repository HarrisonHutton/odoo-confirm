function odoo_confirm_18_0() {
    odoo.define('odoo_confirm', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/core/registry', '@mail/core/common/message_confirm_dialog', '@mail/utils/common/format', '@web/core/utils/hooks', '@web/core/user', '@web/core/registry'], function (require) {
        'use strict';
        let __exports = {};
        const { patch } = require("@web/core/utils/patch");
        const { Composer } = require("@mail/core/common/composer");
        const { MessageConfirmDialog } = require("@mail/core/common/message_confirm_dialog");
        const { prettifyMessageContent } = require("@mail/utils/common/format");
        const { useService } = require("@web/core/utils/hooks");
        const { user } = require("@web/core/user");
        const { registry } = require("@web/core/registry");

        async function addConfirmationDialog(self, body, attachment_ids, onConfirm) {
            const message = self.store.Message.insert({
                body,
                attachment_ids,
                author: self.store.Persona.get({
                    type: "partner",
                    id: user.partnerId
                })
            }, { html: true });
            self.env.services.dialog.add(MessageConfirmDialog, {
                title: "Odoo Confirm 😺",
                prompt: "Are you sure you want to send this message?",
                message,
                confirmText: "Send",
                onConfirm,
                close: () => { },
            });
        }

        patch(Composer.prototype, {
            async sendMessage() {
                if (this.props.type === "message" && this.props.mode === "extended") {
                    const body = await prettifyMessageContent(this.props.composer.text);
                    await addConfirmationDialog(this, body, this.props.composer.attachments, async () => {
                        await super.sendMessage();
                    });
                } else {
                    await super.sendMessage();
                }
            }
        });

        const MailComposerSendDropdown = registry.category("view_widgets").get("mail_composer_send_dropdown").component;
        patch(MailComposerSendDropdown.prototype, {
            setup() {
                this.store = useService("mail.store");
                super.setup();
            },
            async onClickSend() {
                const data = this.props.record.data;
                if (!data.subtype_is_log) {
                    addConfirmationDialog(this, data.body, data.attachment_ids._currentIds, async () => {
                        await super.onClickSend();
                    });
                } else {
                    await super.onClickSend();
                }
            }
        });
        return __exports;
    });
}
