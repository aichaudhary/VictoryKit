/**
 * Homograph Attack Detection Service
 * Detects internationalized domain name (IDN) attacks using lookalike characters
 * 
 * Examples:
 * - paypal.com → рaypal.com (Cyrillic 'р')
 * - apple.com → аpple.com (Cyrillic 'а')
 * - microsoft.com → mícrosoft.com (Latin 'í')
 * - google.com → gооgle.com (Cyrillic 'о')
 */

const punycode = require('punycode/');
const logger = require('../../../../../shared/utils/logger');

class HomographDetectionService {
  constructor() {
    // Map of lookalike characters (confusables)
    // Format: suspicious_char -> [latin_lookalike, script_name]
    this.confusables = {
      // Cyrillic lookalikes for Latin
      'а': ['a', 'Cyrillic'],
      'е': ['e', 'Cyrillic'],
      'о': ['o', 'Cyrillic'],
      'р': ['p', 'Cyrillic'],
      'с': ['c', 'Cyrillic'],
      'х': ['x', 'Cyrillic'],
      'у': ['y', 'Cyrillic'],
      'і': ['i', 'Cyrillic Ukrainian'],
      'ј': ['j', 'Cyrillic'],
      'ѕ': ['s', 'Cyrillic'],
      'ԁ': ['d', 'Cyrillic'],
      'ԝ': ['w', 'Cyrillic'],
      'һ': ['h', 'Cyrillic'],
      'Ԁ': ['D', 'Cyrillic'],
      'Ѕ': ['S', 'Cyrillic'],
      'А': ['A', 'Cyrillic'],
      'В': ['B', 'Cyrillic'],
      'Е': ['E', 'Cyrillic'],
      'К': ['K', 'Cyrillic'],
      'М': ['M', 'Cyrillic'],
      'Н': ['H', 'Cyrillic'],
      'О': ['O', 'Cyrillic'],
      'Р': ['P', 'Cyrillic'],
      'С': ['C', 'Cyrillic'],
      'Т': ['T', 'Cyrillic'],
      'Х': ['X', 'Cyrillic'],
      
      // Greek lookalikes
      'ο': ['o', 'Greek'],
      'α': ['a', 'Greek'],
      'ε': ['e', 'Greek'],
      'ι': ['i', 'Greek'],
      'κ': ['k', 'Greek'],
      'ν': ['v', 'Greek'],
      'τ': ['t', 'Greek'],
      'υ': ['u', 'Greek'],
      'Α': ['A', 'Greek'],
      'Β': ['B', 'Greek'],
      'Ε': ['E', 'Greek'],
      'Η': ['H', 'Greek'],
      'Ι': ['I', 'Greek'],
      'Κ': ['K', 'Greek'],
      'Μ': ['M', 'Greek'],
      'Ν': ['N', 'Greek'],
      'Ο': ['O', 'Greek'],
      'Ρ': ['P', 'Greek'],
      'Τ': ['T', 'Greek'],
      'Χ': ['X', 'Greek'],
      'Υ': ['Y', 'Greek'],
      'Ζ': ['Z', 'Greek'],
      
      // Latin Extended lookalikes
      'ä': ['a', 'Latin Extended'],
      'à': ['a', 'Latin Extended'],
      'á': ['a', 'Latin Extended'],
      'â': ['a', 'Latin Extended'],
      'ã': ['a', 'Latin Extended'],
      'å': ['a', 'Latin Extended'],
      'ą': ['a', 'Latin Extended'],
      'ć': ['c', 'Latin Extended'],
      'ç': ['c', 'Latin Extended'],
      'č': ['c', 'Latin Extended'],
      'ď': ['d', 'Latin Extended'],
      'đ': ['d', 'Latin Extended'],
      'è': ['e', 'Latin Extended'],
      'é': ['e', 'Latin Extended'],
      'ê': ['e', 'Latin Extended'],
      'ë': ['e', 'Latin Extended'],
      'ę': ['e', 'Latin Extended'],
      'ě': ['e', 'Latin Extended'],
      'ğ': ['g', 'Latin Extended'],
      'ì': ['i', 'Latin Extended'],
      'í': ['i', 'Latin Extended'],
      'î': ['i', 'Latin Extended'],
      'ï': ['i', 'Latin Extended'],
      'ı': ['i', 'Latin Extended'],
      'ł': ['l', 'Latin Extended'],
      'ñ': ['n', 'Latin Extended'],
      'ń': ['n', 'Latin Extended'],
      'ň': ['n', 'Latin Extended'],
      'ò': ['o', 'Latin Extended'],
      'ó': ['o', 'Latin Extended'],
      'ô': ['o', 'Latin Extended'],
      'õ': ['o', 'Latin Extended'],
      'ö': ['o', 'Latin Extended'],
      'ø': ['o', 'Latin Extended'],
      'ő': ['o', 'Latin Extended'],
      'ř': ['r', 'Latin Extended'],
      'ś': ['s', 'Latin Extended'],
      'š': ['s', 'Latin Extended'],
      'ș': ['s', 'Latin Extended'],
      'ş': ['s', 'Latin Extended'],
      'ť': ['t', 'Latin Extended'],
      'ț': ['t', 'Latin Extended'],
      'ù': ['u', 'Latin Extended'],
      'ú': ['u', 'Latin Extended'],
      'û': ['u', 'Latin Extended'],
      'ü': ['u', 'Latin Extended'],
      'ů': ['u', 'Latin Extended'],
      'ű': ['u', 'Latin Extended'],
      'ý': ['y', 'Latin Extended'],
      'ÿ': ['y', 'Latin Extended'],
      'ź': ['z', 'Latin Extended'],
      'ż': ['z', 'Latin Extended'],
      'ž': ['z', 'Latin Extended'],
      
      // Number/letter substitutions (leetspeak)
      '0': ['o', 'Digit'],
      '1': ['l', 'Digit'],
      '3': ['e', 'Digit'],
      '4': ['a', 'Digit'],
      '5': ['s', 'Digit'],
      '7': ['t', 'Digit'],
      '8': ['b', 'Digit'],
      
      // Special Unicode characters
      'ⅰ': ['i', 'Roman Numeral'],
      'ⅱ': ['ii', 'Roman Numeral'],
      'ⅲ': ['iii', 'Roman Numeral'],
      'ⅳ': ['iv', 'Roman Numeral'],
      'ⅴ': ['v', 'Roman Numeral'],
      'ⅵ': ['vi', 'Roman Numeral'],
      'ⅶ': ['vii', 'Roman Numeral'],
      'ⅷ': ['viii', 'Roman Numeral'],
      'ⅸ': ['ix', 'Roman Numeral'],
      'ⅹ': ['x', 'Roman Numeral'],
      'ⅺ': ['xi', 'Roman Numeral'],
      'ⅻ': ['xii', 'Roman Numeral'],
      'ⅼ': ['l', 'Roman Numeral'],
      'ⅽ': ['c', 'Roman Numeral'],
      'ⅾ': ['d', 'Roman Numeral'],
      'ⅿ': ['m', 'Roman Numeral'],
      
      // Fullwidth Latin
      'ａ': ['a', 'Fullwidth'],
      'ｂ': ['b', 'Fullwidth'],
      'ｃ': ['c', 'Fullwidth'],
      'ｄ': ['d', 'Fullwidth'],
      'ｅ': ['e', 'Fullwidth'],
      'ｆ': ['f', 'Fullwidth'],
      'ｇ': ['g', 'Fullwidth'],
      'ｈ': ['h', 'Fullwidth'],
      'ｉ': ['i', 'Fullwidth'],
      'ｊ': ['j', 'Fullwidth'],
      'ｋ': ['k', 'Fullwidth'],
      'ｌ': ['l', 'Fullwidth'],
      'ｍ': ['m', 'Fullwidth'],
      'ｎ': ['n', 'Fullwidth'],
      'ｏ': ['o', 'Fullwidth'],
      'ｐ': ['p', 'Fullwidth'],
      'ｑ': ['q', 'Fullwidth'],
      'ｒ': ['r', 'Fullwidth'],
      'ｓ': ['s', 'Fullwidth'],
      'ｔ': ['t', 'Fullwidth'],
      'ｕ': ['u', 'Fullwidth'],
      'ｖ': ['v', 'Fullwidth'],
      'ｗ': ['w', 'Fullwidth'],
      'ｘ': ['x', 'Fullwidth'],
      'ｙ': ['y', 'Fullwidth'],
      'ｚ': ['z', 'Fullwidth']
    };

    // Known brands to detect impersonation
    this.protectedBrands = [
      'google', 'gmail', 'youtube', 'android',
      'microsoft', 'windows', 'office', 'outlook', 'azure', 'onedrive', 'xbox',
      'apple', 'icloud', 'itunes', 'iphone', 'ipad', 'mac',
      'amazon', 'aws', 'prime', 'kindle', 'alexa',
      'facebook', 'instagram', 'whatsapp', 'messenger', 'meta',
      'twitter', 'tiktok', 'snapchat', 'linkedin', 'pinterest',
      'paypal', 'venmo', 'cashapp', 'zelle',
      'netflix', 'spotify', 'disney', 'hulu', 'hbo',
      'dropbox', 'box', 'drive',
      'adobe', 'photoshop', 'acrobat',
      'salesforce', 'hubspot', 'zendesk',
      'zoom', 'slack', 'teams', 'discord', 'skype',
      'github', 'gitlab', 'bitbucket',
      'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'usbank',
      'fedex', 'ups', 'usps', 'dhl',
      'walmart', 'target', 'bestbuy', 'costco',
      'ebay', 'etsy', 'alibaba', 'aliexpress',
      'uber', 'lyft', 'doordash', 'grubhub',
      'airbnb', 'booking', 'expedia', 'tripadvisor',
      'coinbase', 'binance', 'kraken',
      'docusign', 'hellosign',
      'norton', 'mcafee', 'kaspersky', 'avast'
    ];
  }

