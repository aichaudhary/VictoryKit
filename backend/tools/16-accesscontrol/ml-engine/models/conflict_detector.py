"""
Conflict Detector
Detects conflicts between access control policies
"""

from typing import Dict, List, Any


class ConflictDetector:
    def __init__(self):
        pass
    
    def detect(self, policies: List[Dict]) -> List[Dict]:
        """Detect conflicts between policies"""
        conflicts = []
        
        # Compare each pair of policies
        for i, policy1 in enumerate(policies):
            for j, policy2 in enumerate(policies):
                if i >= j:
                    continue
                
                conflict = self._detect_conflict(policy1, policy2)
                if conflict:
                    conflicts.append(conflict)
        
        return conflicts
    
    def _detect_conflict(self, policy1: Dict, policy2: Dict) -> Dict | None:
        """Detect conflict between two policies"""
        # Only check conflicts between allow and deny policies
        if policy1.get('effect') == policy2.get('effect'):
            # Same effect - check for redundancy instead
            if self._check_redundancy(policy1, policy2):
                return {
                    'type': 'REDUNDANCY',
                    'severity': 'low',
                    'policy1': policy1.get('policyId'),
                    'policy2': policy2.get('policyId'),
                    'description': 'Policies have overlapping scope and may be redundant',
                    'recommendation': 'Consider consolidating these policies'
                }
            return None
        
        # Check for overlapping subjects
        subjects_overlap = self._check_subjects_overlap(
            policy1.get('subjects', {}),
            policy2.get('subjects', {})
        )
        if not subjects_overlap:
            return None
        
        # Check for overlapping resources
        resources_overlap = self._check_resources_overlap(
            policy1.get('resources', {}),
            policy2.get('resources', {})
        )
        if not resources_overlap:
            return None
        
        # Check for overlapping actions
        actions_overlap = self._check_actions_overlap(
            policy1.get('actions', []),
            policy2.get('actions', [])
        )
        if not actions_overlap:
            return None
        
        # We have a conflict
        return {
            'type': 'EFFECT_CONFLICT',
            'severity': 'high',
            'policy1': {
                'id': policy1.get('policyId'),
                'effect': policy1.get('effect'),
                'priority': policy1.get('priority', 100)
            },
            'policy2': {
                'id': policy2.get('policyId'),
                'effect': policy2.get('effect'),
                'priority': policy2.get('priority', 100)
            },
            'overlap': {
                'subjects': subjects_overlap,
                'resources': resources_overlap,
                'actions': actions_overlap
            },
            'description': f'Policies have conflicting effects (allow vs deny) for overlapping scope',
            'recommendation': 'Review policy priorities or refine scope to eliminate conflict',
            'resolution': self._suggest_resolution(policy1, policy2)
        }
    
    def _check_subjects_overlap(self, subjects1: Dict, subjects2: Dict) -> List[str] | None:
        """Check if subjects overlap between policies"""
        overlap = []
        
        # Check users overlap
        users1 = set(subjects1.get('users', []))
        users2 = set(subjects2.get('users', []))
        user_overlap = users1 & users2
        if user_overlap:
            overlap.extend([f'user:{u}' for u in user_overlap])
        
        # Check roles overlap
        roles1 = set(subjects1.get('roles', []))
        roles2 = set(subjects2.get('roles', []))
        role_overlap = roles1 & roles2
        if role_overlap:
            overlap.extend([f'role:{r}' for r in role_overlap])
        
        # Check groups overlap
        groups1 = set(subjects1.get('groups', []))
        groups2 = set(subjects2.get('groups', []))
        group_overlap = groups1 & groups2
        if group_overlap:
            overlap.extend([f'group:{g}' for g in group_overlap])
        
        # If either policy has no subjects defined, it applies to all
        if not subjects1 or not subjects2:
            return ['*']
        
        return overlap if overlap else None
    
    def _check_resources_overlap(self, resources1: Dict, resources2: Dict) -> List[str] | None:
        """Check if resources overlap between policies"""
        overlap = []
        
        # Check types overlap
        types1 = set(resources1.get('types', []))
        types2 = set(resources2.get('types', []))
        type_overlap = types1 & types2
        if type_overlap:
            overlap.extend(list(type_overlap))
        
        # Check identifiers overlap
        ids1 = set(resources1.get('identifiers', []))
        ids2 = set(resources2.get('identifiers', []))
        id_overlap = ids1 & ids2
        if id_overlap:
            overlap.extend(list(id_overlap))
        
        # If either policy has no resources defined, it applies to all
        if not resources1 or not resources2:
            return ['*']
        
        return overlap if overlap else None
    
    def _check_actions_overlap(self, actions1: List[str], actions2: List[str]) -> List[str] | None:
        """Check if actions overlap between policies"""
        # Wildcard matches everything
        if '*' in actions1 or '*' in actions2:
            return ['*']
        
        set1 = set(actions1)
        set2 = set(actions2)
        overlap = set1 & set2
        
        return list(overlap) if overlap else None
    
    def _check_redundancy(self, policy1: Dict, policy2: Dict) -> bool:
        """Check if policies are redundant"""
        # Check if one policy is a subset of another
        subjects_overlap = self._check_subjects_overlap(
            policy1.get('subjects', {}),
            policy2.get('subjects', {})
        )
        resources_overlap = self._check_resources_overlap(
            policy1.get('resources', {}),
            policy2.get('resources', {})
        )
        actions_overlap = self._check_actions_overlap(
            policy1.get('actions', []),
            policy2.get('actions', [])
        )
        
        return bool(subjects_overlap and resources_overlap and actions_overlap)
    
    def _suggest_resolution(self, policy1: Dict, policy2: Dict) -> str:
        """Suggest resolution for conflicting policies"""
        p1_priority = policy1.get('priority', 100)
        p2_priority = policy2.get('priority', 100)
        
        if p1_priority == p2_priority:
            return 'Set different priorities to establish precedence'
        
        higher_priority = policy1.get('policyId') if p1_priority < p2_priority else policy2.get('policyId')
        winning_effect = policy1.get('effect') if p1_priority < p2_priority else policy2.get('effect')
        
        return f'Policy "{higher_priority}" ({winning_effect}) takes precedence due to lower priority number'
