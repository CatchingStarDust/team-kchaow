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
        let hasKeyword = false;

        keywords.forEach(keyword => {
            if (new RegExp(`\\b${keyword}\\b`, "i").test(text)) {
                hasKeyword = true;
            }
        });

        if (hasKeyword) {
            const span = document.createElement("span");

            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
                text = text.replace(regex, `<span class="highlight-warning">$1</span>`);
            });

            span.innerHTML = text;
            textNode.parentNode.replaceChild(span, textNode);
        }
    });
}