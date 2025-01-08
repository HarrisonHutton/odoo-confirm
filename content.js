(function () {
    const originalFetch = window.fetch;
  
    window.fetch = async function (resource, init) {
      // Check if the request matches the "Send message" POST
      if (resource.includes("/mail/message/post")) {
        const userConfirmed = confirm("Are you sure you want to send this message?");
        if (!userConfirmed) {
          console.log("Request blocked by user confirmation.");
          return new Promise(() => {}); // Block the request
        }
      }
  
      // Proceed with the original request
      return originalFetch.apply(this, arguments);
    };
  })();