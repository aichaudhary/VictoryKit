"""
Security Scorer - SSL/TLS security scoring
"""

from typing import Dict, Any, List


class SecurityScorer:
    """Calculate comprehensive security scores for SSL/TLS"""
    
    def __init__(self):
        self.scoring_weights = {
            'certificate': 30,
            'protocol': 30,
            'cipher': 25,
            'key_exchange': 15
        }
        
        self.grade_thresholds = {
            'A+': 95,
            'A': 90,
            'A-': 85,
            'B': 80,
            'C': 70,
            'D': 60,
            'F': 0
        }
    
    def calculate_score(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall security score"""
        scores = {
            'certificate': self._score_certificate(cert_data),
            'protocol': self._score_protocols(cert_data.get('protocols', [])),
            'cipher': self._score_ciphers(cert_data.get('ciphers', [])),
            'key_exchange': self._score_key_exchange(cert_data)
        }
        
        # Calculate weighted average
        total_weight = sum(self.scoring_weights.values())
        weighted_score = sum(
            scores[category] * self.scoring_weights[category]
            for category in scores
        ) / total_weight
        
        # Apply penalties
        penalties = self._calculate_penalties(cert_data)
        final_score = max(0, weighted_score - penalties['total'])
        
        # Determine grade
        grade = self._score_to_grade(final_score)
        
        return {
            'overall_score': round(final_score),
            'grade': grade,
            'category_scores': {k: round(v) for k, v in scores.items()},
            'penalties': penalties,
            'breakdown': {
                'certificate': {
                    'score': round(scores['certificate']),
                    'weight': self.scoring_weights['certificate']
                },
                'protocol': {
                    'score': round(scores['protocol']),
                    'weight': self.scoring_weights['protocol']
                },
                'cipher': {
                    'score': round(scores['cipher']),
                    'weight': self.scoring_weights['cipher']
                },
                'key_exchange': {
                    'score': round(scores['key_exchange']),
                    'weight': self.scoring_weights['key_exchange']
                }
            }
        }
    
    def _score_certificate(self, cert_data: Dict[str, Any]) -> float:
        """Score certificate quality"""
        score = 100.0
        
        # Validity check
        validity = cert_data.get('validity', {})
        days_remaining = validity.get('daysRemaining', 0)
        
        if validity.get('isExpired', False):
            score = 0  # Expired certificate
        elif days_remaining <= 7:
            score -= 30
        elif days_remaining <= 30:
            score -= 15
        
        # Key strength
        public_key = cert_data.get('publicKey', {})
        key_size = public_key.get('size', 0)
        algorithm = public_key.get('algorithm', '').upper()
        
        if algorithm == 'RSA':
            if key_size < 1024:
                score -= 50
            elif key_size < 2048:
                score -= 25
            elif key_size >= 4096:
                score += 5
        elif algorithm == 'EC':
            if key_size < 256:
                score -= 30
            elif key_size >= 384:
                score += 5
        
        # Signature algorithm
        signature = cert_data.get('signature', {})
        sig_alg = signature.get('algorithm', '').lower()
        
        if 'sha1' in sig_alg:
            score -= 25
        elif 'md5' in sig_alg or 'md2' in sig_alg:
            score -= 50
        elif 'sha384' in sig_alg or 'sha512' in sig_alg:
            score += 5
        
        return max(0, min(100, score))
    
    def _score_protocols(self, protocols: List[Dict[str, Any]]) -> float:
        """Score supported protocols"""
        if not protocols:
            return 70  # Default if no protocol info
        
        score = 100.0
        
        protocol_scores = {
            'TLSv1.3': 100,
            'TLSv1.2': 95,
            'TLSv1.1': 50,  # Deprecated
            'TLSv1': 40,    # Deprecated
            'TLSv1.0': 40,
            'SSLv3': 0,     # Vulnerable
            'SSLv2': 0      # Vulnerable
        }
        
        supported = []
        has_modern = False
        has_deprecated = False
        has_vulnerable = False
        
        for protocol in protocols:
            name = protocol.get('name', '') or protocol.get('version', '')
            is_supported = protocol.get('supported', True)
            
            if is_supported:
                supported.append(name)
                
                if 'TLSv1.3' in name or 'TLSv1.2' in name:
                    has_modern = True
                elif 'TLSv1.1' in name or 'TLSv1.0' in name or name == 'TLSv1':
                    has_deprecated = True
                elif 'SSL' in name:
                    has_vulnerable = True
        
        if has_vulnerable:
            score -= 40
        if has_deprecated:
            score -= 20
        if not has_modern:
            score -= 30
        
        return max(0, min(100, score))
    
    def _score_ciphers(self, ciphers: List[Dict[str, Any]]) -> float:
        """Score cipher suite security"""
        if not ciphers:
            return 70  # Default if no cipher info
        
        score = 100.0
        
        weak_ciphers = ['DES', '3DES', 'RC4', 'RC2', 'NULL', 'EXPORT', 'anon']
        medium_ciphers = ['CBC']
        
        has_weak = False
        has_medium = False
        has_strong = False
        
        for cipher in ciphers:
            name = cipher.get('name', '')
            strength = cipher.get('strength', 'unknown')
            secure = cipher.get('secure', True)
            
            if not secure or any(w in name.upper() for w in weak_ciphers):
                has_weak = True
            elif any(m in name.upper() for m in medium_ciphers):
                has_medium = True
            else:
                has_strong = True
        
        if has_weak:
            score -= 35
        if has_medium:
            score -= 10
        if not has_strong:
            score -= 20
        
        return max(0, min(100, score))
    
    def _score_key_exchange(self, cert_data: Dict[str, Any]) -> float:
        """Score key exchange strength"""
        score = 85.0  # Default
        
        public_key = cert_data.get('publicKey', {})
        algorithm = public_key.get('algorithm', '').upper()
        size = public_key.get('size', 0)
        
        if algorithm == 'EC':
            if size >= 384:
                score = 100
            elif size >= 256:
                score = 95
        elif algorithm == 'RSA':
            if size >= 4096:
                score = 95
            elif size >= 2048:
                score = 85
            elif size >= 1024:
                score = 50
        
        return score
    
    def _calculate_penalties(self, cert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate score penalties"""
        penalties = []
        total = 0
        
        # Expired certificate
        if cert_data.get('validity', {}).get('isExpired', False):
            penalties.append({'reason': 'expired_certificate', 'points': 50})
            total += 50
        
        # Weak key
        key_size = cert_data.get('publicKey', {}).get('size', 0)
        if key_size > 0 and key_size < 2048:
            penalty = 20 if key_size >= 1024 else 40
            penalties.append({'reason': 'weak_key', 'points': penalty})
            total += penalty
        
        return {
            'penalties': penalties,
            'total': total
        }
    
    def _score_to_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        for grade, threshold in self.grade_thresholds.items():
            if score >= threshold:
                return grade
        return 'F'
    
    def get_recommendations(self, analysis: Dict, score: Dict) -> Dict[str, Any]:
        """Get improvement recommendations"""
        recommendations = []
        priority_actions = []
        
        issues = analysis.get('issues', [])
        warnings = analysis.get('warnings', [])
        
        # Process critical issues
        for issue in issues:
            if issue.get('severity') == 'critical':
                priority_actions.append({
                    'action': issue.get('recommendation', 'Address critical issue'),
                    'impact': 'high',
                    'type': issue.get('type')
                })
            else:
                recommendations.append({
                    'action': issue.get('recommendation', 'Address issue'),
                    'impact': 'medium',
                    'type': issue.get('type')
                })
        
        # Process warnings
        for warning in warnings:
            recommendations.append({
                'action': warning.get('description'),
                'impact': 'low',
                'type': warning.get('type')
            })
        
        # Score-based recommendations
        category_scores = score.get('category_scores', {})
        
        if category_scores.get('protocol', 100) < 80:
            recommendations.append({
                'action': 'Disable deprecated protocols (TLS 1.0, 1.1)',
                'impact': 'high',
                'type': 'protocol_upgrade'
            })
        
        if category_scores.get('cipher', 100) < 80:
            recommendations.append({
                'action': 'Remove weak cipher suites',
                'impact': 'high',
                'type': 'cipher_upgrade'
            })
        
        return {
            'current_grade': score.get('grade', 'N/A'),
            'current_score': score.get('overall_score', 0),
            'priority_actions': priority_actions,
            'recommendations': recommendations,
            'potential_grade': self._estimate_improved_grade(score, priority_actions)
        }
    
    def _estimate_improved_grade(self, score: Dict, priority_actions: List) -> str:
        """Estimate grade after improvements"""
        current = score.get('overall_score', 0)
        potential = current
        
        for action in priority_actions:
            if action.get('impact') == 'high':
                potential += 15
        
        potential = min(100, potential)
        return self._score_to_grade(potential)
