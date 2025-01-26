import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { ViewButton } from "@web/views/view_button/view_button";
import { registry, KeyNotFoundError } from "@web/core/registry";

function addConfirmationDialog(callback) {
    this.env.services.dialog.add(ConfirmationDialog, {
        title: "Odoo Confirm 😺",
        body: "Are you sure you want to send this message?",
        confirmLabel: "Send",
        confirm: callback,
        cancel: () => { },
    });
}

patch(Composer.prototype, {
    async sendMessage() {
        if (this.props.type === "message" && this.props.mode === "extended") {
            addConfirmationDialog.call(this, async () => {
                await super.sendMessage(...arguments);
            });
        } else {
            await super.sendMessage(...arguments);
        }
    }
});

patch(ViewButton.prototype, {
    onClick(ev) {
        if (this.clickParams.name === "action_send_mail" && !this.props.record.data.subtype_is_log) {
            addConfirmationDialog.call(this, () => {
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
        async onClickSend() {
            if (!this.props.record.data.subtype_is_log) {
                addConfirmationDialog.call(this, async () => {
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
