"""
Anomaly Detector - Detects anomalies in API traffic
"""

from typing import List, Dict, Any
from collections import defaultdict
import statistics


class AnomalyDetector:
    def __init__(self):
        self.thresholds = {
            'traffic_spike_multiplier': 3.0,
            'error_rate_threshold': 0.1,
            'latency_multiplier': 2.0,
            'min_requests_for_baseline': 10
        }
    
    def detect(self, requests: List[Dict], window_minutes: int = 60) -> Dict[str, Any]:
        """Detect anomalies in request data"""
        anomalies = []
        
        # Group requests by endpoint
        by_endpoint = defaultdict(list)
        by_ip = defaultdict(list)
        
        for req in requests:
            key = f"{req.get('method', 'GET')} {req.get('path', '/')}"
            by_endpoint[key].append(req)
            by_ip[req.get('ip', 'unknown')].append(req)
        
        # Detect traffic spikes per endpoint
        traffic_anomalies = self._detect_traffic_spikes(by_endpoint)
        anomalies.extend(traffic_anomalies)
        
        # Detect error rate anomalies
        error_anomalies = self._detect_error_rates(by_endpoint)
        anomalies.extend(error_anomalies)
        
        # Detect latency anomalies
        latency_anomalies = self._detect_latency_issues(by_endpoint)
        anomalies.extend(latency_anomalies)
        
        # Detect IP-based anomalies
        ip_anomalies = self._detect_ip_anomalies(by_ip)
        anomalies.extend(ip_anomalies)
        
        # Detect authentication failures
        auth_anomalies = self._detect_auth_failures(requests)
        anomalies.extend(auth_anomalies)
        
        return {
            'total_requests': len(requests),
            'window_minutes': window_minutes,
            'anomalies': anomalies,
            'anomaly_count': len(anomalies),
            'by_type': self._count_by_type(anomalies),
            'by_severity': self._count_by_severity(anomalies),
            'recommendations': self._generate_recommendations(anomalies)
        }
    
    def _detect_traffic_spikes(self, by_endpoint: Dict) -> List[Dict]:
        """Detect unusual traffic spikes"""
        anomalies = []
        
        for endpoint, reqs in by_endpoint.items():
            if len(reqs) < self.thresholds['min_requests_for_baseline']:
                continue
            
            # Simple spike detection
            avg_rate = len(reqs) / 60  # per minute
            
            # Check for sudden bursts
            burst_threshold = avg_rate * self.thresholds['traffic_spike_multiplier']
            
            if len(reqs) > burst_threshold * 60:
                anomalies.append({
                    'type': 'traffic_spike',
                    'severity': 'medium',
                    'description': f'Traffic spike detected for {endpoint}',
                    'metrics': {
                        'baseline': round(avg_rate, 2),
                        'observed': round(len(reqs) / 60, 2),
                        'threshold': round(burst_threshold, 2)
                    },
                    'endpoint': endpoint
                })
        
        return anomalies
    
    def _detect_error_rates(self, by_endpoint: Dict) -> List[Dict]:
        """Detect high error rates"""
        anomalies = []
        
        for endpoint, reqs in by_endpoint.items():
            if len(reqs) < self.thresholds['min_requests_for_baseline']:
                continue
            
            errors = [r for r in reqs if r.get('status_code', 200) >= 400]
            error_rate = len(errors) / len(reqs)
            
            if error_rate > self.thresholds['error_rate_threshold']:
                severity = 'critical' if error_rate > 0.5 else ('high' if error_rate > 0.25 else 'medium')
                
                anomalies.append({
                    'type': 'error_rate',
                    'severity': severity,
                    'description': f'High error rate on {endpoint}',
                    'metrics': {
                        'error_rate': round(error_rate, 3),
                        'errors': len(errors),
                        'total': len(reqs)
                    },
                    'endpoint': endpoint
                })
        
        return anomalies
    
    def _detect_latency_issues(self, by_endpoint: Dict) -> List[Dict]:
        """Detect latency anomalies"""
        anomalies = []
        
        for endpoint, reqs in by_endpoint.items():
            latencies = [r.get('latency', 0) for r in reqs if r.get('latency')]
            
            if len(latencies) < self.thresholds['min_requests_for_baseline']:
                continue
            
            avg_latency = statistics.mean(latencies)
            max_latency = max(latencies)
            
            if max_latency > avg_latency * self.thresholds['latency_multiplier']:
                anomalies.append({
                    'type': 'latency',
                    'severity': 'medium',
                    'description': f'Latency spike on {endpoint}',
                    'metrics': {
                        'avg_latency_ms': round(avg_latency, 2),
                        'max_latency_ms': round(max_latency, 2),
                        'threshold_ms': round(avg_latency * self.thresholds['latency_multiplier'], 2)
                    },
                    'endpoint': endpoint
                })
        
        return anomalies
    
    def _detect_ip_anomalies(self, by_ip: Dict) -> List[Dict]:
        """Detect suspicious IP behavior"""
        anomalies = []
        
        # Calculate average requests per IP
        request_counts = [len(reqs) for reqs in by_ip.values()]
        if not request_counts:
            return anomalies
        
        avg_requests = statistics.mean(request_counts)
        threshold = avg_requests * 10  # 10x average
        
        for ip, reqs in by_ip.items():
            if len(reqs) > threshold:
                anomalies.append({
                    'type': 'security',
                    'severity': 'high',
                    'description': f'Excessive requests from IP {ip}',
                    'metrics': {
                        'ip': ip,
                        'request_count': len(reqs),
                        'average': round(avg_requests, 2)
                    }
                })
        
        return anomalies
    
    def _detect_auth_failures(self, requests: List[Dict]) -> List[Dict]:
        """Detect authentication failure patterns"""
        anomalies = []
        
        # Count 401/403 responses
        auth_failures = [r for r in requests if r.get('status_code') in [401, 403]]
        
        if len(auth_failures) > 10:
            # Group by IP
            by_ip = defaultdict(list)
            for r in auth_failures:
                by_ip[r.get('ip', 'unknown')].append(r)
            
            for ip, failures in by_ip.items():
                if len(failures) >= 5:
                    anomalies.append({
                        'type': 'authentication_failure',
                        'severity': 'high',
                        'description': f'Multiple auth failures from {ip}',
                        'metrics': {
                            'ip': ip,
                            'failures': len(failures)
                        }
                    })
        
        return anomalies
    
    def _count_by_type(self, anomalies: List[Dict]) -> Dict[str, int]:
        """Count anomalies by type"""
        counts = defaultdict(int)
        for a in anomalies:
            counts[a.get('type', 'unknown')] += 1
        return dict(counts)
    
    def _count_by_severity(self, anomalies: List[Dict]) -> Dict[str, int]:
        """Count anomalies by severity"""
        counts = defaultdict(int)
        for a in anomalies:
            counts[a.get('severity', 'medium')] += 1
        return dict(counts)
    
    def _generate_recommendations(self, anomalies: List[Dict]) -> List[Dict]:
        """Generate recommendations based on detected anomalies"""
        recommendations = []
        types = set(a.get('type') for a in anomalies)
        
        if 'traffic_spike' in types:
            recommendations.append({
                'priority': 'medium',
                'action': 'Review rate limiting configuration',
                'type': 'traffic_spike'
            })
        
        if 'authentication_failure' in types:
            recommendations.append({
                'priority': 'high',
                'action': 'Investigate potential brute force attack',
                'type': 'authentication_failure'
            })
        
        if 'security' in types:
            recommendations.append({
                'priority': 'high',
                'action': 'Consider blocking suspicious IPs',
                'type': 'security'
            })
        
        return recommendations
