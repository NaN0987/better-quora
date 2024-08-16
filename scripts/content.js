console.log("extension is running")

//querySelector constants
//if the website changes and we have to chanage the queryselectors, these constants should make that easier
const qs_dataNosnippet = 'span[data-nosnippet="true"]'

const qs_relatedQuestionBox = '#mainContent > div:not([class]) > div[class="q-box qu-borderAll qu-borderRadius--small qu-borderColor--raised qu-boxShadow--small qu-mb--small qu-bg--raised"]'

const qs_questionFeed = "#mainContent > div:not([class])"

const qs_questionTitle = "#mainContent > div.q-box.qu-borderAll.qu-borderRadius--small.qu-borderColor--raised.qu-boxShadow--small.qu-bg--raised > div > div > span > span > div > div > div > span > span"

const qs_signupWall = "#root > div > div.q-box > div:nth-child(2) > div"

const qs_sideAds = "#root > div > div.q-box > div:nth-child(1) > div.q-box.puppeteer_test_question_main > div > div:nth-child(2) > div > div > div.q-sticky"

const qs_bottomRelatedQuestions = "#mainContent > div.q-box.qu-mt--small > div.dom_annotate_related_questions"

const qs_questionComments = "#mainContent > div.q-box.qu-bg--raised > div:nth-child(2) > div.q-box"

const qs_commentAuthor = ":scope > div > div > div > div > div > div > div > div.q-flex.qu-alignItems--flex-start > div > div.q-box > span.q-box > span > div > a > div > span > span"

const qs_commentContent = ":scope > div > div.q-relative.qu-pb--tiny > div > div > div > div > div.q-box.qu-ml--small.qu-flex--auto > div.q-text"

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
const formattedURL = reformatURL(document.URL)

//Removing "promoted" posts
function removeDataNosnippet(){
  const ads = document.querySelectorAll(qs_dataNosnippet) //Note: this also selects ads that are already hidden. fix later
  
  if (ads.length > 0){

    ads.forEach((element) => {
      element.parentElement.style.display = "none"
    })
  }
}

//Removing AI response
function removeAIResponse(){
  const relatedBoxes = document.querySelectorAll(qs_relatedQuestionBox)
  
  if (relatedBoxes.length > 0){

    relatedBoxes.forEach((element) => {
      //only remove if it's the AI response
      if((element.firstChild.style.position === "relative")){
        element.style.display = "none"
      }
    })
  }
}

//Removing related question boxes
function removeRelatedQuestions(){
  //Removed related box at the bottom
  const relatedBoxBottom = document.querySelector(qs_bottomRelatedQuestions)?.parentElement
  
  if (relatedBoxBottom){
    relatedBoxBottom.style.display = "none"
  }
  
  const relatedBoxes = document.querySelectorAll(qs_relatedQuestionBox) //Note: this also selects related questions that are already hidden. fix later
  
  if (relatedBoxes.length > 0){

    relatedBoxes.forEach((element) => {
      //Makes sure that the ai response isn't also removed
      if(element.firstChild.style.position !== "relative"){
        element.style.display = "none"
      }
    })
  }
}

//Add "comments" button to post and adds question details if available
function scrapCommentSection(){
  const questionTitle = document.querySelector(qs_questionTitle)

  const htmlCode = '<hr/><a href="' + formattedURL + '/comments' + '"><h6 style="text-decoration: underline;">Comments</h6></a>'

  const commentsButton = document.createElement('div')
  commentsButton.innerHTML = htmlCode

  questionTitle.insertAdjacentElement('afterend', commentsButton)

  //load iframe of comments section
  const iframe = document.createElement('iframe')
  iframe.src = formattedURL + '/comments'
  iframe.style.display = 'none'
  commentsButton.insertAdjacentElement('afterend', iframe)

  //Activates when the iframe loads
  iframe.onload = function(){

    //click all (more) buttons
    const moreButtons = iframe.contentWindow.document.querySelectorAll("div.QTextTruncated__StyledReadMoreLink-sc-1pev100-3")

    moreButtons.forEach((button) => {
      button.click()
    })

    //select all of the comments
    const comments = iframe.contentWindow.document.querySelectorAll(qs_questionComments)

    //state how many comments there are
    console.log("Number of comments: ", comments.length)
    if (comments.length === 1){
      //one comment
      commentsButton.querySelector("h6").innerText = "1 Comment"
    }
    else if(comments[comments.length-1]?.querySelector("button")){
      //more comments than can be loaded (_+ Comments)
      commentsButton.querySelector("h6").innerText = (comments.length-1) + "+ Comments"
    }
    else{
      commentsButton.querySelector("h6").innerText = comments.length + " Comments"
    }
    
    const details = []
    
    //check each comment to see if it's from Quora Details bot or the original poster, and add its text to details
    comments.forEach((comment) => {

      const author = comment.querySelector(qs_commentAuthor)
      if (author){
        /* When the original poster makes a comment, a little svg icon appears. However, it doesn't appear immediatly, 
          so instead you have to queryselect the span that will contain it. */
        // Also you have to use ":scope" because comments can have comments.
        if ((author.innerText === "Quora Question Details Bot") || (comment.querySelector(":scope > div > div > div > div > div > div > div.q-box.qu-ml--small.qu-flex--auto > div.q-flex.qu-alignItems--flex-start span[width='16']"))){
          details.push(comment.querySelector(qs_commentContent))
        }
      }
      else if (!comment.querySelector("button")){
        console.warn("Apparently this comment doesn't have an author: ", comment)
      }
    })

    //spacing for details
    if (details.length > 0){
      questionTitle.parentElement.parentElement.parentElement.style.cssText += "width: 100%;"
      questionTitle.insertAdjacentElement("afterend", document.createElement('hr'))
    }


    //append details under question title
    details.forEach((commentContent) => {
      const divider = document.createElement("hr") //divider in case there's multiple comments
      divider.style.cssText = "border-width: 1px; border-style: inset;"

      //fix font size
      commentContent.style.cssText += "font-size: calc(15px * var(--dynamic-font-scale, 1))!important;"

      //append them before the comments button
      commentsButton.insertAdjacentElement('beforebegin', commentContent)
      commentsButton.insertAdjacentElement('beforebegin', divider)
    })

    iframe.remove()
  }
}

