// console.log script for looking up the chrome.storage.local
// chrome.storage.local.get(console.log)

// save the key word
const saveKeyWord = (inputValue) => {
  // get keyword from input
  const keyword = inputValue.toLowerCase();
  // Retrieve the stored values from the storage
  chrome.storage.local.get({ keywordsArray: [] }, (result) => {
    const keywordsArray = result.keywordsArray;
    if (keywordsArray.includes(keyword)) {
      return;
    }
    // Add the new value to the array
    keywordsArray.push(keyword);
    // Store the updated array in the storage
    chrome.storage.local.set({ keywordsArray: keywordsArray }, () => {
      console.log("value saved!", `updated Array: ${keywordsArray}`);
      // Show "Click Detected" div temporarily
      const clickDetectedDiv = document.getElementById("save-detected");
      clickDetectedDiv.classList.remove("hidden");
      setTimeout(() => {
        clickDetectedDiv.classList.add("hidden");
      }, 2000);
    });
  });
};

const resetLocalStorage = () => {
  chrome.storage.local.clear();
  // Show "Click Detected" div temporarily
  const clickDetectedDiv = document.getElementById("reset-detected");
  clickDetectedDiv.classList.remove("hidden");
  setTimeout(() => {
    clickDetectedDiv.classList.add("hidden");
  }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save-btn");
  const inputField = document.getElementById("keyword-input");
  const resetBtn = document.getElementById("reset-btn");
  const checkbox = document.getElementById("checkbox-input");

  saveBtn.addEventListener("click", () => {
    saveKeyWord(inputField.value);
    inputField.value = "";
  });

  resetBtn.addEventListener("click", () => {
    resetLocalStorage();
  });

  // get the current tab to send a message to content-script.
  const sendMessageToContentScript = (message) => {
    return new Promise((resolve) => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            resolve(response);
          });
        }
      );
    });
  };

  chrome.storage.local.get("hideTrending", (result) => {
    // If the value is present in storage, update the checkbox
    if (result.hideTrending) {
      checkbox.checked = true;
      sendMessageToContentScript({ action: "hide" }).then((response) => {
        console.log(response);
      });
    } else {
      checkbox.checked = false;
      sendMessageToContentScript({ action: "show" }).then((response) => {
        console.log(response);
      });
    }
  });

  checkbox.addEventListener("change", () => {
    const isChecked = checkbox.checked;
    const newState = isChecked ? true : false;

    chrome.storage.local.set({ hideTrending: newState }, () => {
      console.log(`Value saved! Updated state: ${newState}`);
      checkbox.checked = newState;
    });

    if (isChecked) {
      sendMessageToContentScript({ action: "hide" }).then((response) => {
        console.log(response);
      });
    } else {
      sendMessageToContentScript({ action: "show" }).then((response) => {
        console.log(response);
      });
    }
  });
});
