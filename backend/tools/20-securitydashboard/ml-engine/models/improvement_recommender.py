"""Improvement recommendation engine"""

from typing import Dict, Any, List, Optional


class ImprovementRecommender:
    """Recommend and prioritize security improvements"""
    
    def __init__(self):
        # Improvement library by category
        self.improvements = {
            "network": [
                {"name": "Implement network segmentation", "impact": 12, "effort": "high", "cost": 50000, "timeframe": "medium_term"},
                {"name": "Deploy next-gen firewall", "impact": 10, "effort": "medium", "cost": 30000, "timeframe": "short_term"},
                {"name": "Enable IDS/IPS", "impact": 8, "effort": "medium", "cost": 20000, "timeframe": "short_term"},
                {"name": "Implement zero trust network", "impact": 15, "effort": "very_high", "cost": 100000, "timeframe": "long_term"},
                {"name": "Deploy network monitoring", "impact": 6, "effort": "low", "cost": 10000, "timeframe": "quick_win"}
            ],
            "endpoint": [
                {"name": "Deploy EDR solution", "impact": 12, "effort": "medium", "cost": 25000, "timeframe": "short_term"},
                {"name": "Enable full disk encryption", "impact": 8, "effort": "low", "cost": 5000, "timeframe": "quick_win"},
                {"name": "Implement patch management", "impact": 10, "effort": "medium", "cost": 15000, "timeframe": "short_term"},
                {"name": "Deploy application whitelisting", "impact": 9, "effort": "high", "cost": 20000, "timeframe": "medium_term"},
                {"name": "Enable endpoint logging", "impact": 5, "effort": "low", "cost": 3000, "timeframe": "quick_win"}
            ],
            "identity": [
                {"name": "Implement MFA everywhere", "impact": 15, "effort": "medium", "cost": 15000, "timeframe": "short_term"},
                {"name": "Deploy PAM solution", "impact": 12, "effort": "high", "cost": 40000, "timeframe": "medium_term"},
                {"name": "Implement SSO", "impact": 8, "effort": "medium", "cost": 20000, "timeframe": "short_term"},
                {"name": "Regular access reviews", "impact": 6, "effort": "low", "cost": 5000, "timeframe": "quick_win"},
                {"name": "Implement identity governance", "impact": 10, "effort": "high", "cost": 50000, "timeframe": "medium_term"}
            ],
            "data": [
                {"name": "Implement DLP", "impact": 12, "effort": "high", "cost": 45000, "timeframe": "medium_term"},
                {"name": "Enable encryption at rest", "impact": 10, "effort": "medium", "cost": 15000, "timeframe": "short_term"},
                {"name": "Deploy data classification", "impact": 8, "effort": "medium", "cost": 20000, "timeframe": "short_term"},
                {"name": "Implement backup verification", "impact": 7, "effort": "low", "cost": 5000, "timeframe": "quick_win"},
                {"name": "Enable audit logging", "impact": 5, "effort": "low", "cost": 3000, "timeframe": "quick_win"}
            ],
            "application": [
                {"name": "Implement SAST/DAST", "impact": 12, "effort": "high", "cost": 40000, "timeframe": "medium_term"},
                {"name": "Deploy WAF", "impact": 10, "effort": "medium", "cost": 25000, "timeframe": "short_term"},
                {"name": "Enable secure code training", "impact": 6, "effort": "low", "cost": 10000, "timeframe": "quick_win"},
                {"name": "Implement dependency scanning", "impact": 8, "effort": "low", "cost": 8000, "timeframe": "quick_win"},
                {"name": "Deploy API security", "impact": 9, "effort": "medium", "cost": 20000, "timeframe": "short_term"}
            ],
            "cloud": [
                {"name": "Enable CSPM", "impact": 12, "effort": "medium", "cost": 30000, "timeframe": "short_term"},
                {"name": "Implement cloud IAM best practices", "impact": 10, "effort": "medium", "cost": 15000, "timeframe": "short_term"},
                {"name": "Enable cloud logging", "impact": 6, "effort": "low", "cost": 5000, "timeframe": "quick_win"},
                {"name": "Deploy CWPP", "impact": 11, "effort": "high", "cost": 40000, "timeframe": "medium_term"},
                {"name": "Review cloud configurations", "impact": 8, "effort": "low", "cost": 5000, "timeframe": "quick_win"}
            ],
            "compliance": [
                {"name": "Complete gap assessment", "impact": 8, "effort": "medium", "cost": 15000, "timeframe": "short_term"},
                {"name": "Implement policy management", "impact": 7, "effort": "medium", "cost": 12000, "timeframe": "short_term"},
                {"name": "Enable compliance monitoring", "impact": 10, "effort": "high", "cost": 35000, "timeframe": "medium_term"},
                {"name": "Conduct regular audits", "impact": 6, "effort": "low", "cost": 8000, "timeframe": "quick_win"},
                {"name": "Security awareness training", "impact": 5, "effort": "low", "cost": 5000, "timeframe": "quick_win"}
            ]
        }
    
    def recommend(self, current_scores: Dict[str, float], metrics: List[Dict], 
                 budget: Optional[float] = None, timeframe: str = "short_term") -> Dict[str, Any]:
        """Generate prioritized recommendations"""
        recommendations = []
        
        # Identify weak categories
        weak_categories = [
            (cat, score) for cat, score in current_scores.items()
            if cat in self.improvements and score < 80
        ]
        weak_categories.sort(key=lambda x: x[1])
        
        # Get recommendations for each weak category
        for cat, score in weak_categories:
            cat_improvements = self.improvements.get(cat, [])
            
            for imp in cat_improvements:
                # Filter by timeframe
                timeframe_order = ["quick_win", "short_term", "medium_term", "long_term", "strategic"]
                if timeframe_order.index(imp["timeframe"]) <= timeframe_order.index(timeframe):
                    # Calculate ROI
                    roi = self._calculate_roi(imp, score)
                    
                    recommendations.append({
                        "category": cat,
                        "name": imp["name"],
                        "impact": imp["impact"],
                        "effort": imp["effort"],
                        "cost": imp["cost"],
                        "timeframe": imp["timeframe"],
                        "roi": roi,
                        "current_score": score,
                        "potential_score": min(100, score + imp["impact"])
                    })
        
        # Sort by ROI
        recommendations.sort(key=lambda x: x["roi"], reverse=True)
        
        # Filter by budget if provided
        if budget:
            recommendations = self._filter_by_budget(recommendations, budget)
        
        # Categorize recommendations
        quick_wins = [r for r in recommendations if r["timeframe"] == "quick_win"][:3]
        short_term = [r for r in recommendations if r["timeframe"] == "short_term"][:5]
        medium_term = [r for r in recommendations if r["timeframe"] == "medium_term"][:3]
        
        total_impact = sum(r["impact"] for r in recommendations[:10])
        total_cost = sum(r["cost"] for r in recommendations[:10])
        
        return {
            "recommendations": {
                "quick_wins": quick_wins,
                "short_term": short_term,
                "medium_term": medium_term
            },
            "all_recommendations": recommendations[:15],
            "summary": {
                "total_recommendations": len(recommendations),
                "potential_score_increase": total_impact,
                "estimated_investment": total_cost,
                "categories_addressed": len(set(r["category"] for r in recommendations))
            }
        }
    
    def prioritize_by_roi(self, current_scores: Dict[str, float], 
                         metrics: List[Dict], budget: Optional[float] = None) -> Dict[str, Any]:
        """Prioritize improvements by return on investment"""
        all_improvements = []
        
        for cat, score in current_scores.items():
            if cat not in self.improvements or score >= 95:
                continue
            
            for imp in self.improvements.get(cat, []):
                roi = self._calculate_roi(imp, score)
                all_improvements.append({
                    "category": cat,
                    "name": imp["name"],
                    "impact": imp["impact"],
                    "cost": imp["cost"],
                    "effort": imp["effort"],
                    "timeframe": imp["timeframe"],
                    "roi": roi,
                    "score_per_dollar": (imp["impact"] / max(imp["cost"], 1)) * 1000
                })
        
        # Sort by ROI
        all_improvements.sort(key=lambda x: x["roi"], reverse=True)
        
        # Select optimal set within budget
        if budget:
            selected = []
            remaining_budget = budget
            for imp in all_improvements:
                if imp["cost"] <= remaining_budget:
                    selected.append(imp)
                    remaining_budget -= imp["cost"]
            
            return {
                "selected_improvements": selected,
                "total_cost": budget - remaining_budget,
                "remaining_budget": remaining_budget,
                "total_impact": sum(i["impact"] for i in selected),
                "categories_covered": len(set(i["category"] for i in selected))
            }
        
        return {
            "prioritized_list": all_improvements[:20],
            "top_roi": all_improvements[:5],
            "quick_wins": [i for i in all_improvements if i["effort"] == "low"][:5]
        }
    
    def _calculate_roi(self, improvement: Dict, current_score: float) -> float:
        """Calculate ROI score for improvement"""
        # Base impact
        impact = improvement["impact"]
        cost = max(improvement["cost"], 1)
        
        # Adjust for current score (more impactful when score is lower)
        score_multiplier = 1 + (100 - current_score) / 100
        
        # Adjust for effort
        effort_factors = {"low": 1.5, "medium": 1.0, "high": 0.7, "very_high": 0.5}
        effort_multiplier = effort_factors.get(improvement["effort"], 1.0)
        
        # Adjust for timeframe
        timeframe_factors = {"quick_win": 1.5, "short_term": 1.2, "medium_term": 0.9, "long_term": 0.7, "strategic": 0.5}
        timeframe_multiplier = timeframe_factors.get(improvement["timeframe"], 1.0)
        
        # Calculate final ROI
        roi = (impact * score_multiplier * effort_multiplier * timeframe_multiplier) / (cost / 10000)
        
        return round(roi, 2)
    
    def _filter_by_budget(self, recommendations: List[Dict], budget: float) -> List[Dict]:
        """Filter recommendations within budget"""
        filtered = []
        remaining = budget
        
        for rec in recommendations:
            if rec["cost"] <= remaining:
                filtered.append(rec)
                remaining -= rec["cost"]
        
        return filtered
