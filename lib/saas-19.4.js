function odoo_confirm_saas_19_4() {
    odoo.define('odoo_confirm', ['@web/core/utils/patch', '@mail/core/common/composer', '@mail/utils/common/format', '@web/core/utils/hooks', '@web/core/user', '@web/views/view_button/view_button', '@odoo/owl', '@web/core/dialog/dialog', '@mail/core/common/discuss_component_registry'], function (require) {
        'use strict';
        let __exports = {};
        const { patch } = require("@web/core/utils/patch");
        const { Composer } = require("@mail/core/common/composer");
        const { prettifyMessageContent } = require("@mail/utils/common/format");
        const { useService } = require("@web/core/utils/hooks");
        const { user } = require("@web/core/user");
        const { ViewButton } = require("@web/views/view_button/view_button");

        const { Component, xml } = require("@odoo/owl");
        const { Dialog } = require("@web/core/dialog/dialog");
        const { discussComponentRegistry } = require("@mail/core/common/discuss_component_registry");

        class OdooConfirmDialog extends Component {
            static components = { Dialog };
            static props = {
                close: Function,
                message: Object,
                onConfirm: Function,
            };
            static template = xml`
                <Dialog size="'md'" title.translate="Odoo Confirm 😺" contentClass="'o-bg-body'">
                    <p class="mx-3">Are you sure you want to send this message?</p>
                    <blockquote class="mx-3 fst-normal pe-none">
                        <t t-component="this.messageComponent" message="this.props.message" isReadOnly="true" hasActions="false"/>
                    </blockquote>
                    <t t-set-slot="footer">
                        <button class="btn btn-primary me-2" t-on-click="this.onClickConfirm">
                            <i class="fa fa-paper-plane me-1 opacity-50"/>
                            Send
                        </button>
                        <button class="btn btn-secondary me-2" t-on-click="this.props.close">
                            <i class="oi oi-close me-1 opacity-50"/>
                            Cancel
                        </button>
                    </t>
                </Dialog>
                `;

            get messageComponent() {
                return discussComponentRegistry.get("Message");
            }

            onClickConfirm() {
                this.props.onConfirm();
                this.props.close();
            }
        }

        function addConfirmationDialog(self, body, attachment_ids, onConfirm) {
            const message = self.store["mail.message"].insert({
                body,
                attachment_ids,
                author_id: user.partnerId,
            }, { html: true });
            self.env.services.dialog.add(OdooConfirmDialog, {
                message,
                onConfirm,
                close: () => { },
            });
        }

        patch(Composer.prototype, {
            async sendMessage() {
                if (this.props.type === "message" && this.props.mode === "extended") {
                    const body = await prettifyMessageContent(this.props.composer.composerText);
                    addConfirmationDialog(this, body, this.props.composer.attachments, async () => {
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
