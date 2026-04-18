let firstWarningTarget = null;

function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function looksLikeBusiness(query) {
  return query.split(" ").length >= 2 &&
         !query.toLowerCase().includes("how") &&
         !query.toLowerCase().includes("what");
}

function getWarningKeywords() {
  return [
    "scam",
    "fraud",
    "fake",
    "complaint",
    "complaints",
    "lawsuit",
    "refund",
    "warning",
    "ripoff"
  ];
}

function getResultCards() {
  const selectors = [
    "#search .g",
    "#search .MjjYud",
    "#search [data-snc]"
  ];

  const cards = [];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!cards.includes(el)) {
        cards.push(el);
      }
    });
  });

  return cards;
}

function createReviewBox(query) {
  const box = document.createElement("div");
  box.className = "review-extension-box";

  const title = document.createElement("div");
  title.className = "review-title";
  title.textContent = "🚨 Scam Check";
  box.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.className = "review-subtitle";
  subtitle.textContent = query;
  box.appendChild(subtitle);

  const links = [
    {
      label: "Yelp",
      url: `https://www.google.com/search?q=${encodeURIComponent(query + " Yelp reviews")}`
    },
    {
      label: "Facebook",
      url: `https://www.google.com/search?q=${encodeURIComponent(query + " Facebook reviews")}`
    },
    {
      label: "CSLB License Check",
      url: "https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx"
    },
    {
      label: "BBB",
      url: `https://www.bbb.org/search?find_text=${encodeURIComponent(query)}`
    },
    {
      label: "Consumer Affairs",
      url: `https://www.consumeraffairs.com/search/?q=${encodeURIComponent(query)}`
    }
  ];

  const linkContainer = document.createElement("div");
  linkContainer.className = "review-links";

  links.forEach(linkInfo => {
    const a = document.createElement("a");
    a.href = linkInfo.url;
    a.textContent = linkInfo.label;
    a.target = "_blank";
    a.className = "review-link";
    linkContainer.appendChild(a);
  });

  box.appendChild(linkContainer);
  return box;
}

function insertReviewBox() {
  if (document.querySelector(".review-extension-box")) return;

  const query = getSearchQuery().trim();
  if (!query || !looksLikeBusiness(query)) return;

  const main = document.querySelector("#search");
  if (!main) return;

  const box = createReviewBox(query);
  main.prepend(box);
}

function isInsideExtensionUI(node) {
  const parentElement = node.parentElement;
  if (!parentElement) return false;

  return !!parentElement.closest(
    ".review-extension-box, .warning-summary-box"
  );
}

function findClosestResultBlock(element) {
  return element.closest(".g, [data-snc], [data-hveid]") || element.closest("div");
}

function highlightKeywords() {
  const keywords = getWarningKeywords();
  const cards = getResultCards();

  cards.forEach(card => {
    const walker = document.createTreeWalker(
      card,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;

  firstWarningTarget = null;

  const walker = document.createTreeWalker(
    searchArea,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (isInsideExtensionUI(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

          if (parent.closest(".review-extension-box, .warning-summary-box")) {
            return NodeFilter.FILTER_REJECT;
          }

  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach(textNode => {
    const parent = textNode.parentNode;
    if (!parent) return;

    const text = textNode.nodeValue;
    let replaced = text;
    let foundInThisNode = false;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
      if (regex.test(replaced)) {
        foundInThisNode = true;
      }
      replaced = replaced.replace(
        regex,
        '<span class="highlight-warning">$1</span>'
      );
    });
  });
}

    if (replaced !== text) {
      const span = document.createElement("span");
      span.innerHTML = replaced;
      parent.replaceChild(span, textNode);

      if (!firstWarningTarget && foundInThisNode) {
        const firstHighlight = span.querySelector(".highlight-warning");
        const resultBlock = firstHighlight
          ? findClosestResultBlock(firstHighlight)
          : null;

        firstWarningTarget = resultBlock || firstHighlight || span;
      }
    }
  });

  if (foundKeywords.length === 0) return;
  if (document.querySelector(".warning-summary-box")) return;

  const searchArea = document.querySelector("#search");
  if (!searchArea) return;

  const box = createWarningBox(foundKeywords);
  if (!box) return;

  searchArea.prepend(box);
}

function jumpToFirstWarning() {
  if (!firstWarningTarget) {
    const fallbackHighlight = document.querySelector(
      "#search .highlight-warning"
    );

    if (fallbackHighlight && !fallbackHighlight.closest(".warning-summary-box, .review-extension-box")) {
      firstWarningTarget = findClosestResultBlock(fallbackHighlight) || fallbackHighlight;
    }
  }

  if (!firstWarningTarget) {
    alert("No warning result found on this page.");
    return;
  }

  firstWarningTarget.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  firstWarningTarget.style.outline = "4px solid red";
  firstWarningTarget.style.outlineOffset = "3px";
  firstWarningTarget.style.backgroundColor = "#fff3cd";

  setTimeout(() => {
    firstWarningTarget.style.outline = "";
    firstWarningTarget.style.outlineOffset = "";
    firstWarningTarget.style.backgroundColor = "";
  }, 2000);
}

function createWarningBox(foundKeywords) {
  if (foundKeywords.length === 0) return null;

  const box = document.createElement("div");
  box.className = "warning-summary-box";

  const title = document.createElement("div");
  title.className = "warning-summary-title";
  title.textContent = "🚨 Warning Signals Found";
  box.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.className = "warning-summary-subtitle";
  subtitle.textContent = "These words appeared on this page:";
  box.appendChild(subtitle);

  const list = document.createElement("ul");
  list.className = "warning-summary-list";

  foundKeywords.forEach(keyword => {
    const item = document.createElement("li");
    item.textContent = keyword;
    list.appendChild(item);
  });

  box.appendChild(list);

  const jumpButton = document.createElement("button");
  jumpButton.className = "jump-warning-button";
  jumpButton.textContent = "Jump to first warning";
  jumpButton.addEventListener("click", jumpToFirstWarning);
  box.appendChild(jumpButton);

  return box;
}

function showWarningSummary() {
  const keywords = [
    "scam",
    "fraud",
    "fake",
    "complaint",
    "complaints",
    "lawsuit",
    "refund",
    "warning",
    "ripoff"
  ];

  const searchArea = document.querySelector("#search");
  if (!searchArea) return;

  const pageText = searchArea.innerText.toLowerCase();
  const foundKeywords = keywords.filter(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(pageText);
  });

  if (foundKeywords.length === 0) return;
  if (document.querySelector(".warning-summary-box")) return;

  const box = createWarningBox(foundKeywords);
  if (!box) return;

  searchArea.prepend(box);
}

insertReviewBox();
highlightKeywords();
showWarningSummary();