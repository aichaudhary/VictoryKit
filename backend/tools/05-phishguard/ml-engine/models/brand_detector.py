"""
PhishGuard ML Engine - Brand Detector Model
Detect brand impersonation in phishing attempts
"""

import numpy as np
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import re

logger = logging.getLogger(__name__)


class BrandDetector:
    """
    Detect brand impersonation in URLs and content.
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        # Known brands and their legitimate domains
        self.known_brands = {
            "paypal": ["paypal.com", "paypal.me"],
            "amazon": ["amazon.com", "amazon.co.uk", "aws.amazon.com"],
            "apple": ["apple.com", "icloud.com"],
            "microsoft": ["microsoft.com", "outlook.com", "live.com", "office.com"],
            "google": ["google.com", "gmail.com", "googleapis.com"],
            "facebook": ["facebook.com", "fb.com", "messenger.com"],
            "netflix": ["netflix.com"],
            "dropbox": ["dropbox.com"],
            "linkedin": ["linkedin.com"],
            "twitter": ["twitter.com", "x.com"],
            "instagram": ["instagram.com"],
            "chase": ["chase.com"],
            "bankofamerica": ["bankofamerica.com", "bofa.com"],
            "wellsfargo": ["wellsfargo.com"],
            "dhl": ["dhl.com"],
            "fedex": ["fedex.com"],
            "ups": ["ups.com"],
            "usps": ["usps.com"]
        }
        
        logger.info(f"Brand Detector v{self.version} loaded")
    
    def detect(self, url: str) -> Dict[str, Any]:
        """Detect brand impersonation"""
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            full_url = url.lower()
            
            detected_brand = None
            legitimate_domain = None
            similarity_score = 0
            is_impersonation = False
            
            # Check each brand
            for brand, legit_domains in self.known_brands.items():
                # Check if brand name appears in URL
                if brand in full_url:
                    detected_brand = brand
                    legitimate_domain = legit_domains[0]
                    
                    # Check if it's actually the legitimate domain
                    is_legitimate = any(
                        domain == legit or domain.endswith('.' + legit)
                        for legit in legit_domains
                    )
                    
                    if is_legitimate:
                        similarity_score = 100
                        is_impersonation = False
                    else:
                        # Calculate similarity
                        similarity_score = self._calculate_similarity(domain, legit_domains[0])
                        is_impersonation = True
                    
                    break
                
                # Check for typosquatting
                typosquat_score = self._check_typosquat(domain, brand)
                if typosquat_score > 70:
                    detected_brand = brand
                    legitimate_domain = legit_domains[0]
                    similarity_score = typosquat_score
                    is_impersonation = True
                    break
            
            return {
                "brand": detected_brand,
                "legitimate_domain": legitimate_domain,
                "similarity_score": similarity_score,
                "is_impersonation": is_impersonation
            }
            
        except Exception as e:
            logger.error(f"Error detecting brand: {e}")
            return {
                "brand": None,
                "legitimate_domain": None,
                "similarity_score": 0,
                "is_impersonation": False
            }
    
    def _calculate_similarity(self, domain: str, legitimate: str) -> float:
        """Calculate domain similarity score"""
        
        # Simple Levenshtein-inspired similarity
        # In production, would use more sophisticated algorithms
        
        # Remove TLD for comparison
        domain_base = domain.split('.')[0] if '.' in domain else domain
        legit_base = legitimate.split('.')[0] if '.' in legitimate else legitimate
        
        # Check for common typosquat patterns
        patterns = [
            (f"{legit_base}-", 80),  # paypal-login
            (f"{legit_base}.", 75),  # paypal.secure
            (f"secure{legit_base}", 85),  # securepaypal
            (f"{legit_base}verify", 85),  # paypalverify
            (f"login{legit_base}", 80),  # loginpaypal
        ]
        
        for pattern, score in patterns:
            if pattern in domain:
                return score
        
        # Check character-level similarity
        common = set(domain_base) & set(legit_base)
        if common:
            similarity = len(common) / max(len(domain_base), len(legit_base)) * 100
            return min(similarity, 70)
        
        return 0
    
    def _check_typosquat(self, domain: str, brand: str) -> float:
        """Check for typosquatting patterns"""
        
        domain_base = domain.split('.')[0]
        
        # Common typosquat patterns
        # Character substitution (e.g., paypa1, paypai)
        # Character addition (e.g., paypall, ppaypal)
        # Character omission (e.g., paypl, paypa)
        # Character swap (e.g., paypla)
        
        if len(domain_base) < 3 or len(brand) < 3:
            return 0
        
        # Check for brand with common substitutions
        substitutions = {
            'a': ['@', '4'],
            'e': ['3'],
            'i': ['1', 'l', '!'],
            'o': ['0'],
            's': ['$', '5'],
            'l': ['1', 'i'],
        }
        
        # Generate variations
        brand_lower = brand.lower()
        for char, subs in substitutions.items():
            for sub in subs:
                variant = brand_lower.replace(char, sub)
                if variant in domain_base:
                    return 85
        
        # Check length similarity
        if abs(len(domain_base) - len(brand)) <= 2:
            common_chars = sum(1 for c in brand if c in domain_base)
            if common_chars >= len(brand) - 2:
                return 75
        
        return 0
