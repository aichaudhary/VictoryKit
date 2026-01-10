"""
Behavior Analyzer - Analyzes user behavior patterns
"""

from typing import List, Dict, Any
import statistics


class BehaviorAnalyzer:
    def __init__(self):
        self.human_thresholds = {
            'min_mouse_movements': 5,
            'min_clicks': 1,
            'min_key_presses': 3,
            'max_click_speed_ms': 100,
            'min_session_duration_ms': 2000
        }
    
    def analyze(
        self,
        mouse_movements: List[Dict],
        key_presses: List[Dict],
        scroll_events: List[Dict],
        click_events: List[Dict],
        session_duration: int
    ) -> Dict[str, Any]:
        """Analyze user behavior for bot detection"""
        signals = []
        score = 0
        
        # Analyze mouse movements
        mouse_result = self._analyze_mouse(mouse_movements)
        signals.extend(mouse_result['signals'])
        score += mouse_result['score']
        
        # Analyze key presses
        key_result = self._analyze_keys(key_presses)
        signals.extend(key_result['signals'])
        score += key_result['score']
        
        # Analyze clicks
        click_result = self._analyze_clicks(click_events)
        signals.extend(click_result['signals'])
        score += click_result['score']
        
        # Analyze scrolling
        scroll_result = self._analyze_scrolls(scroll_events)
        signals.extend(scroll_result['signals'])
        score += scroll_result['score']
        
        # Session duration
        if session_duration < self.human_thresholds['min_session_duration_ms']:
            signals.append({
                'signal': 'short_session',
                'weight': 20,
                'value': session_duration
            })
            score += 20
        
        # Normalize score
        score = min(100, max(0, score))
        
        is_human = score < 40
        
        return {
            'isHuman': is_human,
            'isBot': not is_human,
            'score': score,
            'signals': signals,
            'analysis': {
                'mouseMovements': len(mouse_movements),
                'keyPresses': len(key_presses),
                'scrollEvents': len(scroll_events),
                'clickEvents': len(click_events),
                'sessionDuration': session_duration
            }
        }
    
    def _analyze_mouse(self, movements: List[Dict]) -> Dict:
        """Analyze mouse movement patterns"""
        signals = []
        score = 0
        
        if len(movements) < self.human_thresholds['min_mouse_movements']:
            signals.append({
                'signal': 'few_mouse_movements',
                'weight': 20,
                'value': len(movements)
            })
            score += 20
            return {'signals': signals, 'score': score}
        
        # Check for linear movements (bot-like)
        if len(movements) >= 3:
            linear_count = 0
            for i in range(2, len(movements)):
                p1 = movements[i-2]
                p2 = movements[i-1]
                p3 = movements[i]
                
                # Check if points are collinear
                if self._is_collinear(p1, p2, p3):
                    linear_count += 1
            
            linear_ratio = linear_count / (len(movements) - 2)
            if linear_ratio > 0.8:  # 80% linear
                signals.append({
                    'signal': 'linear_mouse_movement',
                    'weight': 25,
                    'value': linear_ratio
                })
                score += 25
        
        # Check movement speed consistency
        speeds = []
        for i in range(1, len(movements)):
            prev = movements[i-1]
            curr = movements[i]
            
            dx = curr.get('x', 0) - prev.get('x', 0)
            dy = curr.get('y', 0) - prev.get('y', 0)
            dt = curr.get('timestamp', 0) - prev.get('timestamp', 0)
            
            if dt > 0:
                speed = (dx**2 + dy**2)**0.5 / dt
                speeds.append(speed)
        
        if len(speeds) > 2:
            try:
                std_dev = statistics.stdev(speeds)
                if std_dev < 0.1:  # Very consistent speed (bot-like)
                    signals.append({
                        'signal': 'consistent_mouse_speed',
                        'weight': 15
                    })
                    score += 15
            except statistics.StatisticsError:
                pass
        
        return {'signals': signals, 'score': score}
    
    def _analyze_keys(self, key_presses: List[Dict]) -> Dict:
        """Analyze keyboard input patterns"""
        signals = []
        score = 0
        
        if len(key_presses) == 0:
            signals.append({
                'signal': 'no_keyboard_input',
                'weight': 10
            })
            score += 10
            return {'signals': signals, 'score': score}
        
        if len(key_presses) < self.human_thresholds['min_key_presses']:
            signals.append({
                'signal': 'few_key_presses',
                'weight': 5
            })
            score += 5
        
        # Check timing patterns
        if len(key_presses) > 1:
            intervals = []
            for i in range(1, len(key_presses)):
                dt = key_presses[i].get('timestamp', 0) - key_presses[i-1].get('timestamp', 0)
                intervals.append(dt)
            
            if len(intervals) > 2:
                try:
                    std_dev = statistics.stdev(intervals)
                    mean = statistics.mean(intervals)
                    
                    # Very consistent timing is suspicious
                    if mean > 0 and std_dev / mean < 0.1:
                        signals.append({
                            'signal': 'robotic_typing',
                            'weight': 25
                        })
                        score += 25
                except statistics.StatisticsError:
                    pass
        
        return {'signals': signals, 'score': score}
    
    def _analyze_clicks(self, clicks: List[Dict]) -> Dict:
        """Analyze click patterns"""
        signals = []
        score = 0
        
        if len(clicks) == 0:
            signals.append({
                'signal': 'no_clicks',
                'weight': 15
            })
            score += 15
            return {'signals': signals, 'score': score}
        
        # Check for super-fast clicks
        if len(clicks) > 1:
            for i in range(1, len(clicks)):
                dt = clicks[i].get('timestamp', 0) - clicks[i-1].get('timestamp', 0)
                if 0 < dt < self.human_thresholds['max_click_speed_ms']:
                    signals.append({
                        'signal': 'superhuman_click_speed',
                        'weight': 30,
                        'value': dt
                    })
                    score += 30
                    break
        
        # Check for identical click positions
        positions = [(c.get('x', 0), c.get('y', 0)) for c in clicks]
        unique_positions = set(positions)
        
        if len(positions) > 3 and len(unique_positions) == 1:
            signals.append({
                'signal': 'identical_click_positions',
                'weight': 25
            })
            score += 25
        
        return {'signals': signals, 'score': score}
    
    def _analyze_scrolls(self, scrolls: List[Dict]) -> Dict:
        """Analyze scroll patterns"""
        signals = []
        score = 0
        
        if len(scrolls) == 0:
            # No scrolling isn't necessarily suspicious
            return {'signals': signals, 'score': score}
        
        # Check for constant scroll amounts
        amounts = [s.get('delta', 0) for s in scrolls]
        unique_amounts = set(amounts)
        
        if len(amounts) > 5 and len(unique_amounts) == 1:
            signals.append({
                'signal': 'constant_scroll_amount',
                'weight': 15
            })
            score += 15
        
        return {'signals': signals, 'score': score}
    
    def _is_collinear(self, p1: Dict, p2: Dict, p3: Dict) -> bool:
        """Check if three points are approximately collinear"""
        x1, y1 = p1.get('x', 0), p1.get('y', 0)
        x2, y2 = p2.get('x', 0), p2.get('y', 0)
        x3, y3 = p3.get('x', 0), p3.get('y', 0)
        
        # Cross product
        area = abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1))
        return area < 100  # Tolerance
