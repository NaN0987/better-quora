
//Removing "promoted" posts
function removeDataNosnippet(){
  const elements = document.querySelectorAll('span[data-nosnippet="true"]') //Note: this also selects ads that are already hidden. fix later
  if(elements.length > 0){
    console.log(elements.length)
    elements.forEach((element) => {
      element.parentElement.style.display = "none"
    })
  }
}

//callback for observer
const cb_docChange = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      //Code here runs when something on the webpage changes
      console.log("change detected")
      removeDataNosnippet()
    }
  }
}

//Send message to notify that quora is being opened
chrome.runtime.sendMessage({message: "contentPageLoaded"})

//Main section of webpage containing posts​
const pageMain = document.querySelector("#mainContent > div:not([class])")

//Run code if main section of page exists
if(pageMain){
  console.log("Main page detected")

  //Remove signup wall
  const signupWall = document.querySelector("#root > div > div.q-box > div:nth-child(2) > div")

  if(signupWall){
    console.log("signup page detected")
    signupWall.remove()
    //This is fucking stupid
    //document.querySelector("#root > div > div.q-box > div:nth-child(1)").removeAttribute("filter")
    //document.querySelector("body").removeAttribute("overflow")
    document.querySelector("#root > div > div.q-box > div:nth-child(1)").style.filter = "none"
    document.querySelector("body").style.overflow = "initial"
  }

  //Remove ads that appear on the right side of the screen
  const sideAd = document.querySelector("#root > div > div.q-box > div:nth-child(1) > div.q-box.puppeteer_test_question_main > div > div:nth-child(2) > div > div > div.q-sticky")
  sideAd?.remove()

  removeDataNosnippet()

  const observer = new MutationObserver(cb_docChange)
  observer.observe(pageMain, {childList: true, subtree: true,})
}
