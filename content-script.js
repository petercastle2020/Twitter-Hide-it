const myFunction = () => {
  console.log("content-script.js being called on load.");
};
myFunction();

// chrome.storage.local.clear();

const getArticleArray = () => {
  console.log("getarticle being called.");
  const articleEl = document.getElementsByTagName("article");
  const ArrayForLoop = Array.from(articleEl);

  if (ArrayForLoop.length > 0) {
    articleArray = ArrayForLoop;
    return ArrayForLoop;
  }
};

let articleArray = [];

// Function that runs every time there is a change in the DOM
const handleDOMChange = (ArrayForLoop) => {
  console.log(ArrayForLoop);
  // Retrieve the stored values from the storage
  chrome.storage.local.get({ keywordsArray: [] }, (result) => {
    const keywordsArray = result.keywordsArray;

    // checking for article text
    console.log("NUMBER OF ITEM IN THE ARTICLE ARRAY", ArrayForLoop.length);
    for (let i = 0; i < ArrayForLoop.length; i++) {
      const test = ArrayForLoop[i].querySelector("[data-testid='tweetText']");
      console.log(test.children[0].innerHTML);
      if (ArrayForLoop[i].getAttribute("data-rendered") === "true") {
        console.log(
          ArrayForLoop[i],
          "<-- element data-rendered === true / SKIP"
        );

        continue; // skip to the next iteration
      }

      const spanTextParentDiv = ArrayForLoop[i].querySelector(
        "[data-testid='tweetText']"
      );

      // checking for the matches
      if (spanTextParentDiv) {
        const spanText = spanTextParentDiv.children[0].innerHTML;

        // console.log(spanText);
        keywordsArray.forEach((keyword) => {
          console.log(keywordsArray);

          const regex = new RegExp("\\b" + keyword + "\\b", "i");
          if (regex.test(spanText)) {
            console.log(`${spanText.toLowerCase()} it is a match.`);
            console.log(ArrayForLoop[i], "will be removed.");
            ArrayForLoop[i].style.display = "none";
          } else {
            console.log(`${spanText.toLowerCase()}is NOT a match`);
          }
          ArrayForLoop[i].setAttribute("data-rendered", true);
        });
      }
    }
  });
};

// Wait for articles
const waitForArticle = () => {
  const articleEl = document.getElementsByTagName("article");
  const ArrayForLoop = Array.from(articleEl);

  if (ArrayForLoop.length > 0) {
    console.log("article loaded.", ArrayForLoop);
    handleDOMChange(ArrayForLoop);
    articleArray = ArrayForLoop;
    return ArrayForLoop;
  } else {
    window.requestAnimationFrame(waitForArticle);
    return;
  }
};

window.requestAnimationFrame(waitForArticle);

// Wait for section
const waitForSection = () => {
  const sectionEl = document.querySelector("section:first-of-type");

  if (sectionEl) {
    console.log("section loaded.", sectionEl);
    return sectionEl;
    // Do something with myElement
  } else {
    window.requestAnimationFrame(waitForSection);
  }
};

window.requestAnimationFrame(waitForSection);

const waitForTrending = () => {
  const trendingEl = document.querySelector(
    '[aria-label="Timeline: Trending now"]'
  );

  if (trendingEl) {
    console.log("TRENDING LOADED", trendingEl);
    return trendingEl;
    // trendingEl.style.visibility = "hidden";
  } else {
    window.requestAnimationFrame(waitForTrending);
  }
};

window.requestAnimationFrame(waitForTrending);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
});

// Trending Local storage.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("ADD LISTENER CONTENT SCRIPT LLJSDLKJAS");
  console.log("--->", message);
  let trendingEl = waitForTrending();
  console.log(trendingEl);
  if (message.action === "hide") {
    trendingEl.style.visibility = "hidden";
  } else if (message.action === "show") {
    trendingEl.style.visibility = "visible";
  }
});

// Send a message to the background script when the content script is ready

// Listen for messages from the background script

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(
//     "message received IN CONTENT SCRIPT TO UPDATE VIEW",
//     message.data
//   );
//   if (message.action === "hide") {
//     let trendingEl = waitForTrending();
//     trendingEl.style.visibility = "hidden";
//   } else if (message.action === "show") {
//     let trendingEl = waitForTrending();
//     trendingEl.style.visibility = "visible";
//   }
// });
// console.log("I was called.");

// chrome.storage.local.get("hideTrending", (result) => {
//   // If the value is present in storage, update the checkbox
//   console.log(trendingEl);
//   if (result.hideTrending) {
//     trendingEl.style.visibility = "hidden";
//   } else {
//     trendingEl.style.visibility = "visible";
//   }
// });

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.screenY >= document.body.offsetHeight) {
    handleDOMChange(getArticleArray());
  }
});
