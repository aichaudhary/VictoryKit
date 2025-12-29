"""
Pattern Learner - Traffic pattern learning and prediction
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import statistics


class PatternLearner:
    """Learn and predict traffic patterns"""
    
    def __init__(self):
        self.learned_patterns = {}
        self.attack_history = []
        self.baseline_history = []
    
    def learn(self, traffic_samples: List[Dict[str, Any]], label: Optional[str] = None) -> Dict[str, Any]:
        """Learn from traffic samples"""
        if not traffic_samples:
            return {'error': 'No samples provided'}
        
        # Extract features
        features = self._extract_features(traffic_samples)
        
        # Store pattern
        pattern_id = f"pattern_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.learned_patterns[pattern_id] = {
            'features': features,
            'label': label,
            'sample_count': len(traffic_samples),
            'learned_at': datetime.now().isoformat()
        }
        
        # Update history
        if label == 'attack':
            self.attack_history.append(features)
        elif label == 'normal':
            self.baseline_history.append(features)
        
        return {
            'pattern_id': pattern_id,
            'features': features,
            'label': label,
            'message': 'Pattern learned successfully'
        }
    
    def predict_escalation(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict if current traffic will escalate"""
        metrics = traffic_data.get('metrics', {}) or {}
        
        current_features = self._extract_single_features(metrics)
        
        # Compare with attack history
        escalation_probability = 0
        matching_patterns = []
        
        for i, attack_features in enumerate(self.attack_history):
            similarity = self._calculate_similarity(current_features, attack_features)
            if similarity > 0.6:
                matching_patterns.append({
                    'pattern_index': i,
                    'similarity': similarity
                })
                escalation_probability = max(escalation_probability, similarity * 100)
        
        # Analyze trend indicators
        trend_signals = []
        
        bandwidth = current_features.get('avg_bandwidth', 0)
        if bandwidth > 50:  # Above baseline
            trend_signals.append({
                'signal': 'elevated_bandwidth',
                'value': bandwidth,
                'contribution': 15
            })
            escalation_probability += 15
        
        packets = current_features.get('avg_packets', 0)
        if packets > 5000:
            trend_signals.append({
                'signal': 'elevated_packets',
                'value': packets,
                'contribution': 10
            })
            escalation_probability += 10
        
        # Cap probability
        escalation_probability = min(100, escalation_probability)
        
        return {
            'escalation_probability': escalation_probability,
            'risk_level': self._get_risk_level(escalation_probability),
            'will_escalate': escalation_probability >= 60,
            'matching_patterns': len(matching_patterns),
            'trend_signals': trend_signals,
            'recommendation': self._get_recommendation(escalation_probability)
        }
    
    def predict_duration(self, attack_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict attack duration based on characteristics"""
        attack_type = attack_data.get('type', 'unknown')
        source = attack_data.get('source', {}) or {}
        
        # Base duration estimates by attack type (minutes)
        base_durations = {
            'volumetric': 30,
            'protocol': 45,
            'application': 60,
            'amplification': 20,
            'multi_vector': 90,
            'unknown': 45
        }
        
        base = base_durations.get(attack_type, 45)
        
        # Adjust based on source distribution
        total_ips = source.get('totalIps', 0)
        if total_ips > 10000:
            base *= 1.5  # Large botnets tend to sustain longer
        elif total_ips > 1000:
            base *= 1.2
        
        # Add variance
        min_duration = base * 0.5
        max_duration = base * 2
        
        return {
            'estimated_duration': {
                'minimum': min_duration,
                'likely': base,
                'maximum': max_duration,
                'unit': 'minutes'
            },
            'confidence': 70 if attack_type != 'unknown' else 40,
            'factors': [
                f'Attack type: {attack_type}',
                f'Source IPs: {total_ips}'
            ]
        }
    
    def predict_peak(self, traffic_samples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict peak traffic from current trend"""
        if len(traffic_samples) < 3:
            return {'error': 'Need at least 3 samples for prediction'}
        
        # Extract bandwidth trend
        bandwidths = []
        for sample in traffic_samples:
            metrics = sample.get('metrics', {}) or {}
            bw = self._get_nested(metrics, 'bandwidth.inbound', 0)
            if bw:
                bandwidths.append(bw)
        
        if len(bandwidths) < 3:
            return {'error': 'Insufficient bandwidth data'}
        
        # Calculate growth rate
        recent = bandwidths[-3:]
        growth_rates = []
        for i in range(1, len(recent)):
            if recent[i-1] > 0:
                rate = (recent[i] - recent[i-1]) / recent[i-1]
                growth_rates.append(rate)
        
        avg_growth = statistics.mean(growth_rates) if growth_rates else 0
        current = bandwidths[-1]
        
        # Project peak
        if avg_growth > 0:
            # Exponential growth projection (capped)
            projected_peak = current * (1 + avg_growth) ** 10
            projected_peak = min(projected_peak, current * 10)  # Cap at 10x
        else:
            projected_peak = max(bandwidths)
        
        return {
            'current_bandwidth': current,
            'projected_peak': projected_peak,
            'growth_rate': avg_growth * 100,  # Percentage
            'trend': 'increasing' if avg_growth > 0.1 else 'decreasing' if avg_growth < -0.1 else 'stable',
            'confidence': 60 if len(bandwidths) >= 5 else 40
        }
    
    def _extract_features(self, samples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract statistical features from samples"""
        bandwidths = []
        packets = []
        requests = []
        latencies = []
        
        for sample in samples:
            metrics = sample.get('metrics', {}) or {}
            
            bw = self._get_nested(metrics, 'bandwidth.inbound', 0)
            pkt = self._get_nested(metrics, 'packets.inbound', 0)
            req = self._get_nested(metrics, 'requests.total', 0)
            lat = self._get_nested(metrics, 'latency.avg', 0)
            
            if bw: bandwidths.append(bw)
            if pkt: packets.append(pkt)
            if req: requests.append(req)
            if lat: latencies.append(lat)
        
        return {
            'avg_bandwidth': statistics.mean(bandwidths) if bandwidths else 0,
            'max_bandwidth': max(bandwidths) if bandwidths else 0,
            'std_bandwidth': statistics.stdev(bandwidths) if len(bandwidths) > 1 else 0,
            'avg_packets': statistics.mean(packets) if packets else 0,
            'max_packets': max(packets) if packets else 0,
            'avg_requests': statistics.mean(requests) if requests else 0,
            'avg_latency': statistics.mean(latencies) if latencies else 0
        }
    
    def _extract_single_features(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Extract features from single metrics snapshot"""
        return {
            'avg_bandwidth': self._get_nested(metrics, 'bandwidth.inbound', 0),
            'avg_packets': self._get_nested(metrics, 'packets.inbound', 0),
            'avg_requests': self._get_nested(metrics, 'requests.total', 0),
            'avg_latency': self._get_nested(metrics, 'latency.avg', 0)
        }
    
    def _calculate_similarity(self, features1: Dict, features2: Dict) -> float:
        """Calculate similarity between two feature sets"""
        if not features1 or not features2:
            return 0
        
        keys = ['avg_bandwidth', 'avg_packets', 'avg_requests']
        similarities = []
        
        for key in keys:
            v1 = features1.get(key, 0)
            v2 = features2.get(key, 0)
            
            if v1 == 0 and v2 == 0:
                similarities.append(1.0)
            elif v1 == 0 or v2 == 0:
                similarities.append(0)
            else:
                # Normalized similarity
                ratio = min(v1, v2) / max(v1, v2)
                similarities.append(ratio)
        
        return statistics.mean(similarities) if similarities else 0
    
    def _get_risk_level(self, probability: float) -> str:
        """Get risk level from probability"""
        if probability >= 70:
            return 'high'
        elif probability >= 40:
            return 'medium'
        return 'low'
    
    def _get_recommendation(self, probability: float) -> str:
        """Get recommendation based on escalation probability"""
        if probability >= 70:
            return 'Activate full DDoS protection immediately'
        elif probability >= 50:
            return 'Enable heightened monitoring and prepare mitigations'
        elif probability >= 30:
            return 'Monitor closely for escalation signs'
        return 'Continue normal monitoring'
    
    def _get_nested(self, data: Dict, path: str, default: Any = None) -> Any:
        """Get nested dictionary value"""
        keys = path.split('.')
        result = data
        for key in keys:
            if isinstance(result, dict):
                result = result.get(key, default)
            else:
                return default
        return result if result is not None else default
