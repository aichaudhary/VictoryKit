"""
IdentityShield ML Engine - Privilege Analyzer
Analyze permissions and policies for security risks
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class PrivilegeAnalyzer:
    def __init__(self):
        self.version = "1.0.0"
        self.is_loaded = True
        
        self.dangerous_actions = [
            "*",
            "iam:*",
            "iam:CreateUser",
            "iam:CreateAccessKey",
            "iam:AttachUserPolicy",
            "iam:AttachRolePolicy",
            "sts:AssumeRole",
            "organizations:*",
            "s3:*",
            "ec2:*",
            "lambda:*",
            "kms:*",
            "secretsmanager:*"
        ]
        
        self.sensitive_resources = [
            "arn:aws:iam::*:*",
            "arn:aws:kms::*:*",
            "arn:aws:secretsmanager::*:*"
        ]
        
        logger.info(f"Privilege Analyzer v{self.version} loaded")
    
    def analyze_role(self, role: Dict[str, Any]) -> Dict[str, Any]:
        risk_score = 0
        risk_factors = []
        recommendations = []
        
        # Analyze trust policy
        trust_policy = role.get("trustPolicy", {})
        trust_findings = self._analyze_trust_policy(trust_policy)
        risk_score += trust_findings["risk_contribution"]
        risk_factors.extend(trust_findings["factors"])
        recommendations.extend(trust_findings["recommendations"])
        
        # Analyze permissions
        permissions = role.get("permissions", [])
        perm_findings = self._analyze_permission_set(permissions)
        risk_score += perm_findings["risk_contribution"]
        risk_factors.extend(perm_findings["factors"])
        recommendations.extend(perm_findings["recommendations"])
        
        # Analyze assumable by
        assumable_by = role.get("assumableBy", [])
        if any(a.get("principalId") == "*" for a in assumable_by):
            risk_score += 30
            risk_factors.append({
                "factor": "WILDCARD_ASSUME",
                "severity": "critical",
                "description": "Role can be assumed by any principal"
            })
            recommendations.append("Restrict role trust to specific principals")
        
        risk_score = min(100, risk_score)
        
        return {
            "roleId": role.get("roleId"),
            "riskScore": risk_score,
            "riskLevel": self._get_risk_level(risk_score),
            "riskFactors": risk_factors,
            "recommendations": recommendations
        }
    
    def analyze_permissions(self, permissions: List[Dict[str, Any]]) -> Dict[str, Any]:
        findings = self._analyze_permission_set(permissions)
        risk_score = min(100, findings["risk_contribution"])
        
        return {
            "riskScore": risk_score,
            "riskLevel": self._get_risk_level(risk_score),
            "findings": findings["factors"],
            "recommendations": findings["recommendations"],
            "summary": {
                "total": len(permissions),
                "privileged": sum(1 for p in permissions if p.get("isPrivileged")),
                "wildcardActions": findings.get("wildcard_count", 0)
            }
        }
    
    def evaluate_policy(self, policy: Dict[str, Any]) -> Dict[str, Any]:
        risk_score = 0
        findings = []
        recommendations = []
        
        document = policy.get("document", {})
        statements = document.get("statements", [])
        
        for idx, stmt in enumerate(statements):
            stmt_num = idx + 1
            effect = stmt.get("effect", "Allow")
            actions = stmt.get("actions", [])
            resources = stmt.get("resources", [])
            conditions = stmt.get("conditions")
            
            # Check for wildcards in actions
            if "*" in actions:
                risk_score += 35
                findings.append({
                    "type": "WILDCARD_ACTION",
                    "severity": "critical",
                    "description": f"Statement {stmt_num} allows all actions",
                    "recommendation": "Specify explicit actions instead of *"
                })
            elif any(":*" in a for a in actions):
                risk_score += 25
                findings.append({
                    "type": "SERVICE_WILDCARD",
                    "severity": "high",
                    "description": f"Statement {stmt_num} uses service-level wildcards",
                    "recommendation": "Specify explicit actions"
                })
            
            # Check for dangerous actions
            dangerous_found = [a for a in actions if a in self.dangerous_actions]
            if dangerous_found:
                risk_score += len(dangerous_found) * 5
                findings.append({
                    "type": "DANGEROUS_ACTIONS",
                    "severity": "high",
                    "description": f"Statement {stmt_num} includes dangerous actions: {dangerous_found[:3]}",
                    "recommendation": "Review necessity of these permissions"
                })
            
            # Check for wildcards in resources
            if "*" in resources:
                risk_score += 20
                findings.append({
                    "type": "WILDCARD_RESOURCE",
                    "severity": "high",
                    "description": f"Statement {stmt_num} applies to all resources",
                    "recommendation": "Scope to specific resource ARNs"
                })
            
            # Check for missing conditions on Allow
            if effect == "Allow" and not conditions:
                findings.append({
                    "type": "NO_CONDITIONS",
                    "severity": "low",
                    "description": f"Statement {stmt_num} has no conditions",
                    "recommendation": "Add condition keys for additional security"
                })
        
        # Add recommendations
        if risk_score > 50:
            recommendations.append("Critical: This policy grants excessive permissions")
        if any(f["type"] == "WILDCARD_ACTION" for f in findings):
            recommendations.append("Replace wildcard actions with specific permissions")
        if any(f["type"] == "WILDCARD_RESOURCE" for f in findings):
            recommendations.append("Scope resources to specific ARNs")
        if not recommendations:
            recommendations.append("Policy follows security best practices")
        
        risk_score = min(100, risk_score)
        
        return {
            "policyId": policy.get("policyId"),
            "policyName": policy.get("name"),
            "riskScore": risk_score,
            "riskLevel": self._get_risk_level(risk_score),
            "findings": findings,
            "recommendations": recommendations,
            "statementCount": len(statements)
        }
    
    def _analyze_trust_policy(self, trust_policy: Dict[str, Any]) -> Dict[str, Any]:
        risk = 0
        factors = []
        recommendations = []
        
        statements = trust_policy.get("Statement", [])
        
        for stmt in statements:
            principal = stmt.get("Principal", {})
            
            # Check for wildcard principal
            if principal == "*" or (isinstance(principal, dict) and principal.get("AWS") == "*"):
                risk += 40
                factors.append({
                    "factor": "WILDCARD_TRUST",
                    "severity": "critical",
                    "description": "Trust policy allows any AWS principal"
                })
                recommendations.append("Restrict trust to specific accounts/roles")
            
            # Check for service principals
            if isinstance(principal, dict) and "Service" in principal:
                factors.append({
                    "factor": "SERVICE_PRINCIPAL",
                    "severity": "info",
                    "description": f"Role can be assumed by service: {principal['Service']}"
                })
        
        return {
            "risk_contribution": risk,
            "factors": factors,
            "recommendations": recommendations
        }
    
    def _analyze_permission_set(self, permissions: List[Dict[str, Any]]) -> Dict[str, Any]:
        risk = 0
        factors = []
        recommendations = []
        wildcard_count = 0
        
        for perm in permissions:
            action = perm.get("action", "")
            resource = perm.get("resource", "*")
            
            if action == "*":
                risk += 30
                wildcard_count += 1
                factors.append({
                    "factor": "WILDCARD_ACTION",
                    "severity": "critical",
                    "description": "Permission allows all actions"
                })
            elif ":*" in action:
                risk += 15
                wildcard_count += 1
                factors.append({
                    "factor": "SERVICE_WILDCARD",
                    "severity": "high",
                    "description": f"Service-level wildcard: {action}"
                })
            
            if resource == "*":
                risk += 10
                factors.append({
                    "factor": "WILDCARD_RESOURCE",
                    "severity": "medium",
                    "description": f"Action {action} applies to all resources"
                })
            
            if perm.get("isPrivileged"):
                risk += 10
                factors.append({
                    "factor": "PRIVILEGED_PERMISSION",
                    "severity": "high",
                    "description": f"Privileged permission: {action}"
                })
        
        if wildcard_count > 0:
            recommendations.append("Replace wildcard permissions with specific actions")
        if risk > 30:
            recommendations.append("Apply principle of least privilege")
        
        return {
            "risk_contribution": min(risk, 60),
            "factors": factors[:10],
            "recommendations": recommendations,
            "wildcard_count": wildcard_count
        }
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 70:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        return "low"
