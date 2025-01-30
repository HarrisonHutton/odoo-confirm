import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";
import { ViewButton } from "@web/views/view_button/view_button";
import { registry, KeyNotFoundError } from "@web/core/registry";
import { MessageConfirmDialog } from "@mail/core/common/message_confirm_dialog";
import { _t } from "@web/core/l10n/translation";
import { toRaw } from "@odoo/owl";
import { user } from "@web/core/user";
import { prettifyMessageContent } from "@mail/utils/common/format";
import { useService } from "@web/core/utils/hooks";

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
