
//Removing "promoted" posts
function removeDataNosnippet(){
  const elements = document.querySelectorAll('span[data-nosnippet="true"]') //Note: this also selects ads that are already hidden. fix later
  
  if (elements.length > 0){
    console.log("Data nosnippet: ", elements.length)

    elements.forEach((element) => {
      element.parentElement.style.display = "none"
    })
  }
}

//Removing related question boxes
function removeRelatedQuestions(){
  const elements = document.querySelectorAll('#mainContent > div:not([class]) > div[class="q-box qu-borderAll qu-borderRadius--small qu-borderColor--raised qu-boxShadow--small qu-mb--small qu-bg--raised"]') //Note: this also selects related questions that are already hidden. fix later
  
  if (elements.length > 0){
    console.log("Related questions: ", elements.length)

    elements.forEach((element) => {
      //Makes sure that the ai response isn't also removed
      if(element.firstChild.style.position !== "relative"){
        element.style.display = "none"
      }
    })
  }
}

//Remove query strings (?) and fragment identifier (#)
//Returns string
function reformatURL(url){
  let result = url

  //remove query strings
  const queryStringIndex = result.indexOf('?')
  if (queryStringIndex !== -1){
    result = result.slice(0, queryStringIndex)
  } 
  
  //remove fragment identifiers
  const fragmentIndex = url.indexOf('#')
  if (fragmentIndex !== -1){
    result = result.slice(0, fragmentIndex)
  } 

  return result
}

//callback for observer
const cb_docChange = (mutationsList, observer) => {
  for (const mutation of mutationsList){
    if (mutation.type === 'childList'){
      //Code here runs when something on the webpage changes
      console.log("change detected")
      removeDataNosnippet()
      removeRelatedQuestions()
    }
  }
}

//Note to self: the current url of the DOM can be accessed with document.URL (returns a string and includes the "https://" part of the url)

//Main section of webpage containing posts​
const pageMain = document.querySelector("#mainContent > div:not([class])")

//Run code if main section of page exists
if (pageMain){
  console.log("Main page detected")

  //Send message to notify that a question is being viewed
  chrome.runtime.sendMessage({message: "fetchQuestionDetails"})

  //Remove signup wall
  const signupWall = document.querySelector("#root > div > div.q-box > div:nth-child(2) > div")

  if (signupWall){
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

  //Remove "related questions" at the bottom of the screen
  const relatedBox = document.querySelector("#mainContent > div.q-box.qu-mt--small > div.dom_annotate_related_questions")?.parentElement
  relatedBox?.remove()
  removeRelatedQuestions()

  //Remove ad under header (as well as promoted posts)
  removeDataNosnippet()

  const observer = new MutationObserver(cb_docChange)
  observer.observe(pageMain, {childList: true, subtree: true,})
}
