//use info from manifest so we can change extension details without having to modify the popup
const manifest = chrome.runtime.getManifest()

//set extension name
const extensionName = document.querySelector("div.titleFlex > h1")
extensionName.textContent = manifest.name

//set version number
const version = document.querySelector("span.version")
version.textContent = "Version " + manifest.version

//link to options page
const settingsButton = document.querySelector("#settingsButton")
settingsButton.addEventListener("click", function(){
  chrome.runtime.openOptionsPage()
})
