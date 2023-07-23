//querySelector constants
//if the website changes and we have to chanage the queryselectors, these constants should make that easier
const qs_dataNosnippet = 'span[data-nosnippet="true"]'

const qs_relatedQuestionBox = '#mainContent > div:not([class]) > div[class="q-box qu-borderAll qu-borderRadius--small qu-borderColor--raised qu-boxShadow--small qu-mb--small qu-bg--raised"]'

const qs_questionFeed = "#mainContent > div:not([class])"

const qs_questionTitle = "#mainContent > div.q-box.qu-borderAll.qu-borderRadius--small.qu-borderColor--raised.qu-boxShadow--small.qu-bg--raised > div > div > span > span > div > div > div > span > span"

const qs_signupWall = "#root > div > div.q-box > div:nth-child(2) > div"

const qs_sideAds = "#root > div > div.q-box > div:nth-child(1) > div.q-box.puppeteer_test_question_main > div > div:nth-child(2) > div > div > div.q-sticky"

const qs_bottomRelatedQuestions = "#mainContent > div.q-box.qu-mt--small > div.dom_annotate_related_questions"

//Removing "promoted" posts
function removeDataNosnippet(){
  const elements = document.querySelectorAll(qs_dataNosnippet) //Note: this also selects ads that are already hidden. fix later
  
  if (elements.length > 0){
    console.log("Data nosnippet: ", elements.length)

    elements.forEach((element) => {
      element.parentElement.style.display = "none"
    })
  }
}

//Removing related question boxes
function removeRelatedQuestions(){
  const elements = document.querySelectorAll(qs_relatedQuestionBox) //Note: this also selects related questions that are already hidden. fix later
  
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

//Add "comments" button to post
function addCommentButton(){
  const questionTitle = document.querySelector(qs_questionTitle)

  const htmlCode = '<hr/><a href="' + reformatURL(document.URL) + '/comments' + '"><h6 style="text-decoration: underline;">Comments</h6></a>'

  const newElement = document.createElement('div')
  newElement.innerHTML = htmlCode

  questionTitle.insertAdjacentElement('afterend', newElement)
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
const questionFeed = document.querySelector(qs_questionFeed)

//Run code if main section of page exists
if (questionFeed){
  console.log("Question feed detected")

  //Send message to notify that a question is being viewed
  chrome.runtime.sendMessage({message: "fetchQuestionDetails"})

  //add "comments" button under question title
  addCommentButton()

  //Remove signup wall
  const signupWall = document.querySelector(qs_signupWall)

  if (signupWall){
    console.log("signup page detected")
    signupWall.remove()
    document.querySelector("#root > div > div.q-box > div:nth-child(1)").style.filter = "none" //remove blur
    document.querySelector("body").style.overflow = "initial" //enable scrolling
  }

  //Remove ads that appear on the right side of the screen
  const sideAd = document.querySelector(qs_sideAds)
  sideAd?.remove()

  //Remove "related questions" at the bottom of the screen
  const relatedBox = document.querySelector(qs_bottomRelatedQuestions)?.parentElement
  relatedBox?.remove()
  removeRelatedQuestions()

  //Remove ad under header (as well as promoted posts)
  removeDataNosnippet()

  const observer = new MutationObserver(cb_docChange)
  observer.observe(questionFeed, {childList: true, subtree: true,})
}
