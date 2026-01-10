"""
PhishGuard ML Engine - Content Scanner Model
Scan email and web content for phishing indicators
"""

import numpy as np
import logging
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)


class ContentScanner:
    """
    Content analysis for phishing detection in emails and web pages.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Phishing keywords
        self.phishing_keywords = [
            "verify your account", "confirm your identity", "update your information",
            "suspended", "unusual activity", "unauthorized access", "security alert",
            "click here immediately", "act now", "limited time", "expires today",
            "confirm password", "verify payment", "update billing"
        ]
        
        # Urgency indicators
        self.urgency_words = [
            "urgent", "immediately", "action required", "expires", "suspended",
            "within 24 hours", "final warning", "act now", "don't delay"
        ]
        
        # Spam indicators
        self.spam_keywords = [
            "free", "winner", "congratulations", "claim your prize",
            "limited offer", "exclusive deal", "buy now", "discount"
        ]
        
        logger.info(f"Content Scanner v{self.version} loaded")
    
    def scan_email(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Scan email for phishing indicators"""
        
        sender = email_data.get("sender", "").lower()
        subject = email_data.get("subject", "").lower()
        body = email_data.get("body", "").lower()
        urls = email_data.get("urls", [])
        attachments = email_data.get("attachments", [])
        
        full_text = f"{subject} {body}"
        
        indicators = []
        phishing_score = 0
        spam_score = 0
        
        # Check for phishing keywords
        for keyword in self.phishing_keywords:
            if keyword in full_text:
                phishing_score += 10
                indicators.append(f"Phishing keyword: '{keyword}'")
        
        # Check for urgency
        urgency_count = sum(1 for word in self.urgency_words if word in full_text)
        if urgency_count > 0:
            phishing_score += urgency_count * 5
            indicators.append(f"Urgency indicators found ({urgency_count})")
        
        # Check for spam keywords
        for keyword in self.spam_keywords:
            if keyword in full_text:
                spam_score += 5
        
        # Check sender legitimacy
        if re.search(r'@[^@]+\.[a-z]{2,}', sender):
            domain = sender.split('@')[-1]
            # Check for suspicious sender patterns
            if any(x in domain for x in ['secure-', 'account-', 'verify-', 'update-']):
                phishing_score += 20
                indicators.append(f"Suspicious sender domain: {domain}")
        
        # Check for mismatched display name
        if '<' in sender and '>' in sender:
            display_name = sender.split('<')[0].strip()
            email_domain = sender.split('@')[-1].replace('>', '')
            if any(brand in display_name.lower() for brand in ['paypal', 'amazon', 'apple', 'microsoft']):
                if not any(x in email_domain for x in ['paypal', 'amazon', 'apple', 'microsoft']):
                    phishing_score += 30
                    indicators.append("Display name doesn't match sender domain")
        
        # Check attachments
        dangerous_extensions = ['.exe', '.scr', '.zip', '.rar', '.js', '.vbs']
        for attachment in attachments:
            if any(attachment.lower().endswith(ext) for ext in dangerous_extensions):
                phishing_score += 25
                indicators.append(f"Dangerous attachment: {attachment}")
        
        # Extract URLs from body
        extracted_urls = re.findall(r'https?://[^\s<>"\']+', body)
        extracted_urls.extend(urls)
        
        # Determine urgency level
        if urgency_count >= 3:
            urgency_level = "CRITICAL"
        elif urgency_count >= 2:
            urgency_level = "HIGH"
        elif urgency_count >= 1:
            urgency_level = "MEDIUM"
        else:
            urgency_level = "LOW"
        
        # Normalize scores
        phishing_score = min(phishing_score, 100)
        spam_score = min(spam_score, 100)
        
        is_malicious = phishing_score >= 40
        
        return {
            "is_malicious": is_malicious,
            "phishing_score": phishing_score,
            "spam_score": spam_score,
            "indicators": indicators,
            "extracted_urls": list(set(extracted_urls)),
            "urgency_level": urgency_level
        }
