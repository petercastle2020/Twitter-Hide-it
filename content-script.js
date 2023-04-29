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
    console.log(keywordsArray, "<--- LIST KEYWORDS");
    // checking for article text
    console.log("NUMBER OF ITEM IN THE ARTICLE ARRAY", ArrayForLoop.length);
    for (let i = 0; i < ArrayForLoop.length; i++) {
      // const test = ArrayForLoop[i].querySelector("[data-testid='tweetText']");
      // console.log(test.children[0].innerHTML);
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

// Listen from changes in the extension UI
const MessageListener = (element) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("onMessage.addListener called in content-script.");
    console.log("--->", message);
    let trendingEl = element;
    console.log(trendingEl);
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
  } else {
    console.log(
      "window.innerWidth lower than 1022px, Trending tab not available."
    );
  }
};

// call the waitForTrending function initially
window.requestAnimationFrame(waitForTrending);

window.addEventListener("resize", () => {
  console.log("Viewport size changed!");
  // call the waitForTrending function when the viewport size changes
  waitForTrending();
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.screenY >= document.body.offsetHeight) {
    handleDOMChange(getArticleArray());
  }
});
