"""
Rule Optimizer - Optimizes WAF rules for performance and accuracy
"""

from typing import List, Dict, Any
from collections import defaultdict


class RuleOptimizer:
    def __init__(self):
        self.category_priorities = {
            'sqli': 1,
            'xss': 2,
            'rce': 1,
            'lfi': 3,
            'bot': 5,
            'rate': 4,
            'geo': 6,
            'custom': 7
        }
    
    def optimize(self, rules: List[Any]) -> Dict[str, Any]:
        """Optimize rules for performance and accuracy"""
        recommendations = []
        redundant_rules = []
        suggested_merges = []
        false_positive_risks = []
        
        rules_data = [r.dict() if hasattr(r, 'dict') else r for r in rules]
        
        # Group rules by category
        by_category = defaultdict(list)
        for rule in rules_data:
            by_category[rule.get('category', 'custom')].append(rule)
        
        # Analyze each category
        for category, cat_rules in by_category.items():
            # Check for redundant rules
            redundant = self._find_redundant_rules(cat_rules)
            redundant_rules.extend(redundant)
            
            # Check for merge opportunities
            merges = self._find_merge_opportunities(cat_rules)
            suggested_merges.extend(merges)
            
            # Category-specific recommendations
            if len(cat_rules) > 10:
                recommendations.append({
                    'type': 'consolidation',
                    'category': category,
                    'message': f'{len(cat_rules)} rules in {category} category - consider consolidation',
                    'priority': 'medium'
                })
        
        # Analyze false positive risks
        for rule in rules_data:
            stats = rule.get('statistics', {})
            hits = stats.get('hits', 0)
            blocks = stats.get('blocks', 0)
            
            if hits > 100:
                block_rate = blocks / hits if hits > 0 else 0
                if block_rate < 0.3:
                    false_positive_risks.append({
                        'rule_id': rule.get('id'),
                        'rule_name': rule.get('name'),
                        'hits': hits,
                        'blocks': blocks,
                        'block_rate': round(block_rate, 3),
                        'risk_level': 'high' if block_rate < 0.1 else 'medium',
                        'recommendation': 'Review rule conditions - low block rate suggests false positives'
                    })
        
        # Check for priority conflicts
        priority_issues = self._check_priority_conflicts(rules_data)
        recommendations.extend(priority_issues)
        
        # Performance analysis
        performance = self._analyze_performance(rules_data)
        
        return {
            'recommendations': recommendations,
            'redundant_rules': redundant_rules,
            'suggested_merges': suggested_merges,
            'false_positive_risks': false_positive_risks,
            'performance_impact': performance,
            'summary': {
                'total_rules': len(rules_data),
                'issues_found': len(recommendations) + len(redundant_rules) + len(false_positive_risks),
                'optimization_potential': self._calculate_optimization_potential(rules_data)
            }
        }
    
    def _find_redundant_rules(self, rules: List[Dict]) -> List[Dict]:
        """Find rules that may be redundant"""
        redundant = []
        
        for i, rule1 in enumerate(rules):
            for rule2 in rules[i+1:]:
                if self._are_conditions_similar(rule1, rule2):
                    redundant.append({
                        'rule1': {'id': rule1.get('id'), 'name': rule1.get('name')},
                        'rule2': {'id': rule2.get('id'), 'name': rule2.get('name')},
                        'reason': 'Similar conditions detected',
                        'recommendation': 'Consider merging or removing one rule'
                    })
        
        return redundant
    
    def _are_conditions_similar(self, rule1: Dict, rule2: Dict) -> bool:
        """Check if two rules have similar conditions"""
        conds1 = rule1.get('conditions', [])
        conds2 = rule2.get('conditions', [])
        
        if not conds1 or not conds2:
            return False
        
        # Simple similarity check
        matches = 0
        for c1 in conds1:
            for c2 in conds2:
                if c1.get('field') == c2.get('field') and c1.get('operator') == c2.get('operator'):
                    matches += 1
        
        similarity = matches / max(len(conds1), len(conds2))
        return similarity > 0.8
    
    def _find_merge_opportunities(self, rules: List[Dict]) -> List[Dict]:
        """Find rules that could be merged"""
        merges = []
        
        # Group by action
        by_action = defaultdict(list)
        for rule in rules:
            by_action[rule.get('action', 'block')].append(rule)
        
        for action, action_rules in by_action.items():
            if len(action_rules) > 3:
                # Check if rules target same field
                fields = defaultdict(list)
                for rule in action_rules:
                    for cond in rule.get('conditions', []):
                        fields[cond.get('field')].append(rule)
                
                for field, field_rules in fields.items():
                    if len(field_rules) > 2:
                        merges.append({
                            'field': field,
                            'action': action,
                            'rules': [{'id': r.get('id'), 'name': r.get('name')} for r in field_rules[:5]],
                            'suggestion': f'Merge {len(field_rules)} rules targeting {field} into a single rule'
                        })
        
        return merges
    
    def _check_priority_conflicts(self, rules: List[Dict]) -> List[Dict]:
        """Check for priority conflicts"""
        issues = []
        
        # Group by priority
        by_priority = defaultdict(list)
        for rule in rules:
            by_priority[rule.get('priority', 100)].append(rule)
        
        for priority, priority_rules in by_priority.items():
            if len(priority_rules) > 1:
                categories = set(r.get('category') for r in priority_rules)
                if len(categories) > 1:
                    issues.append({
                        'type': 'priority_conflict',
                        'priority': priority,
                        'rules': [{'id': r.get('id'), 'name': r.get('name')} for r in priority_rules],
                        'message': f'Multiple rules with same priority {priority} in different categories',
                        'priority': 'low'
                    })
        
        return issues
    
    def _analyze_performance(self, rules: List[Dict]) -> Dict[str, Any]:
        """Analyze performance impact of rules"""
        total_rules = len(rules)
        
        # Estimate latency
        base_latency = 0.1  # ms
        per_rule_latency = 0.05  # ms
        complex_rule_multiplier = 1.5
        
        complex_rules = sum(1 for r in rules if len(r.get('conditions', [])) > 3)
        
        estimated_latency = base_latency + (total_rules * per_rule_latency) + (complex_rules * per_rule_latency * complex_rule_multiplier)
        
        return {
            'total_rules': total_rules,
            'complex_rules': complex_rules,
            'estimated_latency_ms': round(estimated_latency, 2),
            'latency_rating': 'good' if estimated_latency < 5 else ('acceptable' if estimated_latency < 10 else 'high'),
            'recommendations': [
                'Consider using managed rule groups for common protections'
            ] if total_rules > 50 else []
        }
    
    def _calculate_optimization_potential(self, rules: List[Dict]) -> str:
        """Calculate optimization potential"""
        total = len(rules)
        if total < 10:
            return 'low'
        elif total < 50:
            return 'medium'
        else:
            return 'high'
