// part of the code that shows the user reviews box on google search results page

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
  title.textContent = "⭐ Reviews";
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
      label: "Google",
      url: `https://www.google.com/search?q=${encodeURIComponent(query + " Google reviews")}`
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

insertReviewBox();
