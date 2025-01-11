import { patch } from "@web/core/utils/patch";
import { Composer } from "@mail/core/common/composer";

// import { MessageConfirmDialog } from "@mail/core/common/message_confirm_dialog";
// import { _t } from "@web/core/l10n/translation";
// import { toRaw } from "@odoo/owl";

patch(Composer.prototype, {
    async sendMessage() {
        // Ideally we would use the confirm dialog from mail like this
        // But composer.message does not exist yet
        // const composer = toRaw(this.props.composer);
        // this.env.services.dialog.add(MessageConfirmDialog, {
        //     message: composer.message,
        //     onConfirm: () => super.sendMessage(...arguments),
        //     prompt: _t("Are you sure you want to send this message?"),
        // });
        if (this.props.type != "note" && !confirm("Are you sure you want to send this message?")) {
            return;
        }
        await super.sendMessage(...arguments);
    }
});