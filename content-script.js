const handleDOMChange = (articleArray) => {
  // Retrieve the stored values from the storage
  chrome.storage.local.get({ keywordsArray: [] }, (result) => {
    const keywordsArray = result.keywordsArray;

    // check both arrays for values.
    if (!Array.isArray(keywordsArray) || keywordsArray.length === 0) {
      return;
    }
    if (!Array.isArray(articleArray) || articleArray.length === 0) {
      return;
    }

    // loop the Article Array
    for (let i = 0; i < articleArray.length; i++) {
      if (!(articleArray[i] instanceof Element)) {
        continue;
      }

      if (articleArray[i].getAttribute("filtered-status") === "true") {
        continue; // skip to the next iteration on filtered items.
      }

      const spanTextParentDiv = articleArray[i].querySelector(
        "[data-testid='tweetText']"
      );

      if (!(spanTextParentDiv instanceof Element)) {
        continue;
      }

      // checking for the matches
      if (spanTextParentDiv) {
        const spanText = spanTextParentDiv.children[0].textContent;

        for (let j = 0; j < keywordsArray.length; j++) {
          const keyword = keywordsArray[j];
          if (typeof keyword !== "string") {
            continue;
          }

          const regex = new RegExp("\\b" + keyword + "\\b", "i");
          if (regex.test(spanText)) {
            articleArray[i].style.display = "none";
          }
          // set "filtered-status" for all the elements going through.
          articleArray[i].setAttribute("filtered-status", true);
        }
      }
    }
  });
};

// run once updating the UI removing the latest word without the need to reload / scroll of the main filter
const updateUI = (keyword) => {
  const articleEl = document.getElementsByTagName("article");
  const articleArray = Array.from(articleEl);

  // check both arrays for values.
  if (!keyword) {
    return;
  }
  if (!Array.isArray(articleArray) || articleArray.length === 0) {
    return;
  }

  if (articleArray.length > 0) {
    for (let i = 0; i < articleArray.length; i++) {
      const spanTextParentDiv = articleArray[i].querySelector(
        "[data-testid='tweetText']"
      );
      // checking for the matches
      if (spanTextParentDiv) {
        const spanText = spanTextParentDiv.children[0].textContent;
        // sorting
        const regex = new RegExp("\\b" + keyword + "\\b", "i");
        if (regex.test(spanText)) {
          articleArray[i].style.display = "none";
        }
      }
    }
  } else {
    window.requestAnimationFrame(updateUI);
    return;
  }
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
    } else if (message.action === "updateUI") {
      const keyword = message.keyword;
      updateUI(keyword);
      sendResponse("updateUI action triggered.");
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
