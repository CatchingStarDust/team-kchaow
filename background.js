async function getDomainAge(domain) {
  // Placeholder for domain age check
  // In production, use a WHOIS API like https://www.whoisxmlapi.com/ or similar
  // For demo, simulate based on known domains or random
  const knownAges = {
    'google.com': 25,
    'amazon.com': 20,
    'facebook.com': 15,
    'wikipedia.org': 20
  };
  return knownAges[domain] || Math.floor(Math.random() * 15) + 1; // Random age 1-15 years
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "calculateScamScore") {
        let score = 0;
        let reasons = [];

        const price = Number(request.price) || 0;
        if (price >= 1200) {
            score += 30;
            reasons.push("Very high price");
        } else if (price >= 800) {
            score += 22;
            reasons.push("High price");
        } else if (price >= 500) {
            score += 15;
            reasons.push("Moderately high price");
        } else if (price >= 200) {
            score += 8;
            reasons.push("Above average price");
        }

        const scamWords = ["scam", "fraud", "fake", "complaint", "lawsuit", "refund", "warning", "ripoff"];
        if (request.query) {
            scamWords.forEach(word => {
                if (request.query.toLowerCase().includes(word)) {
                    score += 15;
                    reasons.push(`Query contains '${word}'`);
                }
            });
        }

        const domainAge = await getDomainAge(request.domain);
        if (domainAge < 1) {
            score += 30;
            reasons.push(`New domain (${domainAge} year)`);
        } else if (domainAge < 3) {
            score += 18;
            reasons.push(`Young domain (${domainAge} years)`);
        } else if (domainAge < 6) {
            score += 8;
            reasons.push(`Moderately aged domain (${domainAge} years)`);
        } else if (domainAge < 10) {
            score += 4;
            reasons.push(`Somewhat established domain (${domainAge} years)`);
        } else {
            reasons.push(`Established domain (${domainAge} years)`);
        }

        const rating = Number(request.rating);
        if (!Number.isNaN(rating) && rating > 0) {
            if (rating <= 2.5) {
                score += 30;
                reasons.push("Very low business rating");
            } else if (rating <= 3.0) {
                score += 22;
                reasons.push("Low business rating");
            } else if (rating <= 3.5) {
                score += 15;
                reasons.push("Below average business rating");
            } else if (rating <= 4.0) {
                score += 8;
                reasons.push("Average business rating");
            } else if (rating >= 4.5) {
                score -= 6;
                reasons.push("Strong business rating");
            }
        }

        const reviewCount = Number(request.reviewCount);
        if (!Number.isNaN(reviewCount) && reviewCount > 0) {
            if (reviewCount < 20) {
                score += 10;
                reasons.push("Limited review volume");
            } else if (reviewCount > 500 && rating >= 4.0) {
                score -= 5;
                reasons.push("Strong review volume");
            }
        }

        let ratioPoints = 0;
        if (price >= 1000) {
            ratioPoints = 15;
        } else if (price >= 700) {
            ratioPoints = 10;
        } else if (price >= 400) {
            ratioPoints = 6;
        } else if (price >= 200) {
            ratioPoints = 3;
        }
        score += ratioPoints;
        if (ratioPoints > 0) reasons.push("Price-to-risk ratio elevated");

        if (score < 0) score = 0;
        if (score > 100) score = 100;
        sendResponse({ score: score, reasons: reasons });
    }
    return true;
});
