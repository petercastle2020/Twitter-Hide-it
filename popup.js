const test = "I am a test const.";
console.log(test);

const myFunction = () => {
  console.log("Come on code, do something.");
};

myFunction();
// console.log script for looking up the chrome.storage.local
// chrome.storage.local.get(console.log)

// save the key word
const saveKeyWord = (inputValue) => {
  console.log("I am working saveKey");
  console.log(inputValue);
  // get keyword from input
  const keyword = inputValue.toLowerCase();
  // Retrieve the stored values from the storage
  chrome.storage.local.get({ keywordsArray: [] }, (result) => {
    console.log(result.keywordsArray);
    const keywordsArray = result.keywordsArray;
    console.log(keywordsArray);
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

  saveBtn.addEventListener("click", () => {
    saveKeyWord(inputField.value);
    inputField.value = "";
  });

  resetBtn.addEventListener("click", () => {
    resetLocalStorage();
  });
});
