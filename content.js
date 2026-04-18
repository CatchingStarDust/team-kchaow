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

    textNodes.forEach(node => {
        keywords.forEach(keyword => {
            if (node.nodeValue.toLowerCase().includes(keyword.toLowerCase())) {
                const span = document.createElement('span');
                span.style.backgroundColor = 'yellow';
                span.textContent = node.nodeValue;
                node.parentNode.replaceChild(span, node);
            }
        });
    });
}

function isGoogleSearchPage() {
  return window.location.hostname.includes("google.") && window.location.pathname.startsWith("/search") && document.querySelector('input[name="q"]');
}

function createSiteBox(query) {
  const box = document.createElement("div");
  box.className = "review-extension-box";
  box.style.position = "fixed";
  box.style.top = "16px";
  box.style.right = "16px";
  box.style.zIndex = "999999";
  box.style.maxWidth = "340px";
  box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.12)";
  box.style.backgroundColor = "#fff";
  box.style.border = "1px solid #ddd";
  box.style.borderRadius = "14px";
  box.style.padding = "14px";
  box.style.fontFamily = "Arial, sans-serif";
  box.style.fontSize = "13px";
  box.style.lineHeight = "1.4";
  box.style.overflow = "hidden";

  const title = document.createElement("div");
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";
  title.textContent = "Site Safety";
  box.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.style.color = "#5f6368";
  subtitle.style.marginBottom = "12px";
  subtitle.textContent = query;
  box.appendChild(subtitle);

  const actualPrice = scrapePrice();
  const rating = scrapeRating();
  const reviewCount = scrapeReviewCount();

  const metricsDiv = document.createElement("div");
  metricsDiv.style.display = "flex";
  metricsDiv.style.flexWrap = "wrap";
  metricsDiv.style.gap = "8px";
  metricsDiv.style.marginBottom = "10px";
  metricsDiv.style.fontSize = "11px";
  metricsDiv.innerHTML = `
    <div><strong>Rating:</strong> ${rating ? `${rating}/5` : 'N/A'}</div>
    <div><strong>Reviews:</strong> ${reviewCount ? reviewCount : 'N/A'}</div>
    <div><strong>Domain:</strong> ${window.location.hostname}</div>
  `;
  box.appendChild(metricsDiv);

  addScamMeter(box, actualPrice, query, rating, reviewCount);

  const quickLinks = document.createElement("div");
  quickLinks.style.display = "flex";
  quickLinks.style.flexWrap = "wrap";
  quickLinks.style.gap = "6px";
  quickLinks.style.marginTop = "8px";
  quickLinks.style.fontSize = "11px";
  quickLinks.innerHTML = `
    <a href="https://www.google.com/search?q=${encodeURIComponent(query + " business license")}" target="_blank" style="color: #1a73e8; text-decoration: none;">License</a>
    <a href="https://www.google.com/search?q=${encodeURIComponent(query + " rating")}" target="_blank" style="color: #1a73e8; text-decoration: none;">Rating</a>
  `;
  box.appendChild(quickLinks);

  const reviewsDiv = document.createElement("div");
  reviewsDiv.style.marginTop = "12px";
  reviewsDiv.innerHTML = `
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">Top review:</div>
    <div style="font-size: 11px; color: green; margin-bottom: 8px;">"Positive experience, good communication, delivered as promised."</div>
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">Worst review:</div>
    <div style="font-size: 11px; color: red;">"Slow support and questionable refund policy."</div>
  `;
  box.appendChild(reviewsDiv);

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.style.position = "absolute";
  closeButton.style.top = "8px";
  closeButton.style.right = "8px";
  closeButton.style.border = "none";
  closeButton.style.background = "transparent";
  closeButton.style.fontSize = "16px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#5f6368";
  closeButton.addEventListener("click", () => box.remove());
  box.appendChild(closeButton);

  document.body.appendChild(box);
}

function insertReviewBox() {
  if (document.querySelector(".review-extension-box")) return;

  const query = isGoogleSearchPage() ? getSearchQuery().trim() : document.title || window.location.hostname;
  if (!query || !looksLikeBusiness(query)) return;

  if (isGoogleSearchPage()) {
    const main = document.querySelector("#search");
    if (!main) return;
    const box = createReviewBox(query);
    main.prepend(box);
  } else {
    createSiteBox(query);
  }

  highlightKeywords();
}

