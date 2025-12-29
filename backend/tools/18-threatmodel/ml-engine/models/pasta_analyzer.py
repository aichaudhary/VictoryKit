"""
PASTA Analyzer
Process for Attack Simulation and Threat Analysis
"""

from typing import Dict, List, Any


class PastaAnalyzer:
    """Analyzes threats using the PASTA framework (7 stages)."""
    
    def __init__(self):
        self.stages = [
            'stage1_objectives',
            'stage2_technicalScope',
            'stage3_decomposition',
            'stage4_threatAnalysis',
            'stage5_vulnerabilities',
            'stage6_attackModeling',
            'stage7_riskAnalysis'
        ]
    
    def analyze(self, model: Dict) -> Dict:
        """Perform full PASTA analysis."""
        return {
            'stage1_objectives': self._stage1_objectives(model),
            'stage2_technicalScope': self._stage2_technical_scope(model),
            'stage3_decomposition': self._stage3_decomposition(model),
            'stage4_threatAnalysis': self._stage4_threat_analysis(model),
            'stage5_vulnerabilities': self._stage5_vulnerabilities(model),
            'stage6_attackModeling': self._stage6_attack_modeling(model),
            'stage7_riskAnalysis': self._stage7_risk_analysis(model)
        }
    
    def _stage1_objectives(self, model: Dict) -> Dict:
        """Stage 1: Define Business Objectives."""
        return {
            'businessObjectives': [
                'Protect customer data and privacy',
                'Maintain service availability',
                'Ensure regulatory compliance',
                'Protect intellectual property'
            ],
            'securityRequirements': [
                'Strong authentication and authorization',
                'Data encryption at rest and in transit',
                'Comprehensive audit logging',
                'Secure development practices'
            ],
            'complianceRequirements': [
                'GDPR for personal data',
                'PCI-DSS for payment data',
                'SOC2 for service organizations'
            ]
        }
    
    def _stage2_technical_scope(self, model: Dict) -> Dict:
        """Stage 2: Define Technical Scope."""
        components = model.get('components', [])
        
        assets = []
        for comp in components:
            for data in comp.get('dataHandled', []):
                assets.append({
                    'name': data.get('type', 'Unknown'),
                    'classification': data.get('classification', 'internal'),
                    'component': comp.get('name')
                })
        
        dependencies = []
        for comp in components:
            if comp.get('type') == 'external_service':
                dependencies.append(comp.get('name'))
        
        return {
            'assets': assets,
            'dependencies': dependencies,
            'technologies': [comp.get('technology', {}).get('stack', 'Unknown') for comp in components],
            'scope': {
                'inScope': [comp.get('name') for comp in components],
                'outOfScope': ['Third-party infrastructure', 'End-user devices']
            }
        }
    
    def _stage3_decomposition(self, model: Dict) -> Dict:
        """Stage 3: Application Decomposition."""
        components = model.get('components', [])
        data_flows = model.get('dataFlows', [])
        
        return {
            'components': [
                {
                    'name': comp.get('name'),
                    'type': comp.get('type'),
                    'trustLevel': comp.get('trustLevel', 'partially_trusted')
                }
                for comp in components
            ],
            'dataFlows': [
                {
                    'flow': f"{df.get('source')} -> {df.get('destination')}",
                    'dataType': df.get('dataType'),
                    'encrypted': df.get('encrypted', False)
                }
                for df in data_flows
            ],
            'trustBoundaries': model.get('trustBoundaries', []),
            'entryPoints': [
                comp.get('name') for comp in components
                if comp.get('exposedInterfaces')
            ]
        }
    
    def _stage4_threat_analysis(self, model: Dict) -> Dict:
        """Stage 4: Threat Analysis."""
        components = model.get('components', [])
        
        threats = []
        attack_vectors = []
        
        for comp in components:
            comp_type = comp.get('type', 'other')
            
            if comp_type in ['web_server', 'api']:
                threats.extend([
                    f"Injection attacks on {comp.get('name')}",
                    f"Authentication bypass for {comp.get('name')}"
                ])
                attack_vectors.extend(['Web application attacks', 'API exploitation'])
            
            if comp_type == 'database':
                threats.extend([
                    f"SQL injection in {comp.get('name')}",
                    f"Data exfiltration from {comp.get('name')}"
                ])
                attack_vectors.append('Database attacks')
            
            if comp_type == 'external_service':
                threats.append(f"Supply chain attack via {comp.get('name')}")
                attack_vectors.append('Third-party compromise')
        
        return {
            'threats': list(set(threats)),
            'attackVectors': list(set(attack_vectors)),
            'threatActors': [
                {'type': 'External attacker', 'motivation': 'Financial gain'},
                {'type': 'Malicious insider', 'motivation': 'Data theft'},
                {'type': 'Competitor', 'motivation': 'Industrial espionage'}
            ]
        }
    
    def _stage5_vulnerabilities(self, model: Dict) -> Dict:
        """Stage 5: Vulnerability Analysis."""
        components = model.get('components', [])
        
        weaknesses = []
        exposures = []
        
        for comp in components:
            interfaces = comp.get('exposedInterfaces', [])
            
            # Check for authentication weaknesses
            unauthenticated = [i for i in interfaces if not i.get('authenticated', False)]
            if unauthenticated:
                weaknesses.append(f"Unauthenticated interfaces on {comp.get('name')}")
            
            # Check for encryption
            unencrypted = [i for i in interfaces if not i.get('encrypted', False)]
            if unencrypted:
                weaknesses.append(f"Unencrypted communication on {comp.get('name')}")
            
            # Check trust level
            if comp.get('trustLevel') == 'untrusted':
                exposures.append(f"Untrusted component: {comp.get('name')}")
        
        return {
            'weaknesses': weaknesses,
            'exposures': exposures,
            'commonVulnerabilities': [
                {'cwe': 'CWE-89', 'name': 'SQL Injection'},
                {'cwe': 'CWE-79', 'name': 'Cross-Site Scripting'},
                {'cwe': 'CWE-287', 'name': 'Improper Authentication'},
                {'cwe': 'CWE-311', 'name': 'Missing Encryption'}
            ]
        }
    
    def _stage6_attack_modeling(self, model: Dict) -> Dict:
        """Stage 6: Attack Modeling."""
        return {
            'attackTrees': [
                {
                    'goal': 'Steal customer data',
                    'paths': [
                        'SQL injection -> Database access -> Data exfiltration',
                        'Phishing -> Credential theft -> Account access -> Data export'
                    ]
                },
                {
                    'goal': 'Disrupt service',
                    'paths': [
                        'DDoS attack -> Resource exhaustion -> Service unavailable',
                        'Exploit vulnerability -> Crash application -> Downtime'
                    ]
                }
            ],
            'scenarios': [
                {
                    'name': 'External data breach',
                    'description': 'Attacker exploits web vulnerability to access database',
                    'likelihood': 'medium',
                    'impact': 'critical'
                },
                {
                    'name': 'Insider threat',
                    'description': 'Malicious employee exports sensitive data',
                    'likelihood': 'low',
                    'impact': 'high'
                }
            ]
        }
    
    def _stage7_risk_analysis(self, model: Dict) -> Dict:
        """Stage 7: Risk and Impact Analysis."""
        return {
            'risks': [
                {'name': 'Data breach', 'likelihood': 'medium', 'impact': 'critical', 'score': 85},
                {'name': 'Service disruption', 'likelihood': 'medium', 'impact': 'high', 'score': 70},
                {'name': 'Compliance violation', 'likelihood': 'low', 'impact': 'high', 'score': 55}
            ],
            'recommendations': [
                'Implement web application firewall',
                'Enable multi-factor authentication',
                'Deploy intrusion detection system',
                'Encrypt all data at rest and in transit',
                'Conduct regular penetration testing',
                'Implement comprehensive logging and monitoring'
            ],
            'prioritizedActions': [
                {'action': 'Fix critical vulnerabilities', 'priority': 'immediate'},
                {'action': 'Implement MFA', 'priority': 'high'},
                {'action': 'Deploy WAF', 'priority': 'high'},
                {'action': 'Enhance monitoring', 'priority': 'medium'}
            ]
        }
    
    def get_stage_templates(self) -> Dict:
        """Get PASTA stage templates."""
        return {
            'stage1': {
                'name': 'Define Business Objectives',
                'description': 'Identify business goals and security requirements',
                'inputs': ['Business requirements', 'Compliance requirements'],
                'outputs': ['Security objectives', 'Risk appetite']
            },
            'stage2': {
                'name': 'Define Technical Scope',
                'description': 'Document technical environment and assets',
                'inputs': ['Architecture diagrams', 'Asset inventory'],
                'outputs': ['Technical scope document', 'Asset classification']
            },
            'stage3': {
                'name': 'Application Decomposition',
                'description': 'Break down application into components',
                'inputs': ['Architecture documentation', 'Data flow diagrams'],
                'outputs': ['Component inventory', 'Trust boundaries']
            },
            'stage4': {
                'name': 'Threat Analysis',
                'description': 'Identify potential threats',
                'inputs': ['Threat intelligence', 'Attack patterns'],
                'outputs': ['Threat catalog', 'Attack vectors']
            },
            'stage5': {
                'name': 'Vulnerability Analysis',
                'description': 'Identify vulnerabilities and weaknesses',
                'inputs': ['Scan results', 'Code review findings'],
                'outputs': ['Vulnerability list', 'Weakness catalog']
            },
            'stage6': {
                'name': 'Attack Modeling',
                'description': 'Model attack scenarios',
                'inputs': ['Threats', 'Vulnerabilities'],
                'outputs': ['Attack trees', 'Attack scenarios']
            },
            'stage7': {
                'name': 'Risk and Impact Analysis',
                'description': 'Assess risks and prioritize mitigations',
                'inputs': ['Attack scenarios', 'Business impact'],
                'outputs': ['Risk ratings', 'Mitigation priorities']
            }
        }
