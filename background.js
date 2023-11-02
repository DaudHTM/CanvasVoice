



var API_KEY = chrome.storage.local["key"]
API_KEY = "AIzaSyCkMLIUWOXqXa5GxnR3tH7e5eOzzZuocHs"
  const url = 'https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key='+API_KEY;






const context = "You are Canvas Voice, a virtual guide for the Howard County Public School System's Canvas platform, Google Drive, and Synergy. Your role is to assist students in navigating these tools with precise step-by-step instructions. When responding, provide only the requested information without additional explanations, instructions, or supplementary details. Focus solely on giving concise navigation assistance; do not offer information unrelated to the platform. Remember to emphasize the tools used by HCPSS, including Canvas, Google Drive, and Synergy. If a student requests additional information, provide it only if directly related to their original question. No need for signing in stepNavigation will start from the current page that the user is on along with this"
const messages = [];


async function palmAI(text){


  
messages.push({ "content": text });

const data = {
  temperature: 0.2,
  candidateCount: 1,
 
  prompt: {
    
    
    text: context + text,
  },

}


var result = ""

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
const responseData = await response.json();
   

if (responseData.candidates && responseData.candidates.length > 0) {
  return responseData.candidates[0].output;
}
return responseData
}


chrome.runtime.onMessage.addListener(function(action,sender,sendResponse) {
  console.log(action.action)
  console.log(action.text)
  if(action.action=="palm"){
    palmAI(action.text)
  .then(output => {
    sendResponse(output);
    speak(output)
    console.log('Returned Output:', output);
    

  })
  .catch(error => {
    console.error('Error:', error);
  });
  return true;
  }
  else if(action.action=="speak"){
    speak(action.text)
  }
  else if(action.action=="stop"){
    stopSpeaking()
  }
  else if(action.action=="configapi"){
    API_KEY=action.text

chrome.storage.local["key"] = action.text
  }
});



function speak(text) {
  chrome.tts.speak(text, {
      'rate': 1.3, // Speed of speech. 1.0 is the normal speed, 0.5 is half speed, and 2.0 is double speed.
      'pitch': 1.3, // The pitch of the voice. 1.0 is the normal pitch.
      'volume': 1.0 // The volume of the voice. 1.0 is the normal volume.
  });
}

function stopSpeaking(){
  chrome.tts.stop();
}

function getTabID(){
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var tabId = tabs[0].id;
  console.log(tabId);
});
return tabId
}

function simulateKeyPresses(text) {
  console.log("DFDF")
  // Attach the debugger to the tab
  chrome.debugger.attach({ tabId: tabId }, '1.0', function() {
      // Once the debugger is attached, we can send commands
      for (let i = 0; i < text.length; i++) {
          chrome.debugger.sendCommand({ tabId: getTabID }, 'Input.dispatchKeyEvent', { type: 'char', text: text[i] });
      }
      // Detach the debugger when we're done
      chrome.debugger.detach({ tabId: tabId });
  });
}
