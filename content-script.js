// Function that runs every time there is a change in the DOM
const handleDOMChange = (articleArray) => {
  // Retrieve the stored values from the storage
  chrome.storage.local.get({ keywordsArray: [] }, (result) => {
    const keywordsArray = result.keywordsArray;
    // loop the Article Array
    for (let i = 0; i < articleArray.length; i++) {
      if (articleArray[i].getAttribute("filtered-status") === "true") {
        continue; // skip to the next iteration
      }

      const spanTextParentDiv = articleArray[i].querySelector(
        "[data-testid='tweetText']"
      );

      // checking for the matches
      if (spanTextParentDiv) {
        const spanText = spanTextParentDiv.children[0].innerHTML;
        keywordsArray.forEach((keyword) => {
          // sorting
          const regex = new RegExp("\\b" + keyword + "\\b", "i");
          if (regex.test(spanText)) {
            articleArray[i].style.display = "none";
          }
          // set "filtered-status" for all the elements came through.
          articleArray[i].setAttribute("filtered-status", true);
        });
      }
    }
  });
};

// Wait for articles
const waitForArticle = () => {
  const articleEl = document.getElementsByTagName("article");
  const articleArray = Array.from(articleEl);

  if (articleArray.length > 0) {
    handleDOMChange(articleArray);
  } else {
    window.requestAnimationFrame(waitForArticle);
    return;
  }
};

window.requestAnimationFrame(waitForArticle);

// Listen from changes in the extension UI
const MessageListener = (element) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let trendingEl = element;
    if (message.action === "hide") {
      trendingEl.style.visibility = "hidden";
      sendResponse("Trending tab set to hidden.");
    } else if (message.action === "show") {
      trendingEl.style.visibility = "visible";
      sendResponse("Trending tab set to NOT hidden.");
    }
  });
};

const waitForTrending = () => {
  // Twitter Trending tab just show up on 1022 or greater.
  if (window.innerWidth >= 1022) {
    const trendingEl = document.querySelector(
      '[aria-label="Timeline: Trending now"]'
    );
    if (trendingEl) {
      chrome.storage.local.get("hideTrending", (result) => {
        if (result.hideTrending) {
          trendingEl.style.visibility = "hidden";
        }
      });
      // set up the Listener to listen to popup.js
      MessageListener(trendingEl);
    } else {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          waitForTrending();
        }, 1000);
      });
    }
  }
};

// call the waitForTrending function initially
window.requestAnimationFrame(waitForTrending);

window.addEventListener("resize", () => {
  // call the waitForTrending function when the viewport size changes
  waitForTrending();
});

// fire the scroll every 200ms after user stop scrolling.
let timeout;

window.addEventListener("scroll", () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (window.innerHeight + window.screenY >= document.body.offsetHeight) {
      waitForArticle();
    }
  }, 200); // set the debounce time to 200ms
});
