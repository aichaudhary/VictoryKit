"""
Attack Detector - DDoS attack detection and classification
"""

from typing import Dict, Any, List


class AttackDetector:
    """ML-based DDoS attack detection"""
    
    def __init__(self):
        self.baseline = {
            'bandwidth': 100,      # Mbps
            'packets': 10000,      # pps
            'requests': 1000,      # rps
            'connections': 500,    # concurrent
            'latency': 50          # ms
        }
        
        self.attack_signatures = {
            'syn_flood': {
                'indicators': ['high_syn_rate', 'low_ack_rate', 'many_half_open'],
                'type': 'protocol',
                'severity_multiplier': 1.2
            },
            'udp_flood': {
                'indicators': ['high_udp_volume', 'random_ports', 'spoofed_sources'],
                'type': 'volumetric',
                'severity_multiplier': 1.0
            },
            'http_flood': {
                'indicators': ['high_request_rate', 'similar_patterns', 'bot_signatures'],
                'type': 'application',
                'severity_multiplier': 1.1
            },
            'slowloris': {
                'indicators': ['many_connections', 'slow_headers', 'long_held'],
                'type': 'application',
                'severity_multiplier': 0.8
            },
            'dns_amplification': {
                'indicators': ['high_dns_response', 'spoofed_source', 'amplification_ratio'],
                'type': 'amplification',
                'severity_multiplier': 1.5
            },
            'ntp_amplification': {
                'indicators': ['high_ntp_response', 'monlist_requests', 'amplification_ratio'],
                'type': 'amplification',
                'severity_multiplier': 1.5
            }
        }
    
    def detect(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect if traffic represents a DDoS attack"""
        signals = []
        score = 0
        
        metrics = traffic_data.get('metrics', {}) or {}
        
        # Bandwidth analysis
        bandwidth = self._get_nested(metrics, 'bandwidth.inbound', 0)
        if bandwidth > self.baseline['bandwidth'] * 5:
            signals.append({
                'signal': 'extreme_bandwidth_spike',
                'value': bandwidth,
                'threshold': self.baseline['bandwidth'] * 5,
                'weight': 35
            })
            score += 35
        elif bandwidth > self.baseline['bandwidth'] * 3:
            signals.append({
                'signal': 'high_bandwidth',
                'value': bandwidth,
                'weight': 20
            })
            score += 20
        
        # Packet rate analysis
        packets = self._get_nested(metrics, 'packets.inbound', 0)
        if packets > self.baseline['packets'] * 5:
            signals.append({
                'signal': 'extreme_packet_rate',
                'value': packets,
                'weight': 30
            })
            score += 30
        elif packets > self.baseline['packets'] * 3:
            signals.append({
                'signal': 'high_packet_rate',
                'value': packets,
                'weight': 15
            })
            score += 15
        
        # Request rate analysis
        request_rate = self._get_nested(metrics, 'requests.rate', 0)
        if request_rate > self.baseline['requests'] * 10:
            signals.append({
                'signal': 'extreme_request_flood',
                'value': request_rate,
                'weight': 25
            })
            score += 25
        
        # Connection analysis
        active_conns = self._get_nested(metrics, 'connections.active', 0)
        new_conns = self._get_nested(metrics, 'connections.new', 0)
        if active_conns > self.baseline['connections'] * 5:
            signals.append({
                'signal': 'connection_exhaustion',
                'value': active_conns,
                'weight': 20
            })
            score += 20
        
        if new_conns > 0 and active_conns > 0:
            conn_ratio = new_conns / active_conns
            if conn_ratio > 0.8:
                signals.append({
                    'signal': 'syn_flood_indicator',
                    'value': conn_ratio,
                    'weight': 15
                })
                score += 15
        
        # Latency analysis
        latency = self._get_nested(metrics, 'latency.avg', 0)
        if latency > self.baseline['latency'] * 5:
            signals.append({
                'signal': 'severe_latency_impact',
                'value': latency,
                'weight': 15
            })
            score += 15
        
        # Source analysis
        source = traffic_data.get('source', {}) or {}
        if source.get('totalIps', 0) > 1000:
            signals.append({
                'signal': 'distributed_attack',
                'value': source['totalIps'],
                'weight': 10
            })
            score += 10
        
        # Normalize score
        score = min(100, score)
        
        # Classify attack
        classification = self.classify(traffic_data)
        
        return {
            'is_attack': score >= 60,
            'score': score,
            'confidence': score,
            'severity': self._get_severity(score),
            'signals': signals,
            'classification': classification,
            'attack_type': classification.get('type', 'unknown'),
            'attack_subtype': classification.get('subtype', 'unknown')
        }
    
    def classify(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify attack type based on traffic characteristics"""
        metrics = traffic_data.get('metrics', {}) or {}
        breakdown = traffic_data.get('breakdown', {}) or {}
        
        # Analyze protocol breakdown
        by_protocol = breakdown.get('byProtocol', [])
        protocol_map = {p.get('protocol', ''): p for p in by_protocol}
        
        attack_type = 'unknown'
        subtype = 'unknown'
        confidence = 0
        matched_signatures = []
        
        # Check for SYN flood
        tcp_data = protocol_map.get('TCP', {})
        if tcp_data.get('percentage', 0) > 80:
            conns = self._get_nested(metrics, 'connections', {})
            if conns.get('new', 0) > conns.get('active', 1) * 0.8:
                attack_type = 'protocol'
                subtype = 'syn_flood'
                confidence = 85
                matched_signatures.append('syn_flood')
        
        # Check for UDP flood
        udp_data = protocol_map.get('UDP', {})
        if udp_data.get('percentage', 0) > 70:
            attack_type = 'volumetric'
            subtype = 'udp_flood'
            confidence = 80
            matched_signatures.append('udp_flood')
        
        # Check for DNS amplification
        dns_data = protocol_map.get('DNS', {})
        if dns_data.get('percentage', 0) > 50:
            attack_type = 'amplification'
            subtype = 'dns_amplification'
            confidence = 75
            matched_signatures.append('dns_amplification')
        
        # Check for HTTP flood (application layer)
        if self._get_nested(metrics, 'requests.rate', 0) > self.baseline['requests'] * 5:
            if attack_type == 'unknown':
                attack_type = 'application'
                subtype = 'http_flood'
                confidence = 70
                matched_signatures.append('http_flood')
        
        return {
            'type': attack_type,
            'subtype': subtype,
            'confidence': confidence,
            'matched_signatures': matched_signatures
        }
    
    def recommend_mitigation(self, detection: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend mitigation strategy based on attack type"""
        attack_type = detection.get('attack_type', 'unknown')
        attack_subtype = detection.get('attack_subtype', 'unknown')
        severity = detection.get('severity', 'medium')
        
        recommendations = {
            'primary_action': 'rate_limit',
            'actions': [],
            'urgency': severity,
            'estimated_effectiveness': 0
        }
        
        if attack_type == 'volumetric':
            recommendations['actions'] = [
                {'action': 'enable_scrubbing', 'priority': 1},
                {'action': 'rate_limit_bandwidth', 'priority': 2},
                {'action': 'block_top_sources', 'priority': 3},
                {'action': 'enable_geo_blocking', 'priority': 4}
            ]
            recommendations['primary_action'] = 'scrubbing'
            recommendations['estimated_effectiveness'] = 85
            
        elif attack_type == 'protocol':
            recommendations['actions'] = [
                {'action': 'enable_syn_cookies', 'priority': 1},
                {'action': 'limit_connections_per_ip', 'priority': 2},
                {'action': 'block_spoofed_sources', 'priority': 3},
                {'action': 'increase_backlog', 'priority': 4}
            ]
            recommendations['primary_action'] = 'syn_cookies'
            recommendations['estimated_effectiveness'] = 80
            
        elif attack_type == 'application':
            recommendations['actions'] = [
                {'action': 'enable_js_challenge', 'priority': 1},
                {'action': 'rate_limit_requests', 'priority': 2},
                {'action': 'enable_captcha', 'priority': 3},
                {'action': 'block_bad_bots', 'priority': 4}
            ]
            recommendations['primary_action'] = 'challenge'
            recommendations['estimated_effectiveness'] = 75
            
        elif attack_type == 'amplification':
            recommendations['actions'] = [
                {'action': 'block_amplification_ports', 'priority': 1},
                {'action': 'enable_response_rate_limiting', 'priority': 2},
                {'action': 'upstream_filtering', 'priority': 3}
            ]
            recommendations['primary_action'] = 'port_blocking'
            recommendations['estimated_effectiveness'] = 90
        
        return recommendations
    
    def get_signatures(self) -> List[Dict[str, Any]]:
        """Get all known attack signatures"""
        return [
            {
                'name': name,
                'type': sig['type'],
                'indicators': sig['indicators']
            }
            for name, sig in self.attack_signatures.items()
        ]
    
    def _get_severity(self, score: int) -> str:
        """Get severity level from score"""
        if score >= 90:
            return 'critical'
        elif score >= 70:
            return 'high'
        elif score >= 50:
            return 'medium'
        return 'low'
    
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
