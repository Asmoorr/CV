export const ENTRY_SESSION_KEY = "cv:entry-seen:v1";

export const ENTRY_BOOTSTRAP = `(function(){try{var seen=sessionStorage.getItem("${ENTRY_SESSION_KEY}")==="1";document.documentElement.setAttribute("data-entry-state",seen?"bypassed":"required")}catch(e){document.documentElement.setAttribute("data-entry-state","bypassed")}})()`;
