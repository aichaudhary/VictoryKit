"""
Fingerprint Analyzer - Analyzes browser fingerprints
"""

from typing import Dict, Any, List
import hashlib
import json


class FingerprintAnalyzer:
    def __init__(self):
        self.emulation_indicators = [
            'swiftshader',
            'llvmpipe',
            'mesa',
            'virtualbox',
            'vmware'
        ]
    
    def analyze(self, components: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze browser fingerprint for bot indicators"""
        signals = []
        bot_probability = 0
        
        # Check for headless browser
        headless_result = self._check_headless(components)
        signals.extend(headless_result['signals'])
        bot_probability += headless_result['score']
        
        # Check for automation tools
        automation_result = self._check_automation(components)
        signals.extend(automation_result['signals'])
        bot_probability += automation_result['score']
        
        # Check for inconsistencies
        inconsistency_result = self._check_inconsistencies(components)
        signals.extend(inconsistency_result['signals'])
        bot_probability += inconsistency_result['score']
        
        # Check for emulation
        emulation_result = self._check_emulation(components)
        signals.extend(emulation_result['signals'])
        bot_probability += emulation_result['score']
        
        # Normalize
        bot_probability = min(100, max(0, bot_probability))
        
        # Determine risk level
        risk_level = 'low'
        if bot_probability >= 70:
            risk_level = 'critical'
        elif bot_probability >= 50:
            risk_level = 'high'
        elif bot_probability >= 30:
            risk_level = 'medium'
        
        return {
            'hash': self._generate_hash(components),
            'isBot': bot_probability >= 50,
            'botProbability': bot_probability,
            'riskLevel': risk_level,
            'signals': signals,
            'analysis': {
                'isHeadless': headless_result['score'] > 0,
                'hasAutomation': automation_result['score'] > 0,
                'hasInconsistencies': inconsistency_result['score'] > 0,
                'isEmulated': emulation_result['score'] > 0
            }
        }
    
    def _check_headless(self, components: Dict) -> Dict:
        """Check for headless browser indicators"""
        signals = []
        score = 0
        
        # WebDriver property
        if components.get('webdriver'):
            signals.append({
                'signal': 'webdriver_true',
                'weight': 40,
                'description': 'WebDriver property is true'
            })
            score += 40
        
        # Navigator plugins
        plugins = components.get('plugins', [])
        if isinstance(plugins, list) and len(plugins) == 0:
            device_type = components.get('device', {}).get('type', 'desktop')
            if device_type == 'desktop':
                signals.append({
                    'signal': 'no_plugins',
                    'weight': 15,
                    'description': 'No browser plugins on desktop'
                })
                score += 15
        
        # Languages
        languages = components.get('languages', [])
        if not languages or len(languages) == 0:
            signals.append({
                'signal': 'no_languages',
                'weight': 10
            })
            score += 10
        
        # Chrome property missing in Chrome
        user_agent = components.get('userAgent', '').lower()
        if 'chrome' in user_agent and not components.get('chrome'):
            signals.append({
                'signal': 'missing_chrome_property',
                'weight': 25
            })
            score += 25
        
        return {'signals': signals, 'score': score}
    
    def _check_automation(self, components: Dict) -> Dict:
        """Check for automation tool indicators"""
        signals = []
        score = 0
        
        # Selenium
        if components.get('selenium') or components.get('__selenium_unwrapped'):
            signals.append({
                'signal': 'selenium_detected',
                'weight': 50
            })
            score += 50
        
        # Puppeteer
        if components.get('puppeteer'):
            signals.append({
                'signal': 'puppeteer_detected',
                'weight': 50
            })
            score += 50
        
        # Playwright
        if components.get('playwright'):
            signals.append({
                'signal': 'playwright_detected',
                'weight': 50
            })
            score += 50
        
        # PhantomJS
        if components.get('callPhantom') or components.get('_phantom'):
            signals.append({
                'signal': 'phantomjs_detected',
                'weight': 50
            })
            score += 50
        
        return {'signals': signals, 'score': score}
    
    def _check_inconsistencies(self, components: Dict) -> Dict:
        """Check for fingerprint inconsistencies"""
        signals = []
        score = 0
        
        # Platform vs User Agent
        platform = components.get('platform', '').lower()
        user_agent = components.get('userAgent', '').lower()
        
        if platform and user_agent:
            if 'win' in platform and 'mac' in user_agent:
                signals.append({
                    'signal': 'platform_ua_mismatch',
                    'weight': 35
                })
                score += 35
            elif 'mac' in platform and 'windows' in user_agent:
                signals.append({
                    'signal': 'platform_ua_mismatch',
                    'weight': 35
                })
                score += 35
        
        # Screen dimensions
        screen = components.get('screen', {})
        if screen.get('width', 0) == 0 or screen.get('height', 0) == 0:
            signals.append({
                'signal': 'zero_screen_dimensions',
                'weight': 25
            })
            score += 25
        
        # Hardware concurrency
        hardware_concurrency = components.get('hardwareConcurrency', 0)
        if hardware_concurrency == 0:
            signals.append({
                'signal': 'zero_cpu_cores',
                'weight': 20
            })
            score += 20
        
        # Device memory
        device_memory = components.get('deviceMemory', 0)
        if device_memory == 0:
            signals.append({
                'signal': 'zero_device_memory',
                'weight': 15
            })
            score += 15
        
        return {'signals': signals, 'score': score}
    
    def _check_emulation(self, components: Dict) -> Dict:
        """Check for emulation/virtualization"""
        signals = []
        score = 0
        
        # WebGL renderer
        webgl = components.get('webgl', {})
        renderer = webgl.get('renderer', '').lower()
        
        for indicator in self.emulation_indicators:
            if indicator in renderer:
                signals.append({
                    'signal': f'emulation_{indicator}',
                    'weight': 30,
                    'value': renderer
                })
                score += 30
                break
        
        # Vendor
        vendor = webgl.get('vendor', '').lower()
        if 'google' in vendor and 'swiftshader' in vendor:
            signals.append({
                'signal': 'google_swiftshader',
                'weight': 35
            })
            score += 35
        
        return {'signals': signals, 'score': score}
    
    def _generate_hash(self, components: Dict) -> str:
        """Generate fingerprint hash"""
        key_components = {
            'userAgent': components.get('userAgent', ''),
            'screen': components.get('screen', {}),
            'timezone': components.get('timezone', ''),
            'language': components.get('language', ''),
            'platform': components.get('platform', ''),
            'canvas': components.get('canvas', {}).get('hash', ''),
            'webgl': components.get('webgl', {}).get('hash', ''),
            'fonts': components.get('fontsHash', ''),
            'plugins': components.get('pluginsHash', '')
        }
        
        data = json.dumps(key_components, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()
