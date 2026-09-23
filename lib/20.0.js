
function odoo_confirm_20_0() {
    odoo.define('odoo_confirm', ['@web/core/utils/patch', '@mail/core/common/composer', '@mail/utils/common/format', '@web/core/utils/hooks', '@web/core/user', '@web/views/view_button/view_button', '@odoo/owl', '@web/core/dialog/dialog', '@mail/core/common/discuss_component_registry'], function (require) {
        'use strict';
        let __exports = {};
        const { patch } = require("@web/core/utils/patch");
        const { Composer } = require("@mail/core/common/composer");
        const { prettifyMessageContent } = require("@mail/utils/common/format");
        const { useService } = require("@web/core/utils/hooks");
        const { user } = require("@web/core/user");
        const { ViewButton } = require("@web/views/view_button/view_button");

        const { Component, xml, t, useProps } = require("@odoo/owl");
        const { Dialog } = require("@web/core/dialog/dialog");
        const { discussComponentRegistry } = require("@mail/core/common/discuss_component_registry");

        class OdooConfirmDialog extends Component {
            static components = { Dialog };
            static template = xml`
                <Dialog size="'md'" title.translate="Odoo Confirm 😺" contentClass="'o-bg-body'">
                    <p class="mx-3">Are you sure you want to send this message?</p>
                    <blockquote class="mx-3 fst-normal pe-none">
                        <t t-component="this.messageComponent" message="this.props.message" isReadOnly="true" hasActions="false"/>
                    </blockquote>
                    <t t-set-slot="footer">
                        <button class="btn btn-primary me-2" t-on-click="this.onClickConfirm">
                            <i class="oi oi-filled me-1 opacity-50" data-icon="send"/>
                            Send
                        </button>
                        <button class="btn btn-secondary me-2" t-on-click="this.props.close">
                            <i class="oi me-1 opacity-50" data-icon="close"/>
                            Cancel
                        </button>
                    </t>
                </Dialog>
                `;
            props = useProps({
                close: t.function(),
                message: t.object(),
                onConfirm: t.function(),
            });

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
            async onClick(ev) {
                const record = this.props.record;
                if (this.clickParams.name === "action_send_mail" && !record.data.subtype_is_log) {
                    await record.isDirty();
                    addConfirmationDialog(this, record.data.body, record.data.attachment_ids._currentIds, async () => {
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
