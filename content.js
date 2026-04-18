function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function looksLikeBusiness(query) {
  return query.split(" ").length >= 2 &&
         !query.toLowerCase().includes("how") &&
         !query.toLowerCase().includes("what");
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

function highlightKeywords() {
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

  const walker = document.createTreeWalker(
    searchArea,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim()) {
      textNodes.push(node);
    }
  }

  textNodes.forEach(textNode => {
    const parent = textNode.parentNode;
    if (!parent) return;

    if (
      parent.closest &&
      parent.closest(".review-extension-box, .warning-summary-box")
    ) {
      return;
    }

    const text = textNode.nodeValue;
    let replaced = text;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
      replaced = replaced.replace(
        regex,
        '<span class="highlight-warning">$1</span>'
      );
    });

    if (replaced !== text) {
      const span = document.createElement("span");
      span.innerHTML = replaced;
      parent.replaceChild(span, textNode);
    }
  });
}

function jumpToFirstWarning() {
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

  const results = Array.from(document.querySelectorAll("#search .g"));

  const match = results.find(result => {
    const text = result.innerText.toLowerCase();
    return keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      return regex.test(text);
    });
  });

  if (!match) {
    alert("No warning result found on this page.");
    return;
  }

  match.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  match.style.outline = "4px solid red";
  match.style.outlineOffset = "4px";
  match.style.backgroundColor = "#fff3cd";

  setTimeout(() => {
    match.style.outline = "";
    match.style.outlineOffset = "";
    match.style.backgroundColor = "";
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