
var currentMode = "none";
var focusedElement = null;

var heyCanvas = false
var clickMode = false
var currentMode = ""

document.addEventListener('focus', function(event) {
  focusedElement = event.target;
});

document.addEventListener('blur', function() {
  focusedElement = null;
});

function strip(str){
 return str.replace(/\n/g, '').replace(/\s/g, '')
}

async function clickOnElement(element){

  var prevColor = ela.style.color
  ela.style.color = "red"
  await new Promise(resolve => setTimeout(resolve, 500));
  ela.style.color = prevColor
  ela.click();
  await new Promise(resolve => setTimeout(resolve, 50));


  var event = new MouseEvent('dblclick', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  ela.dispatchEvent(event);
}





function isElementVisible(element) {
  var style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function getAllVisibleSpanDivTexts() {
  var texts = new Set();

  function traverse(element) {
      if (isElementVisible(element)) {
          for (var i = 0; i < element.childNodes.length; i++) {
              var child = element.childNodes[i];
              if (child.nodeType === Node.ELEMENT_NODE) {
                  traverse(child);
              } else if (child.nodeType === Node.TEXT_NODE) {
                  var text = strip(child.textContent);
                  texts.add(text);
              }
          }
      }
  }

  var elements = document.querySelectorAll('span, div');
  elements.forEach(function(element) {
      traverse(element);
  });

  return Array.from(texts);
}




navigator.permissions.query({name:'microphone'}).then(function(permissionStatus) {
  if (permissionStatus.state === 'granted') {
    startRecognition(); // User has already granted permission, start recognition
  } else if (permissionStatus.state === 'prompt') {
    // Permission is not yet granted, you can show a button to request it
    let button = document.createElement('button');
    button.innerText = 'Grant Microphone Permission';
    button.addEventListener('click', function() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          startRecognition(); // Permission granted, start recognition
        })
        .catch(function(err) {
          console.log('Error occurred while accessing microphone: ' + err);
        });
    });
    document.body.appendChild(button);
  }
});

function startRecognition() {
  let recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = async function(event) {
    let interim_transcript = '';
    let final_transcript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    console.log('Interim: ' + interim_transcript);
    console.log('Final: ' + final_transcript);

    if(strip(final_transcript)=="stop"){
      chrome.runtime.sendMessage({ action: "stop", text:aiInput }, function(response) {
        console.log(response);
      });
    }

    if(currentMode=="heycanvas" && final_transcript.length>3){
      var aiInput = "["+getAllVisibleSpanDivTexts().join(', ')+"]     \n"
      aiInput = aiInput + final_transcript
      chrome.runtime.sendMessage({ action: "palm", text:aiInput }, function(response) {
        console.log(response);
      });

      currentMode=""
    }
    else if(currentMode=="click" && final_transcript.length>3){

        let elementsWithText = findElementsWithText(strip(final_transcript));
    
        console.log(elementsWithText)
    
        
        if(elementsWithText.length>0){
    
            ela = elementsWithText[0][0]
            console.log(ela)
            if(ela.tagName != "A" && ela.tagName!="BUTTON"){
              ela = elementsWithText[elementsWithText.length-1][0]
            }
    
            clickOnElement(ela);
    
    
        
      }

        currentMode=""
    }    else if(currentMode=="clickbox" && final_transcript.length>3){

      let elementsWithText = findInputFromText(strip(final_transcript));
  
      console.log(elementsWithText)
  
      
      if(elementsWithText.length>0){
  
          ela = elementsWithText[elementsWithText.length-1]
          console.log(ela)
       
  
          ela.focus();
  
  
      
    }

      currentMode=""
  }
    else if(currentMode=="typing" && final_transcript.length>0){
      console.log("d")
      chrome.runtime.sendMessage({ action: "typing", text:final_transcript }, function(response) {
        console.log(response);
      });

      if(strip(final_transcript)=="stoptyping"){
        chrome.runtime.sendMessage({ action: "speak", text:"stop typing" }, function(response) {
          console.log(response);
        });
        currentMode=""
        return
      }

      simulateTyping(final_transcript)

      
    }



    console.log(strip(final_transcript))

    if (strip(final_transcript) == "heycanvas" ){
      console.log("YES")
      chrome.runtime.sendMessage({ action: "speak", text:"yes" }, function(response) {
        console.log(response);
      });
      currentMode="heycanvas"
    }
    else if(strip(final_transcript) == "click" ){

      chrome.runtime.sendMessage({ action: "speak", text:"yes" }, function(response) {
        console.log(response);
      });
      currentMode="click"
    }
    else if(strip(final_transcript) == "type" ){

      chrome.runtime.sendMessage({ action: "speak", text:"typing" }, function(response) {
        console.log(response);
      });
      currentMode="typing"
    }else if(strip(final_transcript)=="clickbox"){
      chrome.runtime.sendMessage({ action: "speak", text:"yes" }, function(response) {
        console.log(response);
      });
      currentMode="clickbox"
    }


    
  };

  recognition.start();
}


