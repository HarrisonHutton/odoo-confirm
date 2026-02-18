document.addEventListener("DOMContentLoaded", async () => {
    const filterEnabledCheckbox = document.getElementById("filter-enabled");
    const filterOptionsDiv = document.getElementById("filter-options");
    const modeRadios = document.querySelectorAll('input[name="filter-mode"]');
    const domainInput = document.getElementById("domain-input");
    const addDomainBtn = document.getElementById("add-domain-btn");
    const domainError = document.getElementById("domain-error");
    const domainList = document.getElementById("domain-list");
    const helpText = document.getElementById("help-text");
    const statusMessage = document.getElementById("status-message");

    let currentSettings = null;
    const debouncedSave = createDebouncedSave(400);
    let statusTimer = null;

    const HELP_TEXTS = {
        whitelist: "<strong>Whitelist:</strong> Confirmation will only appear on the domains listed below",
        blacklist: "<strong>Blacklist:</strong> Confirmation will appear everywhere <em>except</em> on the domains listed below",
    };

    function flashStatus(msg, isError = false) {
        statusMessage.textContent = msg;
        statusMessage.hidden = false;
        statusMessage.classList.toggle("error", isError);
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => { statusMessage.hidden = true; }, 2000);
    }

    function onSaveDone(err) {
        flashStatus(err ? "Failed to save settings" : "Settings saved", err);
    }

    function updateFilterOptionsState() {
        filterOptionsDiv.classList.toggle("disabled", !currentSettings.filterEnabled);
    }

    function updateHelpText() {
        helpText.innerHTML = HELP_TEXTS[currentSettings.filterMode];
    }

    function renderDomainList() {
        domainList.innerHTML = "";

        if (currentSettings.domains.length === 0) {
            const li = document.createElement("li");
            li.className = "empty-state";
            li.textContent = "No domains added yet";
            domainList.appendChild(li);
            return;
        }

        for (const domain of currentSettings.domains) {
            const li = document.createElement("li");
            li.className = "domain-item";

            const span = document.createElement("span");
            span.className = "domain-item-text";
            span.textContent = domain;

            const btn = document.createElement("button");
            btn.className = "domain-remove-btn";
            btn.type = "button";
            btn.title = "Remove " + domain;
            btn.textContent = "\u2715";
            btn.setAttribute("aria-label", "Remove " + domain);
            btn.addEventListener("click", () => removeDomain(domain));

            li.appendChild(span);
            li.appendChild(btn);
            domainList.appendChild(li);
        }
    }

    function showDomainError(msg) {
        domainError.textContent = msg;
        domainError.hidden = false;
        domainInput.classList.add("input-error");
    }

    function clearDomainError() {
        domainError.hidden = true;
        domainError.textContent = "";
        domainInput.classList.remove("input-error");
    }

    function addDomain() {
        const raw = domainInput.value.trim();

        if (!raw) {
            showDomainError("Please enter a domain");
            return;
        }

        const domain = DomainFilter.normalizeDomain(raw);

        if (!DomainFilter.isValidDomain(domain)) {
            showDomainError('Invalid domain format. Use something like "mycompany.odoo.com" or "*.odoo.com"');
            return;
        }

        if (DomainFilter.isDuplicate(domain, currentSettings.domains)) {
            showDomainError("This domain is already in the list");
            return;
        }

        clearDomainError();
        currentSettings.domains.push(domain);
        domainInput.value = "";
        domainInput.focus();
        renderDomainList();
        saveImmediate();
    }

    function removeDomain(domain) {
        currentSettings.domains = currentSettings.domains.filter((d) => d !== domain);
        renderDomainList();
        saveImmediate();
    }

    async function saveImmediate() {
        try {
            await saveFilterSettings(currentSettings);
            onSaveDone(null);
        } catch (e) {
            onSaveDone(e);
        }
    }

    function renderSettings() {
        filterEnabledCheckbox.checked = currentSettings.filterEnabled;
        updateFilterOptionsState();

        for (const radio of modeRadios) {
            radio.checked = radio.value === currentSettings.filterMode;
        }
        updateHelpText();
        renderDomainList();
    }

    filterEnabledCheckbox.addEventListener("change", () => {
        currentSettings.filterEnabled = filterEnabledCheckbox.checked;
        updateFilterOptionsState();
        debouncedSave(currentSettings, onSaveDone);
    });

    for (const radio of modeRadios) {
        radio.addEventListener("change", () => {
            currentSettings.filterMode = radio.value;
            updateHelpText();
            debouncedSave(currentSettings, onSaveDone);
        });
    }

    addDomainBtn.addEventListener("click", addDomain);

    domainInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addDomain();
        }
    });

    domainInput.addEventListener("input", clearDomainError);

    currentSettings = await getFilterSettings();
    renderSettings();
});
