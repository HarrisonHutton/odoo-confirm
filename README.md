# Odoo Confirm 😺
An unofficial browser extension to make sure you don't accidentally "Send Message" instead of "Log Note".

Supports Odoo 17.0+

## Installation
Chrome:
- Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/odoo-confirm/nbgpibhiphkbaphjdaejedjbajaccacb)

Firefox:
- Install from our [Latest Github Release](https://github.com/hahu-odoo/odoo-confirm/releases/download/1.0.1/odoo-confirm-1.0.1.xpi)

_(Don't forget to refresh any existing Odoo tabs)_

## How to use?
When the extension is installed & active, the following confirmation dialog will pop up whenever you send a message:
![image](https://github.com/user-attachments/assets/c4e6d1cc-9df4-46a7-8dcd-b72d54516cce)

## Development
Chrome:
1. Clone this repository.
2. Go to the Extensions page by entering `chrome://extensions` in a new tab.
3. Enable Developer Mode by clicking the toggle switch next to "Developer mode".
4. Click the "Load unpacked" button and select the repository directory.

Firefox:
1. Clone this repository.
2. Enter `about:debugging` in the URL bar.
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Open the extension's directory and select any file inside the extension

Develop on the custom Odoo module `odoo_confirm_module`.
Then "build" by pasting the compiled Owl code from `web.assets_web.js` into `content.js` to be run by the Chrome extension.

Improvements / fixes / PR's welcome :)
