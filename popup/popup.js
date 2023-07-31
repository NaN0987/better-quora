const manifest = chrome.runtime.getManifest()

const extensionName = document.querySelector("div.titleFlex > h1")
extensionName.textContent = manifest.name

const version = document.querySelector("span.version")
version.textContent = "Version " + manifest.version

const settingsButton = document.querySelector("#settingsButton")
settingsButton.addEventListener("click", function(){
    chrome.runtime.openOptionsPage()
})