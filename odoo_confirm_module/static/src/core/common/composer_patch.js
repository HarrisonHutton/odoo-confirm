import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";
import { ViewButton } from "@web/views/view_button/view_button";
import { registry, KeyNotFoundError } from "@web/core/registry";
import { MessageConfirmDialog } from "@mail/core/common/message_confirm_dialog";
import { Message } from "@mail/core/common/message";
import { prettifyMessageContent } from "@mail/utils/common/format";
import { useService } from "@web/core/utils/hooks";
const userModule = require("@web/core/user"); // 17.0 compatibility

async function addConfirmationDialog(body, attachment_ids, callback) {
    // Message renamed in saas-18.1
    const service = this.store["mail.message"] ? this.store["mail.message"] : this.store.Message;
    const message = service.insert({
        body,
        attachment_ids,
        attachments: attachment_ids, // 17.0 compatibility
        author: this.store.Persona.get({
            type: "partner",
            id: this.user.partnerId
        })
    }, { html: true });

    this.env.services.dialog.add(MessageConfirmDialog, {
        title: "Odoo Confirm 😺",
        prompt: "Are you sure you want to send this message?",
        message,
        messageComponent: Message, // 17.0 compatibility
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
            const text = this.props.composer.textInputContent ? this.props.composer.textInputContent : this.props.composer.text; // 17.0 compatibility
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

// 18.0 full composer uses MailComposerSendDropdown
try {
    // MailComposerSendDropdown is not exported, so we get it from the registry
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
