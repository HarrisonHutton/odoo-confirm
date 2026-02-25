function odoo_confirm_saas_18_4() {
    odoo.define('odoo_confirm', ['@web/core/utils/patch', '@mail/core/common/composer', '@web/core/registry', '@mail/core/common/message_confirm_dialog', '@mail/utils/common/format', '@web/core/utils/hooks', '@web/core/user', '@web/views/view_button/view_button'], function (require) {
        'use strict';
        let __exports = {};
        const { patch } = require("@web/core/utils/patch");
        const { Composer } = require("@mail/core/common/composer");
        const { MessageConfirmDialog } = require("@mail/core/common/message_confirm_dialog");
        const { prettifyMessageContent } = require("@mail/utils/common/format");
        const { useService } = require("@web/core/utils/hooks");
        const { user } = require("@web/core/user");
        const { ViewButton } = require("@web/views/view_button/view_button");

        async function addConfirmationDialog(self, body, attachment_ids, onConfirm) {
            const message = self.store["mail.message"].insert({
                body,
                attachment_ids,
                author_id: self.store.Persona.get({
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

        patch(ViewButton.prototype, {
            setup() {
                this.store = useService("mail.store");
                super.setup();
            },
            onClick(ev) {
                const data = this.props.record.data;
                if (this.clickParams.name === "action_send_mail" && !data.subtype_is_log) {
                    addConfirmationDialog(this, data.body, data.attachment_ids._currentIds, async () => {
                        super.onClick(ev);
                    });
                } else {
                    super.onClick(ev);
                }
            }
        });
        return __exports;
    });
}
