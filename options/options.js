async function main(){
  //get current settings
  const settings = await chrome.storage.local.get(null)

  //set current settings on webpage
  for(const option in settings){
    const settingElement = document.querySelector("#" + option)

    if(settingElement.nodeName === "INPUT"){
      settingElement.checked = settings[option]
    }
    else if(settingElement.nodeName === "SELECT"){
      settingElement.value = settings[option]
    }
    else{
      console.warn("Node name not detected: ", settingElement.nodeName)
    }
  }

  //get which values the user changed
  function getChangedSettings(){
    let result = {}

    for(const option in settings){
      const settingElement = document.querySelector("#" + option)
      
      const state = (settingElement.checked ?? settingElement.value)

      if(state !== settings[option]){
        result[option] = state
      }
    }
    return result
  }

  const saveButton = document.querySelector("#saveButton")

  //Save button functionality
  saveButton.addEventListener("click", async function(){
    saveButton.disabled = true
    saveButton.textContent = "Saving"

    const changes = getChangedSettings()
    console.log(changes)
    
    //only run code if any changes were made
    if(Object.keys(changes).length > 0){
        
      //Send message to service worker
      if(changes.theme){
        chrome.runtime.sendMessage({action: "changeTheme", details: changes.theme})
      }
      
      await chrome.storage.local.set(changes)
      //testing
      //console.log(await chrome.storage.local.get(null))

      //apply changes to current settings
      for(const change in changes){
        settings[change] = changes[change]
      }
    }

    saveButton.disabled = false
    saveButton.textContent = "Save"
  })
}

main()
