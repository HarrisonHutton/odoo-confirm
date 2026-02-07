const DomainFilter = (() => {
    function normalizeDomain(input) {
        if (!input || typeof input !== "string") return "";
        let cleaned = input.trim();
        cleaned = cleaned.replace(/^[a-zA-Z]+:\/\//, "");
        cleaned = cleaned.split(/[/?#]/)[0];
        cleaned = cleaned.split(":")[0];
        cleaned = cleaned.replace(/\.+$/, "");
        return cleaned.toLowerCase();
    }

    function matchesDomain(currentDomain, pattern) {
        if (!currentDomain || !pattern) return false;

        const current = currentDomain.toLowerCase().trim();
        const base = pattern.toLowerCase().trim();

        if (base.startsWith("*.")) {
            const suffix = base.slice(2);
            return current === suffix || current.endsWith("." + suffix);
        }

        return current === base || current === "www." + base;
    }

    function isValidDomain(domain) {
        if (!domain || typeof domain !== "string") return false;
        const trimmed = domain.trim();
        if (trimmed.length === 0 || trimmed.length > 253) return false;
        const pattern = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        return pattern.test(trimmed);
    }

    function shouldActivateConfirmation(currentDomain, settings) {
        if (!settings || !settings.filterEnabled) return true;
        if (!Array.isArray(settings.domains) || settings.domains.length === 0) {
            return settings.filterMode === "blacklist";
        }

        const domainInList = settings.domains.some((pattern) => matchesDomain(currentDomain, pattern));

        return settings.filterMode === "whitelist" ? domainInList : !domainInList;
    }

    function isDuplicate(domain, existingDomains) {
        const normalized = domain.toLowerCase().trim();
        return existingDomains.some((d) => d.toLowerCase().trim() === normalized);
    }

    return {
        normalizeDomain,
        matchesDomain,
        isValidDomain,
        shouldActivateConfirmation,
        isDuplicate,
    };
})();
