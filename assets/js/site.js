/* Shared enhancement for the supplied calendar-subscription component. */
(() => {
  "use strict";
  const config = window.CFMR_CONFIG || {};
  const feedback = document.getElementById("cfmr-feedback");
  const googleLink = document.getElementById("cfmr-google");
  const appleLink = document.getElementById("cfmr-apple");
  const outlookButton = document.getElementById("cfmr-outlook");
  if (!feedback || !googleLink || !appleLink || !outlookButton) return;

  const googleUrl = (config.calendarGoogleShareUrl || "").trim();
  const icsUrl = (config.calendarPublicIcsUrl || "").trim();
  const validHttps = value => /^https:\/\//i.test(value);
  const showMessage = message => { feedback.textContent = message; };

  if (validHttps(googleUrl)) {
    googleLink.href = googleUrl;
    googleLink.target = "_blank";
    googleLink.rel = "noopener noreferrer";
  } else {
    googleLink.addEventListener("click", event => {
      event.preventDefault();
      showMessage("Calendar setup pending: add the Google Calendar shareable link in assets/js/config.js.");
    });
  }

  if (validHttps(icsUrl)) {
    appleLink.href = icsUrl.replace(/^https:/i, "webcal:");
  } else {
    appleLink.addEventListener("click", event => {
      event.preventDefault();
      showMessage("Calendar setup pending: add the public iCal (.ics) subscription URL in assets/js/config.js.");
    });
  }

  outlookButton.addEventListener("click", async () => {
    if (!validHttps(icsUrl)) {
      showMessage("Calendar setup pending: add the public iCal (.ics) subscription URL in assets/js/config.js.");
      return;
    }
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(icsUrl);
      showMessage("Subscription URL copied. In Outlook Calendar, choose Add calendar → Subscribe from web, paste the URL, and select Import / Save.");
    } catch {
      showMessage("Copy this URL and paste it into Outlook Calendar → Add calendar → Subscribe from web: " + icsUrl);
    }
  });
})();