function toArray(arraylike) {
  var array= new Array(arraylike.length);
  for (var i= 0, n= arraylike.length; i<n; i++)
      array[i]= arraylike[i];
  return array;
}

// The text you are looking for
function findElementsWithText(searchText) {
  // Function to check if an element or its children contain the search text
  function containsSearchText(element, depth = 0) {
      if (strip(element.textContent.toLowerCase()).includes(strip(searchText.toLowerCase()))) {
          return [true, depth];
      }
      for (let child of element.children) {
          let result = containsSearchText(child, depth + 1);
          if (result[0]) {
              return result;
          }
      }
      return [false, depth];
  }

  let buttons = document.getElementsByTagName('button');
  let aTags = document.getElementsByTagName('a')
  let cWiz = document.getElementsByTagName('div')
  let allElementsArray = Array.from(buttons);
  allElementsArray.push(...Array.from(aTags))
  allElementsArray.push(...Array.from(cWiz))
  
  let containsArray = allElementsArray.map(el => {
    let result = containsSearchText(el);
    
    if (result[0]) {

      if((el.getAttribute('onclick')!=null)||(el.getAttribute('href')!=null)||(el.getAttribute('aria-label')!=null)||el.tagName == "A"||el.tagName == "BUTTON"){

        // clickable
        return [el, result[1]];
       }
    
    }
  }).filter(el => el !== undefined);

  // Sort the array by depth
  containsArray.sort((a, b) => a[1] - b[1]);

  return containsArray;
}

window.addEventListener('load', function() {
let elementsWithText = findElementsWithText("Projectile Launcher");
console.log(elementsWithText);


var fullText = getAllVisibleSpanDivTexts();
console.log(fullText); // You can replace this with whatever you want to do with the result


let inputBoxes = findInputFromText("question");
console.log(inputBoxes);

inputBoxes[inputBoxes.length-1].click();

})

function simulateTyping(text) {
  // Get the active element
  var activeElement = document.activeElement;

  console.log(activeElement)

  // Check if the active element is an input field, textarea, or a Google Docs iframe
  if (
    activeElement &&
    (activeElement.tagName.toLowerCase() == 'input' ||
      activeElement.tagName.toLowerCase() == 'textarea' ||
      (activeElement.tagName.toLowerCase() == 'iframe' &&
        activeElement.className.includes('docs-texteventtarget-iframe')))
  ) {
    // Set the value of the active element to the input text
    if (activeElement.tagName.toLowerCase() == 'iframe') {
      // For Google Docs iframe, set innerHTML instead of value
      activeElement.contentDocument.body.innerHTML = text;
    } else {
      activeElement.value = text;
    }

    // Create a new input event
    var event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event
    activeElement.dispatchEvent(event);
  } else {
    console.log('No input field or text box is currently selected.');
  }
}




function findInputFromText(searchText) {
  // Function to recursively check if an element or its children contain the search text
  function containsSearchInput(element) {
    if (strip(element.textContent.toLowerCase()).includes(strip(searchText.toLowerCase()))) {
      return true;
    }
    for (let child of element.children) {
      if (containsSearchInput(child)) {
        return true;
      }
    }
    return false;
  }

  // Function to recursively find input elements
  function findInput(element) {
    if (element.tagName === 'INPUT') {
      return element;
    }
    for (let child of element.children) {
      let result = findInput(child);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // Get all elements on the page
  let allElements = document.querySelectorAll('*');

  // Filter elements that contain the search text
  let containingText = Array.from(allElements).filter(el => containsSearchInput(el));

  // Find input elements for each containing text element
  let inputElements = containingText.map(el => findInput(el)).filter(el => el !== null);

  return inputElements;
}