//Reveal more of the Quora plus questions
function improveQuoraPlus(){
  const paywalls = document.querySelectorAll("div.qu-zIndex--inline_overlay")

  for(const paywall of paywalls){
    //Lower paywall
    paywall.style.marginTop = "0px"
    //Remove fadeout
    paywall.parentElement.querySelector("div.qu-overflowY--hidden").classList.remove("jRIvsV")

    //Add Incognito button
    const incognitoButton = document.createElement("a")
    incognitoButton.style.cursor = "pointer"
    incognitoButton.style.textDecoration = "underline"
    incognitoButton.style.textAlign = "center"
    incognitoButton.style.marginTop = "7px"
    incognitoButton.style.display = "block"
    incognitoButton.textContent = "View Full Answer in Incognito Mode"
    incognitoButton.classList.add("incognitoButton")

    //Get the link to the exact post
    const profilelink = paywall.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector("a.q-box").href
    
    const profileName = profilelink.substring(profilelink.indexOf("/profile/") + 9)

    const postLink = formattedURL + "/answer/" + profileName


    //open window on click
    incognitoButton.addEventListener("click", function(){
      chrome.runtime.sendMessage({
        action: "createWindow", 
        windowObject: {
          url: postLink,
          incognito: true,
          type: "normal",
          state: "maximized"
        }
      })
    })

    //prevents answers with button from getting a second button
    if(!paywall.parentElement.parentElement.querySelector("a.incognitoButton")){
      paywall.parentElement.insertAdjacentElement("afterend", incognitoButton)
    }
  }
}

//Returns a string containing the subdomain of the url
function getSubdomain(url){
  let result = url

  const protocolIndex = result.indexOf("://")
  result = result.slice(protocolIndex+3, result.length)

  const period = result.indexOf('.')

  return result.slice(0, period)
}


/* Main programming Loop */

const languageList = ["www", "es", "fr", "de", "it", "jp", "id", "pt", "hi", "nl", "da", "fi", "no", "sv", "mr", "bn", "ta", "ar", "he", "gu", "kn", "ml", "te", "pl"]

const subdomain = getSubdomain(formattedURL)

//If the subdomain does not exist in the languageList, then it is a quora space and code should not execute
if(languageList.includes(subdomain)){

  //wait until user settings are obtained
  chrome.storage.local.get(null, function(settings){

    //redirect from home page
    if(settings.redirectToSearchPage && (formattedURL.endsWith("quora.com/"))){
      console.log("engage redirect")
      window.location.href = formattedURL + "search?q=%00"
    }

    //Main section of webpage containing posts​
    const questionFeed = document.querySelector(qs_questionFeed)

    //Run code if main section of page exists
    if (questionFeed){
      console.log("Question feed detected")

      //add "comments" button under question title and get question details
      scrapCommentSection()

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
      if(settings.removeRelatedQuestionsBox){
        removeRelatedQuestions()
      }

      //Remove AI response under question
      if(settings.removeAIResponse){
        removeAIResponse()
      }

      //Remove ad under header (as well as promoted posts)
      removeDataNosnippet()


      //Code here runs when something on the webpage changes
      const observer = new MutationObserver( (mutationsList, observer) => {
        for (const mutation of mutationsList){
          if (mutation.type === 'childList'){
            console.log("change detected")
            removeDataNosnippet()
    
            if(settings.removeRelatedQuestionsBox){
              removeRelatedQuestions()
            }
    
            improveQuoraPlus()
          }
        }
      })

      observer.observe(questionFeed, {childList: true, subtree: true,})
    }
  })
}
