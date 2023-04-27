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
    sectionObs = sectionEl;
    return sectionEl;
    // Do something with myElement
  } else {
    window.requestAnimationFrame(waitForSection);
  }
};

window.requestAnimationFrame(waitForSection);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.screenY >= document.body.offsetHeight) {
    handleDOMChange(getArticleArray());
  }
});
