"""
STRIDE Analyzer
Analyzes systems using the STRIDE threat modeling framework
"""

from typing import Dict, List, Any


class StrideAnalyzer:
    """Analyzes threats using the STRIDE framework."""
    
    def __init__(self):
        self.stride_categories = {
            'S': {'name': 'Spoofing', 'description': 'Pretending to be someone or something else'},
            'T': {'name': 'Tampering', 'description': 'Modifying data or code'},
            'R': {'name': 'Repudiation', 'description': 'Denying having performed an action'},
            'I': {'name': 'Information Disclosure', 'description': 'Exposing information to unauthorized parties'},
            'D': {'name': 'Denial of Service', 'description': 'Denying or degrading service to users'},
            'E': {'name': 'Elevation of Privilege', 'description': 'Gaining capabilities without authorization'}
        }
        
        self.component_threat_map = {
            'web_server': ['S', 'T', 'I', 'D', 'E'],
            'api': ['S', 'T', 'R', 'I', 'E'],
            'database': ['T', 'R', 'I', 'E'],
            'user': ['S', 'R'],
            'external_service': ['S', 'I', 'D'],
            'data_store': ['T', 'I'],
            'process': ['T', 'E', 'D'],
            'load_balancer': ['D', 'I'],
            'cache': ['T', 'I'],
            'message_queue': ['T', 'I', 'D']
        }
    
    def analyze(self, model: Dict) -> Dict:
        """Perform STRIDE analysis on a threat model."""
        components = model.get('components', [])
        data_flows = model.get('dataFlows', [])
        
        analysis = {
            'spoofing': [],
            'tampering': [],
            'repudiation': [],
            'informationDisclosure': [],
            'denialOfService': [],
            'elevationOfPrivilege': []
        }
        
        # Analyze components
        for component in components:
            component_threats = self.analyze_component(component)
            for category, threats in component_threats.items():
                analysis[category].extend(threats)
        
        # Analyze data flows
        for flow in data_flows:
            flow_threats = self._analyze_data_flow(flow)
            for category, threats in flow_threats.items():
                analysis[category].extend(threats)
        
        # Add summary
        analysis['summary'] = {
            'totalThreats': sum(len(threats) for threats in analysis.values() if isinstance(threats, list)),
            'byCategory': {cat: len(threats) for cat, threats in analysis.items() if isinstance(threats, list)}
        }
        
        return analysis
    
    def analyze_component(self, component: Dict) -> Dict:
        """Analyze threats for a specific component."""
        threats = {
            'spoofing': [],
            'tampering': [],
            'repudiation': [],
            'informationDisclosure': [],
            'denialOfService': [],
            'elevationOfPrivilege': []
        }
        
        comp_name = component.get('name', 'Unknown')
        comp_type = component.get('type', 'other')
        trust_level = component.get('trustLevel', 'partially_trusted')
        interfaces = component.get('exposedInterfaces', [])
        data_handled = component.get('dataHandled', [])
        
        applicable_categories = self.component_threat_map.get(comp_type, ['S', 'T', 'R', 'I', 'D', 'E'])
        
        # Spoofing threats
        if 'S' in applicable_categories:
            if any(not i.get('authenticated', False) for i in interfaces):
                threats['spoofing'].append({
                    'threat': f'Identity spoofing for {comp_name}',
                    'description': 'Unauthenticated interfaces allow identity spoofing',
                    'risk': 'high',
                    'component': comp_name
                })
            else:
                threats['spoofing'].append({
                    'threat': f'Authentication bypass for {comp_name}',
                    'description': 'Weak or misconfigured authentication',
                    'risk': 'medium' if trust_level != 'untrusted' else 'high',
                    'component': comp_name
                })
        
        # Tampering threats
        if 'T' in applicable_categories:
            threats['tampering'].append({
                'threat': f'Data tampering in {comp_name}',
                'description': 'Unauthorized modification of data',
                'risk': 'high' if any(d.get('classification') in ['confidential', 'restricted'] for d in data_handled) else 'medium',
                'component': comp_name
            })
        
        # Repudiation threats
        if 'R' in applicable_categories:
            threats['repudiation'].append({
                'threat': f'Action repudiation in {comp_name}',
                'description': 'Insufficient audit logging for actions',
                'risk': 'medium',
                'component': comp_name
            })
        
        # Information Disclosure threats
        if 'I' in applicable_categories:
            has_sensitive = any(d.get('pii') or d.get('phi') or d.get('pci') for d in data_handled)
            threats['informationDisclosure'].append({
                'threat': f'Information disclosure from {comp_name}',
                'description': 'Sensitive data exposure',
                'risk': 'critical' if has_sensitive else 'high',
                'component': comp_name
            })
        
        # Denial of Service threats
        if 'D' in applicable_categories:
            threats['denialOfService'].append({
                'threat': f'Denial of service for {comp_name}',
                'description': 'Service availability disruption',
                'risk': 'high',
                'component': comp_name
            })
        
        # Elevation of Privilege threats
        if 'E' in applicable_categories:
            threats['elevationOfPrivilege'].append({
                'threat': f'Privilege escalation via {comp_name}',
                'description': 'Gaining elevated permissions',
                'risk': 'critical' if trust_level == 'highly_trusted' else 'high',
                'component': comp_name
            })
        
        return threats
    
    def _analyze_data_flow(self, flow: Dict) -> Dict:
        """Analyze threats for a data flow."""
        threats = {
            'spoofing': [],
            'tampering': [],
            'repudiation': [],
            'informationDisclosure': [],
            'denialOfService': [],
            'elevationOfPrivilege': []
        }
        
        source = flow.get('source', 'Unknown')
        dest = flow.get('destination', 'Unknown')
        encrypted = flow.get('encrypted', False)
        
        flow_name = f"{source} -> {dest}"
        
        # Tampering
        if not encrypted:
            threats['tampering'].append({
                'threat': f'Data tampering in transit: {flow_name}',
                'description': 'Unencrypted data flow susceptible to modification',
                'risk': 'high'
            })
        
        # Information Disclosure
        if not encrypted:
            threats['informationDisclosure'].append({
                'threat': f'Data interception: {flow_name}',
                'description': 'Unencrypted data flow susceptible to eavesdropping',
                'risk': 'high'
            })
        
        # Spoofing
        threats['spoofing'].append({
            'threat': f'Source spoofing: {flow_name}',
            'description': f'Impersonation of {source}',
            'risk': 'medium'
        })
        
        return threats
    
    def analyze_attack_surface(self, model: Dict) -> Dict:
        """Analyze the attack surface of a threat model."""
        components = model.get('components', [])
        
        attack_surface = {
            'external_interfaces': [],
            'internal_interfaces': [],
            'data_exposure': [],
            'trust_boundaries': []
        }
        
        for component in components:
            interfaces = component.get('exposedInterfaces', [])
            comp_name = component.get('name', 'Unknown')
            
            for interface in interfaces:
                entry = {
                    'component': comp_name,
                    'interface': interface.get('name'),
                    'type': interface.get('type'),
                    'authenticated': interface.get('authenticated', False),
                    'encrypted': interface.get('encrypted', False)
                }
                
                if interface.get('type') in ['api', 'ui']:
                    attack_surface['external_interfaces'].append(entry)
                else:
                    attack_surface['internal_interfaces'].append(entry)
        
        # Summary
        attack_surface['summary'] = {
            'externalCount': len(attack_surface['external_interfaces']),
            'internalCount': len(attack_surface['internal_interfaces']),
            'unauthenticated': sum(1 for i in attack_surface['external_interfaces'] if not i['authenticated']),
            'unencrypted': sum(1 for i in attack_surface['external_interfaces'] if not i['encrypted'])
        }
        
        return attack_surface
    
    def get_threat_templates(self) -> Dict:
        """Get STRIDE threat templates."""
        return {
            'spoofing': [
                {'name': 'Credential theft', 'description': 'Stealing user credentials'},
                {'name': 'Session hijacking', 'description': 'Taking over authenticated session'},
                {'name': 'IP spoofing', 'description': 'Faking source IP address'}
            ],
            'tampering': [
                {'name': 'SQL injection', 'description': 'Injecting malicious SQL'},
                {'name': 'Parameter manipulation', 'description': 'Modifying request parameters'},
                {'name': 'Data corruption', 'description': 'Corrupting stored data'}
            ],
            'repudiation': [
                {'name': 'Insufficient logging', 'description': 'Lack of audit trail'},
                {'name': 'Log tampering', 'description': 'Modifying audit logs'},
                {'name': 'Anonymous actions', 'description': 'Actions without attribution'}
            ],
            'informationDisclosure': [
                {'name': 'Data leak', 'description': 'Unintended data exposure'},
                {'name': 'Path traversal', 'description': 'Accessing unauthorized files'},
                {'name': 'Error disclosure', 'description': 'Revealing info through errors'}
            ],
            'denialOfService': [
                {'name': 'Resource exhaustion', 'description': 'Consuming all resources'},
                {'name': 'Traffic flooding', 'description': 'Overwhelming with requests'},
                {'name': 'Logic DoS', 'description': 'Triggering expensive operations'}
            ],
            'elevationOfPrivilege': [
                {'name': 'Privilege escalation', 'description': 'Gaining admin access'},
                {'name': 'Role bypass', 'description': 'Bypassing role restrictions'},
                {'name': 'Command injection', 'description': 'Executing system commands'}
            ]
        }
