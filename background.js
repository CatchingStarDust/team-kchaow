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

// Scam database - in production, integrate with external APIs
async function checkRiskyScams(domain, query) {
  const riskyScamDatabase = {
    // Domain-based scams
    'example-scam.com': { severity: 'critical', reason: 'Known phishing domain' },
    'fake-shop.net': { severity: 'critical', reason: 'Reported scam site' },
    'crypto-pump.io': { severity: 'critical', reason: 'Crypto scam detected' }
  };

  const scamKeywords = ['pyramid', 'ponzi', 'money laundering', 'counterfeit', 'stolen goods', 'phishing', 'ransomware'];
  
  let scamScore = 0;
  let scamReasons = [];

  // Check domain directly
  if (riskyScamDatabase[domain]) {
    scamScore += 85;
    scamReasons.push(`Domain flagged: ${riskyScamDatabase[domain].reason}`);
  }

  // Check for scam keywords in query/domain
  scamKeywords.forEach(keyword => {
    if ((domain + ' ' + query).toLowerCase().includes(keyword)) {
      scamScore += 50;
      scamReasons.push(`Contains risky keyword: '${keyword}'`);
    }
  });

  return { scamScore, scamReasons };
}

// Check public forums for complaints and reviews
async function checkPublicForums(domain, query) {
  const forumSources = {
    // Simulated forum complaint data - in production, use APIs
    'trustpilot_complaints': { 'example-scam.com': 450, 'fake-shop.net': 320 },
    'reddit_mentions': { 'scam-domain.com': 125, 'ripoff-company.com': 200 },
    'scamadvisor_reports': { 'example-scam.com': 50, 'crypto-pump.io': 75 }
  };

  let forumScore = 0;
  let forumReasons = [];

  // Check Trustpilot-like complaints
  if (forumSources['trustpilot_complaints'][domain]) {
    const complaints = forumSources['trustpilot_complaints'][domain];
    if (complaints > 300) {
      forumScore += 60;
      forumReasons.push(`${complaints}+ complaints on review sites`);
    } else if (complaints > 100) {
      forumScore += 45;
      forumReasons.push(`${complaints} complaints reported`);
    }
  }

  // Check Reddit/forum mentions
  if (forumSources['reddit_mentions'][domain]) {
    const mentions = forumSources['reddit_mentions'][domain];
    if (mentions > 150) {
      forumScore += 40;
      forumReasons.push(`High negative mention count on forums (${mentions})`);
    } else if (mentions > 50) {
      forumScore += 25;
      forumReasons.push(`${mentions} forum complaints detected`);
    }
  }

  // Check ScamAdvisor-like reports
  if (forumSources['scamadvisor_reports'][domain]) {
    const reports = forumSources['scamadvisor_reports'][domain];
    if (reports > 50) {
      forumScore += 55;
      forumReasons.push(`${reports} scam reports filed`);
    }
  }

  return { forumScore, forumReasons };
}

// Check SSL certificate and security indicators
async function checkSSLAndSecurity(domain) {
  // In production, use real SSL checking APIs
  const sslIndicators = {
    'secure-domain.com': { hasSSL: true, issuer: 'DigiCert' },
    'example-scam.com': { hasSSL: false, issuer: null },
    'http-only.net': { hasSSL: false, issuer: null }
  };

  let securityScore = 0;
  let securityReasons = [];

  if (!sslIndicators[domain]?.hasSSL) {
    securityScore += 45;
    securityReasons.push('No valid SSL certificate - HIGH RISK');
  } else {
    securityScore -= 8;
    securityReasons.push('Valid SSL certificate detected');
  }

  return { securityScore, securityReasons };
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "calculateScamScore") {
        let score = 0;
        let reasons = [];

        // 1. Price-based scoring
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

        // 2. Check for scam keywords in query
        const scamWords = ["scam", "fraud", "fake", "complaint", "lawsuit", "refund", "warning", "ripoff"];
        if (request.query) {
            scamWords.forEach(word => {
                if (request.query.toLowerCase().includes(word)) {
                    score += 15;
                    reasons.push(`Query contains '${word}'`);
                }
            });
        }

        // 3. Domain age analysis
        const domainAge = await getDomainAge(request.domain);
        if (domainAge < 1) {
            score += 50;
            reasons.push(`New domain (${domainAge} year) - HIGH RISK`);
        } else if (domainAge < 3) {
            score += 35;
            reasons.push(`Young domain (${domainAge} years)`);
        } else if (domainAge < 6) {
            score += 18;
            reasons.push(`Moderately aged domain (${domainAge} years)`);
        } else if (domainAge < 10) {
            score += 8;
            reasons.push(`Somewhat established domain (${domainAge} years)`);
        } else {
            reasons.push(`Established domain (${domainAge} years)`);
        }

        // 4. Business rating analysis
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

        // 5. Review volume analysis
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

        // 6. NEW: Check for risky scams
        const { scamScore, scamReasons } = await checkRiskyScams(request.domain, request.query);
        score += scamScore;
        reasons.push(...scamReasons);

        // 7. NEW: Check public forums
        const { forumScore, forumReasons } = await checkPublicForums(request.domain, request.query);
        score += forumScore;
        reasons.push(...forumReasons);

        // 8. NEW: Check SSL and security
        const { securityScore, securityReasons } = await checkSSLAndSecurity(request.domain);
        score += securityScore;
        reasons.push(...securityReasons);

        // 9. Price-to-risk ratio
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

        // Cap the score between 0-100
        if (score < 0) score = 0;
        if (score > 100) score = 100;
        sendResponse({ score: score, reasons: reasons });
    }
    return true;
});