  /**
   * Check if domain is an IDN (Internationalized Domain Name)
   */
  isIDN(domain) {
    // Check for punycode prefix
    if (domain.includes('xn--')) {
      return true;
    }
    
    // Check for non-ASCII characters
    for (let i = 0; i < domain.length; i++) {
      if (domain.charCodeAt(i) > 127) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Convert punycode to Unicode
   */
  punycodeToUnicode(domain) {
    try {
      const parts = domain.split('.');
      return parts.map(part => {
        if (part.startsWith('xn--')) {
          return punycode.decode(part.substring(4));
        }
        return part;
      }).join('.');
    } catch (error) {
      return domain;
    }
  }

  /**
   * Convert Unicode to punycode
   */
  unicodeToPunycode(domain) {
    try {
      const parts = domain.split('.');
      return parts.map(part => {
        for (let i = 0; i < part.length; i++) {
          if (part.charCodeAt(i) > 127) {
            return 'xn--' + punycode.encode(part);
          }
        }
        return part;
      }).join('.');
    } catch (error) {
      return domain;
    }
  }

  /**
   * Detect homograph characters in domain
   */
  detectConfusables(domain) {
    const confusablesFound = [];
    const normalizedDomain = [];
    
    for (const char of domain) {
      if (this.confusables[char]) {
        confusablesFound.push({
          original: char,
          lookalike: this.confusables[char][0],
          script: this.confusables[char][1],
          position: normalizedDomain.length
        });
        normalizedDomain.push(this.confusables[char][0]);
      } else {
        normalizedDomain.push(char);
      }
    }

    return {
      originalDomain: domain,
      normalizedDomain: normalizedDomain.join(''),
      confusablesFound,
      hasConfusables: confusablesFound.length > 0,
      mixedScripts: this.detectMixedScripts(domain)
    };
  }

  /**
   * Detect mixed script usage (common in homograph attacks)
   */
  detectMixedScripts(domain) {
    const scripts = new Set();
    
    for (const char of domain) {
      const code = char.charCodeAt(0);
      
      if (code >= 0x0041 && code <= 0x007A) {
        scripts.add('Latin');
      } else if (code >= 0x0400 && code <= 0x04FF) {
        scripts.add('Cyrillic');
      } else if (code >= 0x0370 && code <= 0x03FF) {
        scripts.add('Greek');
      } else if (code >= 0x0100 && code <= 0x017F) {
        scripts.add('Latin Extended-A');
      } else if (code >= 0x0180 && code <= 0x024F) {
        scripts.add('Latin Extended-B');
      } else if (code >= 0x1E00 && code <= 0x1EFF) {
        scripts.add('Latin Extended Additional');
      } else if (code >= 0x0030 && code <= 0x0039) {
        scripts.add('Digits');
      } else if (code >= 0xFF00 && code <= 0xFFEF) {
        scripts.add('Fullwidth');
      }
    }

    // Latin + digits is normal, but mixing with Cyrillic or Greek is suspicious
    const scriptsArray = [...scripts];
    const isMixed = scriptsArray.some(s => 
      s === 'Cyrillic' || s === 'Greek' || s === 'Fullwidth'
    ) && scriptsArray.includes('Latin');

    return {
      scripts: scriptsArray,
      isMixedScript: isMixed,
      suspiciousMix: isMixed
    };
  }

  /**
   * Check if domain impersonates a known brand
   */
  checkBrandImpersonation(domain) {
    const { normalizedDomain } = this.detectConfusables(domain);
    const impersonatedBrands = [];

    for (const brand of this.protectedBrands) {
      // Check normalized domain
      if (normalizedDomain.includes(brand)) {
        // Calculate similarity
        const similarity = this.calculateSimilarity(domain, brand);
        
        impersonatedBrands.push({
          brand,
          similarity,
          normalizedMatch: true,
          originalContainsBrand: domain.includes(brand)
        });
      }
      
      // Check for common typosquatting patterns
      const typoVariants = this.generateTypoVariants(brand);
      for (const variant of typoVariants) {
        if (domain.includes(variant) && !domain.includes(brand)) {
          impersonatedBrands.push({
            brand,
            variant,
            type: 'typosquatting'
          });
        }
      }
    }

    return impersonatedBrands;
  }

  /**
   * Generate common typo variants for a brand
   */
  generateTypoVariants(brand) {
    const variants = [];
    
    // Character doubling
    for (let i = 0; i < brand.length; i++) {
      variants.push(brand.slice(0, i) + brand[i] + brand.slice(i));
    }
    
    // Character deletion
    for (let i = 0; i < brand.length; i++) {
      variants.push(brand.slice(0, i) + brand.slice(i + 1));
    }
    
    // Adjacent key substitution (common typos)
    const keyboardAdjacent = {
      'a': 'qwsz', 'b': 'vghn', 'c': 'xdfv', 'd': 'serfcx',
      'e': 'wrsdf', 'f': 'drtgvc', 'g': 'ftyhbv', 'h': 'gyujnb',
      'i': 'ujklo', 'j': 'huikmn', 'k': 'jiolm', 'l': 'kop',
      'm': 'njk', 'n': 'bhjm', 'o': 'iklp', 'p': 'ol',
      'q': 'wa', 'r': 'edft', 's': 'awedxz', 't': 'rfgy',
      'u': 'yhji', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdc',
      'y': 'tghu', 'z': 'asx'
    };
    
    for (let i = 0; i < brand.length; i++) {
      const adjacent = keyboardAdjacent[brand[i]];
      if (adjacent) {
        for (const adj of adjacent) {
          variants.push(brand.slice(0, i) + adj + brand.slice(i + 1));
        }
      }
    }
    
    // Common substitutions (o/0, l/1, etc.)
    const substitutions = { 'o': '0', 'l': '1', 'i': '1', 'e': '3', 'a': '4', 's': '5' };
    for (let i = 0; i < brand.length; i++) {
      if (substitutions[brand[i]]) {
        variants.push(brand.slice(0, i) + substitutions[brand[i]] + brand.slice(i + 1));
      }
    }
    
    return [...new Set(variants)];
  }

  /**
   * Calculate similarity between two strings (Levenshtein-based)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length * 100).toFixed(1);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Comprehensive homograph analysis
   */
  analyze(domain) {
    // Handle punycode
    const unicodeDomain = this.isIDN(domain) && domain.includes('xn--')
      ? this.punycodeToUnicode(domain)
      : domain;

    const punycodeDomain = this.unicodeToPunycode(unicodeDomain);

    // Detect confusables
    const confusableAnalysis = this.detectConfusables(unicodeDomain);

    // Check brand impersonation
    const brandImpersonation = this.checkBrandImpersonation(unicodeDomain);

    // Calculate risk score
    let riskScore = 0;
    const issues = [];

    if (confusableAnalysis.hasConfusables) {
      riskScore += 30 * Math.min(confusableAnalysis.confusablesFound.length, 3);
      issues.push({
        type: 'confusable_characters',
        severity: 'HIGH',
        message: `Found ${confusableAnalysis.confusablesFound.length} lookalike character(s)`,
        details: confusableAnalysis.confusablesFound
      });
    }

    if (confusableAnalysis.mixedScripts.isMixedScript) {
      riskScore += 40;
      issues.push({
        type: 'mixed_scripts',
        severity: 'HIGH',
        message: `Mixed scripts detected: ${confusableAnalysis.mixedScripts.scripts.join(', ')}`,
        details: confusableAnalysis.mixedScripts
      });
    }

    if (brandImpersonation.length > 0) {
      riskScore += 50;
      issues.push({
        type: 'brand_impersonation',
        severity: 'CRITICAL',
        message: `Potential impersonation of: ${brandImpersonation.map(b => b.brand).join(', ')}`,
        details: brandImpersonation
      });
    }

    const isIDN = this.isIDN(domain);
    if (isIDN) {
      riskScore += 10;
      issues.push({
        type: 'idn_domain',
        severity: 'LOW',
        message: 'Internationalized Domain Name (IDN)',
        punycode: punycodeDomain
      });
    }

    return {
      originalDomain: domain,
      unicodeDomain,
      punycodeDomain,
      isIDN,
      confusables: confusableAnalysis,
      brandImpersonation,
      riskScore: Math.min(100, riskScore),
      verdict: riskScore >= 70 ? 'HOMOGRAPH_ATTACK' : 
               riskScore >= 40 ? 'SUSPICIOUS' : 'CLEAN',
      issues
    };
  }

  /**
   * Batch analyze multiple domains
   */
  analyzeMultiple(domains) {
    return domains.map(domain => this.analyze(domain));
  }
}

module.exports = new HomographDetectionService();
