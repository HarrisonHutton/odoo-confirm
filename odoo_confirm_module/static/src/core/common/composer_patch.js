import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

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