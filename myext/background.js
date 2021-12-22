//opening extension in new tab
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: "content.html" });
});

chrome.tabs.onUpdated.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].title.includes("https://myaccount.google.com/")) {
      chrome.runtime.sendMessage({
        what: "sign-in",
        tabToCloseId: tabs[0].id,
      });
    } else if (tabs[0].title.includes("https://accounts.google.com/")) {
      if (tabs[0].title.includes("Logout")) {
        localStorage["logged_in_user"] = "";
      }
      chrome.runtime.sendMessage({
        what: "check-in-login",
      });
    }
  });
});
