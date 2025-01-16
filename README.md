# Odoo Confirm 😺
A minimal Chrome extension to make sure you don't accidentally "Send Message" instead of "Log Note".

Supports Odoo 17.0+

## Installation
Chrome:
1. Clone/download this repository.
2. Go to the Extensions page by entering chrome://extensions in a new tab.
3. Enable Developer Mode by clicking the toggle switch next to "Developer mode".
4. Click the "Load unpacked" button and select the repository directory.
![image](https://github.com/user-attachments/assets/8320c909-9f11-4283-b94a-4603cb128af9)

## How to use?
When the extension is installed & active, the following confirmation dialog will pop up whenever you send a message:
![image](https://github.com/user-attachments/assets/c4e6d1cc-9df4-46a7-8dcd-b72d54516cce)

## Development
Develop on the custom Odoo module `odoo_confirm_module`.
Then "build" by pasting the compiled Owl code from `web.assets_web.js` into `content.js` to be run by the Chrome extension.

Improvements / fixes / PR's welcome :)
