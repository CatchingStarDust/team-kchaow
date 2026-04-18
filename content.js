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
    let text = textNode.nodeValue;
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
      textNode.parentNode.replaceChild(span, textNode);
    }
  });
}

insertReviewBox();
highlightKeywords();