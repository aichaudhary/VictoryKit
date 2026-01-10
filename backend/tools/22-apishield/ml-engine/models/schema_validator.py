"""
Schema Validator - Validates API schemas for security best practices
"""

from typing import Dict, Any, List


class SchemaValidator:
    def __init__(self):
        self.security_checks = [
            'authentication',
            'authorization',
            'input_validation',
            'response_filtering',
            'rate_limiting',
            'cors',
            'content_types'
        ]
    
    def validate(self, schema_type: str, schema_content: Dict) -> Dict[str, Any]:
        """Validate API schema for security best practices"""
        if schema_type == 'openapi':
            return self._validate_openapi(schema_content)
        elif schema_type == 'graphql':
            return self._validate_graphql(schema_content)
        else:
            return {'error': f'Unsupported schema type: {schema_type}'}
    
    def _validate_openapi(self, schema: Dict) -> Dict[str, Any]:
        """Validate OpenAPI specification"""
        issues = []
        warnings = []
        passed = []
        
        # Check OpenAPI version
        version = schema.get('openapi', schema.get('swagger', ''))
        if version.startswith('2'):
            warnings.append({
                'check': 'version',
                'message': 'Using older Swagger 2.0 format - consider upgrading to OpenAPI 3.x'
            })
        
        # Check security schemes
        security_schemes = schema.get('components', {}).get('securitySchemes', {})
        if not security_schemes:
            security_schemes = schema.get('securityDefinitions', {})
        
        if not security_schemes:
            issues.append({
                'check': 'authentication',
                'severity': 'critical',
                'message': 'No security schemes defined'
            })
        else:
            passed.append({'check': 'authentication', 'message': 'Security schemes defined'})
            
            # Check scheme types
            for name, scheme in security_schemes.items():
                scheme_type = scheme.get('type', '')
                if scheme_type == 'apiKey':
                    warnings.append({
                        'check': 'authentication',
                        'message': f'API key auth ({name}) is less secure than OAuth2/JWT'
                    })
                elif scheme_type in ['oauth2', 'openIdConnect']:
                    passed.append({
                        'check': 'authentication',
                        'message': f'Strong authentication scheme: {name}'
                    })
        
        # Check global security
        global_security = schema.get('security', [])
        if not global_security:
            warnings.append({
                'check': 'global_security',
                'message': 'No global security requirement - each endpoint must define security'
            })
        else:
            passed.append({'check': 'global_security', 'message': 'Global security requirement defined'})
        
        # Check paths
        paths = schema.get('paths', {})
        path_issues = self._check_paths(paths)
        issues.extend(path_issues['issues'])
        warnings.extend(path_issues['warnings'])
        
        # Check servers
        servers = schema.get('servers', [])
        if servers:
            for server in servers:
                url = server.get('url', '')
                if url.startswith('http://') and 'localhost' not in url:
                    issues.append({
                        'check': 'https',
                        'severity': 'high',
                        'message': f'Non-HTTPS server URL: {url}'
                    })
        
        # Calculate score
        score = 100
        score -= len([i for i in issues if i.get('severity') == 'critical']) * 20
        score -= len([i for i in issues if i.get('severity') == 'high']) * 15
        score -= len([i for i in issues if i.get('severity') == 'medium']) * 10
        score -= len(warnings) * 5
        score = max(0, score)
        
        return {
            'valid': len([i for i in issues if i.get('severity') == 'critical']) == 0,
            'score': score,
            'issues': issues,
            'warnings': warnings,
            'passed': passed,
            'summary': {
                'total_paths': len(paths),
                'critical_issues': len([i for i in issues if i.get('severity') == 'critical']),
                'high_issues': len([i for i in issues if i.get('severity') == 'high']),
                'warnings': len(warnings)
            }
        }
    
    def _check_paths(self, paths: Dict) -> Dict[str, List]:
        """Check individual paths for security issues"""
        issues = []
        warnings = []
        
        for path, methods in paths.items():
            # Check path for sensitive data
            sensitive_terms = ['password', 'token', 'secret', 'key', 'ssn']
            for term in sensitive_terms:
                if term in path.lower():
                    issues.append({
                        'check': 'sensitive_path',
                        'severity': 'high',
                        'message': f'Sensitive term in path: {path}'
                    })
                    break
            
            for method, details in methods.items():
                if method in ['get', 'post', 'put', 'patch', 'delete']:
                    # Check for security
                    if not details.get('security'):
                        warnings.append({
                            'check': 'endpoint_security',
                            'message': f'No security defined for {method.upper()} {path}'
                        })
                    
                    # Check for parameters validation
                    params = details.get('parameters', [])
                    for param in params:
                        schema = param.get('schema', {})
                        if not schema.get('type') and not schema.get('$ref'):
                            warnings.append({
                                'check': 'parameter_schema',
                                'message': f'Parameter lacks type: {param.get("name")} in {method.upper()} {path}'
                            })
        
        return {'issues': issues, 'warnings': warnings}
    
    def _validate_graphql(self, schema: Dict) -> Dict[str, Any]:
        """Validate GraphQL schema"""
        issues = []
        warnings = []
        passed = []
        
        # Check for introspection
        if schema.get('introspection_enabled', True):
            warnings.append({
                'check': 'introspection',
                'message': 'GraphQL introspection should be disabled in production'
            })
        
        # Check for query depth limiting
        if not schema.get('query_depth_limit'):
            issues.append({
                'check': 'query_depth',
                'severity': 'medium',
                'message': 'No query depth limit configured'
            })
        
        # Check for rate limiting
        if not schema.get('rate_limiting'):
            warnings.append({
                'check': 'rate_limiting',
                'message': 'Consider implementing rate limiting for GraphQL'
            })
        
        score = 100
        score -= len(issues) * 15
        score -= len(warnings) * 5
        score = max(0, score)
        
        return {
            'valid': True,
            'score': score,
            'issues': issues,
            'warnings': warnings,
            'passed': passed
        }