insertReviewBox();
// Paste this at the very bottom of content.js
async function addScamMeter(box, actualPrice, query, rating, reviewCount) {
    const domain = window.location.hostname;
    const response = await chrome.runtime.sendMessage({
        action: "calculateScamScore",
        price: actualPrice,
        query: query,
        domain: domain,
        rating: rating,
        reviewCount: reviewCount
    });
    const meterContainer = document.createElement("div");
    meterContainer.style.marginTop = "15px";
    meterContainer.style.borderTop = "1px solid #eee";
    meterContainer.style.paddingTop = "10px";

    const health = Math.max(0, Math.min(100, 100 - response.score));
    let meterColor = "#4CAF50";
    let level = "Strong";
    if (health <= 35) {
        meterColor = "#F44336";
        level = "Weak";
    } else if (health <= 65) {
        meterColor = "#FFC107";
        level = "Fair";
    }

    meterContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-weight: bold; font-size: 12px;">Safety Health</div>
            <div style="font-size: 11px; font-weight: 700; color: ${meterColor};">${level}</div>
        </div>
        <div style="background: #eee; height: 10px; border-radius: 6px; overflow: hidden;">
            <div style="background: ${meterColor}; width: ${health}%; height: 100%; transition: width 0.4s ease;"></div>
        </div>
        <div style="font-size: 10px; margin-top: 8px; color: #666;">
            Health: ${health}/100
        </div>
        <div style="font-size: 10px; margin-top: 5px; color: #666;">
            Risk: ${response.score}/100
        </div>
        <div style="font-size: 10px; margin-top: 5px; color: #666;">
            Flags: ${response.reasons.join(", ")}
        </div>
    `;

    box.appendChild(meterContainer);
    box.style.borderLeft = `5px solid ${meterColor}`;
}
function scrapePrice() {
    const priceElement = document.querySelector('[data-attrid="price"]') || 
                         document.querySelector('.fG8Fp.uo4vr span');
    if (!priceElement) return null;
    const value = parseFloat(priceElement.innerText.replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : null;
}

function extractFirstFloat(text) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function scrapeRating() {
  const selectors = ['[aria-label*="stars"]', '[aria-label*="star"]', '.Aq14fc', '.BNeawe.s3v9rd.AP7Wnd'];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const value = extractFirstFloat(element.innerText);
      if (value && value <= 5) return value;
    }
  }

  const elements = Array.from(document.querySelectorAll('span, div')).slice(0, 120);
  for (const element of elements) {
    const text = element.innerText.trim();
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:out of 5|stars?)/i);
    if (match) {
      const value = parseFloat(match[1]);
      if (!Number.isNaN(value) && value <= 5) return value;
    }
  }

  return null;
}

function scrapeReviewCount() {
  const elements = Array.from(document.querySelectorAll('span, div')).slice(0, 150);
  for (const element of elements) {
    const text = element.innerText.replace(/\u00A0/g, ' ').trim();
    const match = text.match(/([\d,]+)\s+reviews?/i);
    if (match) {
      return Number(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

function getSearchQuery() {
  const input = document.querySelector('input[name="q"]');
  return input ? input.value : '';
}

function looksLikeBusiness(query) {
  return query.length > 2;
}

function createReviewBox(query) {
  const box = document.createElement("div");
  box.className = "review-extension-box";
  box.style.border = "1px solid #ddd";
  box.style.padding = "10px";
  box.style.marginBottom = "10px";
  box.style.backgroundColor = "#f9f9f9";
  const actualPrice = scrapePrice();
  const rating = scrapeRating();
  const reviewCount = scrapeReviewCount();

  const metricsDiv = document.createElement("div");
  metricsDiv.style.display = "flex";
  metricsDiv.style.flexWrap = "wrap";
  metricsDiv.style.gap = "8px";
  metricsDiv.style.marginBottom = "10px";
  metricsDiv.style.fontSize = "11px";
  metricsDiv.innerHTML = `
    <div><strong>Rating:</strong> ${rating ? `${rating}/5` : 'N/A'}</div>
    <div><strong>Reviews:</strong> ${reviewCount ? reviewCount : 'N/A'}</div>
    <div><strong>Domain:</strong> ${window.location.hostname}</div>
  `;
  box.appendChild(metricsDiv);

  addScamMeter(box, actualPrice, query, rating, reviewCount);

  const quickLinks = document.createElement("div");
  quickLinks.style.display = "flex";
  quickLinks.style.flexWrap = "wrap";
  quickLinks.style.gap = "6px";
  quickLinks.style.marginTop = "10px";
  quickLinks.style.fontSize = "11px";
  quickLinks.innerHTML = `
    <a href="https://www.google.com/search?q=${encodeURIComponent(query + " business license")}" target="_blank" style="color: #1a73e8; text-decoration: none;">License</a>
    <a href="https://www.google.com/search?q=${encodeURIComponent(query + " rating")}" target="_blank" style="color: #1a73e8; text-decoration: none;">Rating</a>
  `;
  box.appendChild(quickLinks);

  const links = [
    {url: "https://www.bbb.org/search?find_country=USA&find_text=" + encodeURIComponent(query), label: "BBB"},
    {url: "https://www.yelp.com/search?find_desc=" + encodeURIComponent(query), label: "Yelp"},
    {url: "https://www.trustpilot.com/search?query=" + encodeURIComponent(query), label: "Trustpilot"},
    {url: "https://www.google.com/search?q=" + encodeURIComponent(query + " reviews"), label: "Google"},
    {url: "https://www.consumeraffairs.com/search/" + encodeURIComponent(query), label: "Consumer Affairs"},
  ];
  const linkContainer = document.createElement("div");
  linkContainer.className = "review-links";
  links.forEach(linkInfo => {
    const a = document.createElement("a");
    a.href = linkInfo.url;
    a.textContent = linkInfo.label;
    a.target = "_blank";
    a.className = "review-link";
    a.style.marginRight = "10px";
    linkContainer.appendChild(a);
  });
  box.appendChild(linkContainer);

  const reviewsDiv = document.createElement("div");
  reviewsDiv.style.marginTop = "10px";
  reviewsDiv.innerHTML = `
    <div style="font-weight: bold; font-size: 12px;">Top Review:</div>
    <div style="font-size: 11px; color: green; margin-bottom: 5px;">"Excellent service and quality. Highly recommended!" - Verified Customer</div>
    <div style="font-weight: bold; font-size: 12px;">Worst Review:</div>
    <div style="font-size: 11px; color: red;">"Poor customer support and product issues. Not worth it." - Disappointed User</div>
  `;
  box.appendChild(reviewsDiv);

  return box;
}