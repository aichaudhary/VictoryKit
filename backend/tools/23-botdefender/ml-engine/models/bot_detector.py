"""
Bot Detector - ML-based bot detection
"""

import re
from typing import Dict, Any, List, Optional


class BotDetector:
    def __init__(self):
        self.bot_signatures = self._load_signatures()
        self.good_bots = [
            'googlebot', 'bingbot', 'yandexbot', 'slurp', 'duckduckbot',
            'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
            'applebot', 'pingdom', 'uptimerobot'
        ]
        
        self.bad_bot_patterns = [
            r'python-requests', r'curl/', r'wget/', r'scrapy',
            r'httpclient', r'java/', r'go-http-client',
            r'headless', r'phantom', r'selenium', r'puppeteer',
            r'playwright', r'nightmare', r'splinter'
        ]
    
    def detect(
        self,
        user_agent: Optional[str] = None,
        ip: Optional[str] = None,
        headers: Optional[Dict] = None,
        fingerprint: Optional[Dict] = None,
        behavior: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Detect if request is from a bot"""
        signals = []
        score = 0
        
        # User agent analysis
        if user_agent:
            ua_result = self._analyze_user_agent(user_agent)
            signals.extend(ua_result['signals'])
            score += ua_result['score']
        else:
            signals.append({'signal': 'missing_user_agent', 'weight': 25})
            score += 25
        
        # Header analysis
        if headers:
            header_result = self._analyze_headers(headers)
            signals.extend(header_result['signals'])
            score += header_result['score']
        
        # Fingerprint analysis
        if fingerprint:
            fp_result = self._analyze_fingerprint(fingerprint)
            signals.extend(fp_result['signals'])
            score += fp_result['score']
        
        # Behavior analysis
        if behavior:
            beh_result = self._analyze_behavior_signals(behavior)
            signals.extend(beh_result['signals'])
            score += beh_result['score']
        
        # Normalize score
        score = min(100, max(0, score))
        
        return {
            'isBot': score >= 50,
            'score': score,
            'signals': signals,
            'confidence': self._calculate_confidence(signals),
            'category': self._determine_category(signals, user_agent)
        }
    
    def classify(self, detection: Dict) -> Dict[str, Any]:
        """Classify bot type based on detection results"""
        if not detection.get('isBot'):
            return {
                'type': 'human',
                'category': None,
                'confidence': 100 - detection.get('score', 0)
            }
        
        signals = [s['signal'] for s in detection.get('signals', [])]
        
        # Determine type
        if any('good_bot' in s for s in signals):
            bot_type = 'good'
        else:
            bot_type = 'bad'
        
        # Determine category
        category = detection.get('category', 'unknown')
        
        return {
            'type': bot_type,
            'category': category,
            'confidence': detection.get('score', 0),
            'signals': signals
        }
    
    def get_signatures(self) -> List[Dict]:
        """Get known bot signatures"""
        return self.bot_signatures
    
    def train(self, samples: List[Dict], labels: List[int]) -> Dict:
        """Train model with new samples"""
        # In production, would update ML model
        return {
            'status': 'success',
            'samples_processed': len(samples),
            'message': 'Model training simulated'
        }
    
    def _analyze_user_agent(self, user_agent: str) -> Dict:
        """Analyze user agent string"""
        signals = []
        score = 0
        ua_lower = user_agent.lower()
        
        # Check for good bots
        for bot in self.good_bots:
            if bot in ua_lower:
                signals.append({
                    'signal': 'known_good_bot',
                    'weight': -30,
                    'value': bot
                })
                score -= 30
                return {'signals': signals, 'score': max(0, score)}
        
        # Check for bad bot patterns
        for pattern in self.bad_bot_patterns:
            if re.search(pattern, ua_lower):
                signals.append({
                    'signal': 'bot_pattern_match',
                    'weight': 30,
                    'value': pattern
                })
                score += 30
                break
        
        # Check for automation tools
        if any(tool in ua_lower for tool in ['headless', 'phantom', 'selenium', 'puppeteer']):
            signals.append({
                'signal': 'automation_tool',
                'weight': 35,
                'value': user_agent
            })
            score += 35
        
        # Check for missing browser info
        if not re.search(r'(chrome|firefox|safari|edge|opera)', ua_lower):
            signals.append({
                'signal': 'no_browser_identifier',
                'weight': 15
            })
            score += 15
        
        return {'signals': signals, 'score': score}
    
    def _analyze_headers(self, headers: Dict) -> Dict:
        """Analyze HTTP headers"""
        signals = []
        score = 0
        
        # Check for missing common headers
        expected_headers = ['accept', 'accept-language', 'accept-encoding']
        missing = [h for h in expected_headers if h not in [k.lower() for k in headers.keys()]]
        
        if missing:
            signals.append({
                'signal': 'missing_headers',
                'weight': len(missing) * 5,
                'value': missing
            })
            score += len(missing) * 5
        
        # Check for suspicious patterns
        if headers.get('connection', '').lower() == 'close':
            signals.append({
                'signal': 'connection_close',
                'weight': 5
            })
            score += 5
        
        return {'signals': signals, 'score': score}
    
    def _analyze_fingerprint(self, fingerprint: Dict) -> Dict:
        """Analyze browser fingerprint"""
        signals = []
        score = 0
        
        # Check for headless indicators
        if fingerprint.get('webdriver'):
            signals.append({
                'signal': 'webdriver_enabled',
                'weight': 40
            })
            score += 40
        
        # Check WebGL
        webgl = fingerprint.get('webgl', {})
        if webgl.get('renderer', '').lower().find('swiftshader') >= 0:
            signals.append({
                'signal': 'swiftshader_webgl',
                'weight': 30
            })
            score += 30
        
        # Check screen
        screen = fingerprint.get('screen', {})
        if screen.get('width', 0) == 0 or screen.get('height', 0) == 0:
            signals.append({
                'signal': 'invalid_screen',
                'weight': 25
            })
            score += 25
        
        # Check for inconsistencies
        if fingerprint.get('platform') and fingerprint.get('userAgent'):
            platform = fingerprint['platform'].lower()
            ua = fingerprint['userAgent'].lower()
            
            if 'win' in platform and 'mac' in ua:
                signals.append({
                    'signal': 'platform_mismatch',
                    'weight': 35
                })
                score += 35
        
        return {'signals': signals, 'score': score}
    
    def _analyze_behavior_signals(self, behavior: Dict) -> Dict:
        """Analyze behavioral signals"""
        signals = []
        score = 0
        
        # Check for mouse movement
        if not behavior.get('hasMouseMovement', True):
            signals.append({
                'signal': 'no_mouse_movement',
                'weight': 15
            })
            score += 15
        
        # Check for keyboard input
        if not behavior.get('hasKeyboardInput', True):
            signals.append({
                'signal': 'no_keyboard_input',
                'weight': 10
            })
            score += 10
        
        # Check request rate
        if behavior.get('requestRate', 0) > 60:  # per minute
            signals.append({
                'signal': 'high_request_rate',
                'weight': 25,
                'value': behavior['requestRate']
            })
            score += 25
        
        return {'signals': signals, 'score': score}
    
    def _calculate_confidence(self, signals: List[Dict]) -> float:
        """Calculate detection confidence"""
        if not signals:
            return 50.0
        
        total_weight = sum(abs(s.get('weight', 0)) for s in signals)
        if total_weight == 0:
            return 50.0
        
        return min(95.0, 50.0 + (total_weight / 2))
    
    def _determine_category(self, signals: List[Dict], user_agent: Optional[str]) -> str:
        """Determine bot category"""
        signal_names = [s['signal'] for s in signals]
        
        if 'known_good_bot' in signal_names:
            return 'search_engine'
        
        if 'automation_tool' in signal_names:
            return 'scraper'
        
        if 'high_request_rate' in signal_names:
            return 'scanner'
        
        if 'bot_pattern_match' in signal_names:
            return 'tool'
        
        return 'unknown'
    
    def _load_signatures(self) -> List[Dict]:
        """Load known bot signatures"""
        return [
            {'name': 'Googlebot', 'pattern': r'Googlebot', 'type': 'good', 'category': 'search_engine'},
            {'name': 'Bingbot', 'pattern': r'bingbot', 'type': 'good', 'category': 'search_engine'},
            {'name': 'Python Requests', 'pattern': r'python-requests', 'type': 'bad', 'category': 'scraper'},
            {'name': 'Scrapy', 'pattern': r'Scrapy', 'type': 'bad', 'category': 'scraper'},
            {'name': 'Selenium', 'pattern': r'selenium', 'type': 'bad', 'category': 'automation'},
            {'name': 'Puppeteer', 'pattern': r'puppeteer', 'type': 'bad', 'category': 'automation'},
            {'name': 'cURL', 'pattern': r'curl/', 'type': 'neutral', 'category': 'tool'},
            {'name': 'wget', 'pattern': r'wget/', 'type': 'neutral', 'category': 'tool'},
        ]
