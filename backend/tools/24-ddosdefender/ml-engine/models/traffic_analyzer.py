"""
Traffic Analyzer - Network traffic pattern analysis
"""

from typing import Dict, Any, List
from datetime import datetime
import statistics


class TrafficAnalyzer:
    """Analyze network traffic patterns and detect anomalies"""
    
    def __init__(self):
        self.baseline = {
            'bandwidth': {'avg': 100, 'std': 30},
            'packets': {'avg': 10000, 'std': 3000},
            'requests': {'avg': 1000, 'std': 300},
            'latency': {'avg': 50, 'std': 15}
        }
        
        self.suspicious_countries = ['RU', 'CN', 'KP', 'IR']
        self.known_bad_asns = []
    
    def analyze(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive traffic analysis"""
        metrics = traffic_data.get('metrics', {}) or {}
        
        anomalies = []
        health_score = 100
        
        # Bandwidth analysis
        bandwidth_in = self._get_nested(metrics, 'bandwidth.inbound', 0)
        bw_deviation = self._calculate_deviation(bandwidth_in, 'bandwidth')
        if bw_deviation > 3:
            anomalies.append({
                'type': 'bandwidth_anomaly',
                'severity': 'high' if bw_deviation > 5 else 'medium',
                'value': bandwidth_in,
                'deviation': bw_deviation
            })
            health_score -= min(30, bw_deviation * 5)
        
        # Packet analysis
        packets_in = self._get_nested(metrics, 'packets.inbound', 0)
        pkt_deviation = self._calculate_deviation(packets_in, 'packets')
        if pkt_deviation > 3:
            anomalies.append({
                'type': 'packet_anomaly',
                'severity': 'high' if pkt_deviation > 5 else 'medium',
                'value': packets_in,
                'deviation': pkt_deviation
            })
            health_score -= min(25, pkt_deviation * 4)
        
        # Request analysis
        request_rate = self._get_nested(metrics, 'requests.rate', 0)
        total_requests = self._get_nested(metrics, 'requests.total', 0)
        failed_requests = self._get_nested(metrics, 'requests.failed', 0)
        
        if total_requests > 0:
            error_rate = failed_requests / total_requests
            if error_rate > 0.1:
                anomalies.append({
                    'type': 'high_error_rate',
                    'severity': 'high' if error_rate > 0.3 else 'medium',
                    'value': error_rate
                })
                health_score -= min(20, error_rate * 50)
        
        # Latency analysis
        latency = self._get_nested(metrics, 'latency.avg', 0)
        lat_deviation = self._calculate_deviation(latency, 'latency')
        if lat_deviation > 2:
            anomalies.append({
                'type': 'latency_spike',
                'severity': 'high' if lat_deviation > 4 else 'medium',
                'value': latency,
                'deviation': lat_deviation
            })
            health_score -= min(15, lat_deviation * 3)
        
        # Connection analysis
        active_conns = self._get_nested(metrics, 'connections.active', 0)
        new_conns = self._get_nested(metrics, 'connections.new', 0)
        
        if active_conns > 10000:
            anomalies.append({
                'type': 'connection_flood',
                'severity': 'high',
                'value': active_conns
            })
            health_score -= 20
        
        health_score = max(0, health_score)
        
        return {
            'is_anomalous': len(anomalies) > 0,
            'anomaly_score': 100 - health_score,
            'health_score': health_score,
            'anomalies': anomalies,
            'metrics_summary': {
                'bandwidth': {
                    'current': bandwidth_in,
                    'baseline': self.baseline['bandwidth']['avg'],
                    'deviation': bw_deviation
                },
                'packets': {
                    'current': packets_in,
                    'baseline': self.baseline['packets']['avg'],
                    'deviation': pkt_deviation
                },
                'latency': {
                    'current': latency,
                    'baseline': self.baseline['latency']['avg'],
                    'deviation': lat_deviation
                }
            },
            'status': self._get_status(health_score)
        }
    
    def analyze_source(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze traffic source distribution"""
        source = traffic_data.get('source', {}) or {}
        breakdown = traffic_data.get('breakdown', {}) or {}
        
        total_ips = source.get('totalIps', 0)
        countries = breakdown.get('byCountry', [])
        
        risk_indicators = []
        risk_score = 0
        
        # Check distribution
        if total_ips > 1000:
            risk_indicators.append({
                'indicator': 'highly_distributed',
                'description': f'Traffic from {total_ips} unique IPs',
                'risk_contribution': 20
            })
            risk_score += 20
        
        # Check suspicious countries
        suspicious_traffic = 0
        for country in countries:
            code = country.get('country', '')
            percentage = country.get('percentage', 0) if 'percentage' in country else 0
            if not percentage and country.get('requests') and total_ips:
                percentage = (country['requests'] / total_ips) * 100
                
            if code in self.suspicious_countries:
                suspicious_traffic += percentage
        
        if suspicious_traffic > 30:
            risk_indicators.append({
                'indicator': 'suspicious_geo',
                'description': f'{suspicious_traffic:.1f}% traffic from high-risk countries',
                'risk_contribution': 25
            })
            risk_score += 25
        
        # Check for datacenter/cloud IPs
        is_distributed = source.get('isDistributed', False)
        if is_distributed:
            risk_indicators.append({
                'indicator': 'distributed_source',
                'description': 'Traffic appears to be from distributed botnet',
                'risk_contribution': 30
            })
            risk_score += 30
        
        # Check ASN concentration
        asns = source.get('asns', [])
        if asns and len(asns) < 5 and total_ips > 100:
            risk_indicators.append({
                'indicator': 'asn_concentration',
                'description': f'Traffic concentrated in {len(asns)} ASNs',
                'risk_contribution': 15
            })
            risk_score += 15
        
        return {
            'total_sources': total_ips,
            'risk_score': min(100, risk_score),
            'risk_level': self._get_risk_level(risk_score),
            'risk_indicators': risk_indicators,
            'geo_distribution': countries[:10],
            'asn_distribution': asns[:10] if asns else [],
            'is_botnet_likely': risk_score >= 50
        }
    
    def analyze_patterns(self, traffic_samples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns across multiple traffic samples"""
        if not traffic_samples:
            return {'error': 'No samples provided'}
        
        # Extract metrics
        bandwidths = []
        packets = []
        requests = []
        
        for sample in traffic_samples:
            metrics = sample.get('metrics', {}) or {}
            bw = self._get_nested(metrics, 'bandwidth.inbound', 0)
            pkt = self._get_nested(metrics, 'packets.inbound', 0)
            req = self._get_nested(metrics, 'requests.total', 0)
            
            if bw: bandwidths.append(bw)
            if pkt: packets.append(pkt)
            if req: requests.append(req)
        
        patterns = []
        
        # Check for spike pattern
        if bandwidths and len(bandwidths) >= 3:
            max_bw = max(bandwidths)
            avg_bw = statistics.mean(bandwidths)
            if max_bw > avg_bw * 3:
                patterns.append({
                    'pattern': 'traffic_spike',
                    'metric': 'bandwidth',
                    'peak': max_bw,
                    'average': avg_bw
                })
        
        # Check for sustained high traffic
        if bandwidths:
            high_count = sum(1 for bw in bandwidths if bw > self.baseline['bandwidth']['avg'] * 2)
            if high_count > len(bandwidths) * 0.7:
                patterns.append({
                    'pattern': 'sustained_flood',
                    'metric': 'bandwidth',
                    'duration_ratio': high_count / len(bandwidths)
                })
        
        # Check for periodic pattern
        if len(bandwidths) >= 10:
            # Simple periodicity check
            diffs = [bandwidths[i+1] - bandwidths[i] for i in range(len(bandwidths)-1)]
            if diffs:
                variance = statistics.variance(diffs) if len(diffs) > 1 else 0
                if variance < 100:  # Low variance in changes indicates pattern
                    patterns.append({
                        'pattern': 'periodic',
                        'variance': variance
                    })
        
        return {
            'sample_count': len(traffic_samples),
            'patterns': patterns,
            'statistics': {
                'bandwidth': {
                    'min': min(bandwidths) if bandwidths else 0,
                    'max': max(bandwidths) if bandwidths else 0,
                    'avg': statistics.mean(bandwidths) if bandwidths else 0
                },
                'packets': {
                    'min': min(packets) if packets else 0,
                    'max': max(packets) if packets else 0,
                    'avg': statistics.mean(packets) if packets else 0
                }
            }
        }
    
    def _calculate_deviation(self, value: float, metric: str) -> float:
        """Calculate standard deviations from baseline"""
        if metric not in self.baseline:
            return 0
        
        baseline = self.baseline[metric]
        avg = baseline.get('avg', 1)
        std = baseline.get('std', 1)
        
        if std == 0:
            return 0
        
        return abs(value - avg) / std
    
    def _get_status(self, health_score: int) -> str:
        """Get status from health score"""
        if health_score >= 90:
            return 'healthy'
        elif health_score >= 70:
            return 'warning'
        elif health_score >= 50:
            return 'degraded'
        return 'critical'
    
    def _get_risk_level(self, risk_score: int) -> str:
        """Get risk level from score"""
        if risk_score >= 70:
            return 'high'
        elif risk_score >= 40:
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
