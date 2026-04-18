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
  ];

  const linkContainer = document.createElement("div");
  linkContainer.className = "review-links";

  links.forEach(linkInfo => {
    const actualPrice = scrapePrice(); 
    addScamMeter(box, actualPrice);
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
// Paste this at the very bottom of content.js
async function addScamMeter(box) {
    const response = await chrome.runtime.sendMessage({
        action: "calculateScamScore",
        price: 150 
    });
    // 1. Get the data from the page
    const actualPrice = scrapePrice();
    // 2. Send the data to the background "brain" to get a score
    const response = await chrome.runtime.sendMessage({
        action: "calculateScamScore",
        price: actualPrice 
    });
    const meterContainer = document.createElement("div");
    meterContainer.style.marginTop = "15px";
    meterContainer.style.borderTop = "1px solid #eee";
    meterContainer.style.paddingTop = "10px";

    let meterColor = "#4CAF50"; // Green
    if (response.score > 35) meterColor = "#FFC107"; // Yellow
    if (response.score > 65) meterColor = "#F44336"; // Red

    meterContainer.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">Scam Risk Meter</div>
        <div style="background: #eee; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: ${meterColor}; width: ${response.score}%; height: 100%;"></div>
        </div>
        <div style="font-size: 10px; margin-top: 5px; color: #666;">
            Flags: ${response.reasons.join(", ")}
        </div>
    `;

    box.appendChild(meterContainer);
}
function scrapePrice() {
    // This looks for common Google price locations
    const priceElement = document.querySelector('[data-attrid="price"]') || 
                         document.querySelector('.fG8Fp.uo4vr span');
    
    if (!priceElement) return 150; // Fallback price for testing

    // Use Regex to turn "$1,200.00" into "1200.00"
    return parseFloat(priceElement.innerText.replace(/[^0-9.]/g, '')) || 150;
}