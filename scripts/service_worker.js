/* NOTE TO SELF: cookies can only be accessed in background scripts, which the documentation happens to not mention at all. */

//cookie details objects
const m_s = {
  name: "m-s",
  url: "https://quora.com"
}

const m_b = {
  name: "m-b",
  url: "https://quora.com"
}

const m_b_lax = {
  name: "m-b_lax",
  url: "https://quora.com"
}

const m_b_strict = {
  name: "m-b_strict",
  url: "https://quora.com"
}

const m_signup_form_type = {
  name: "m-signup_form_type",
  url: "https://quora.com"
}

const m_theme = {
  name: "m-theme",
  url: "https://quora.com",
}

//default settings
const defaultSettings = {
  theme: "dark",
  removeAIResponse: false,
  removeRelatedQuestionsBox: true,
  redirectToSearchPage: false
}

//This function allows you to change the value of a cookie using only its CookieDetails (unlike chrome.cookies.set())
//cookie: CookieDetails, value: string
function changeCookieValue(cookieDetails, value){
  chrome.cookies.get(cookieDetails, function(cookie){
    console.log("Obtained cookie: ", cookie)
    if(cookie){
      chrome.cookies.set({
        url: cookieDetails.url,
        name: cookie.name,
        value: value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: (cookie.expirationDate ?? 2000000000), //2033 in unix epoch (fix later)
        storeId: cookie.storeId
      })
    }
    else{
      console.warn("WARNING: the cookie you're trying to change the value of does not exist: ", cookieDetails)
      chrome.cookies.set({
        url: cookieDetails.url,
        name: cookieDetails.name,
        value: value,
        domain: ".quora.com",
        path: "/",
        expirationDate: 2000000000, //2033 in unix epoch (fix later)
      })
    }      
  })
}

function removeTrackerCookies(){
  chrome.cookies.remove(m_s)
  chrome.cookies.remove(m_b)
  chrome.cookies.remove(m_b_lax)
  chrome.cookies.remove(m_b_strict)
  chrome.cookies.remove(m_signup_form_type) 
}

function setDarkMode(){
  changeCookieValue(m_theme, "dark")
}

function setLightMode(){
  changeCookieValue(m_theme, "light")
}

async function setDefaultSettings(){
  //await chrome.storage.local.clear()
  const settings = await chrome.storage.local.get(null)
  console.log(settings)
  //every key in defaultSettings that doesn't exist in settings is added to settings
  for(const key in defaultSettings){
    if(!settings.hasOwnProperty(key)){
      chrome.storage.local.set({ [key]: defaultSettings[key] })
    }
  }
}

//Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    //run code on first install
    setDarkMode()
    setDefaultSettings()
  }
  else if(details.reason == "update"){
    //run code on update
    setDefaultSettings()
  }
})

//Sleeping function for testing
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

chrome.runtime.onMessage.addListener(function(message){
  console.log("message recieved!")
  
  //"message.action" contains what the service worker should do
  switch(message.action){
    case "deleteTrackerCookies":
      removeTrackerCookies()
      break

    case "changeTheme":
      if(message.details === "light"){
        setLightMode()
      }
      else if (message.details === "dark"){
        setDarkMode()
      }
      else{
        console.warn("Unknown theme: ", message.details)
      }
      break
    
    case "createWindow":
      chrome.windows.create(message.windowObject)
    
    default:
      console.warn("Unknown message: ", message.action)
      break
  }

})
