"""Score calculation algorithms"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import statistics


class ScoreCalculator:
    """Calculate security scores from metrics"""
    
    def __init__(self):
        self.default_weights = {
            "network": 0.15,
            "endpoint": 0.15,
            "identity": 0.15,
            "data": 0.15,
            "application": 0.15,
            "cloud": 0.10,
            "compliance": 0.15
        }
        
        self.grade_thresholds = [
            (97, "A+"), (93, "A"), (90, "A-"),
            (87, "B+"), (83, "B"), (80, "B-"),
            (77, "C+"), (73, "C"), (70, "C-"),
            (60, "D"), (0, "F")
        ]
    
    def calculate(self, metrics: List[Any], weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Calculate overall security score"""
        if not metrics:
            return {"overall_score": 0, "grade": "F", "categories": {}}
        
        category_weights = weights or self.default_weights
        
        # Group metrics by category
        by_category = {}
        for metric in metrics:
            cat = metric.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(metric)
        
        # Calculate category scores
        category_scores = {}
        for cat, cat_metrics in by_category.items():
            scores = []
            total_weight = 0
            
            for m in cat_metrics:
                metric_score = self._calculate_metric_score(m)
                weight = m.weight or 1.0
                scores.append(metric_score * weight)
                total_weight += weight
            
            cat_score = sum(scores) / total_weight if total_weight > 0 else 0
            category_scores[cat] = {
                "score": round(cat_score, 1),
                "metrics_count": len(cat_metrics),
                "grade": self._get_grade(cat_score)
            }
        
        # Calculate overall score
        weighted_sum = 0
        total_weight = 0
        
        for cat, data in category_scores.items():
            weight = category_weights.get(cat, 0.1)
            weighted_sum += data["score"] * weight
            total_weight += weight
        
        overall_score = weighted_sum / total_weight if total_weight > 0 else 0
        
        return {
            "overall_score": round(overall_score, 1),
            "grade": self._get_grade(overall_score),
            "categories": category_scores,
            "metrics_analyzed": len(metrics),
            "coverage": len(category_scores) / len(self.default_weights)
        }
    
    def calculate_by_category(self, metrics: List[Any]) -> Dict[str, Any]:
        """Calculate detailed scores per category"""
        result = self.calculate(metrics)
        
        # Add detailed breakdown
        categories = {}
        by_category = {}
        
        for metric in metrics:
            cat = metric.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(metric)
        
        for cat, cat_metrics in by_category.items():
            metric_details = []
            for m in cat_metrics:
                score = self._calculate_metric_score(m)
                status = self._get_status(score)
                metric_details.append({
                    "name": m.name,
                    "value": m.value,
                    "score": round(score, 1),
                    "status": status,
                    "weight": m.weight or 1.0
                })
            
            categories[cat] = {
                "score": result["categories"].get(cat, {}).get("score", 0),
                "grade": result["categories"].get(cat, {}).get("grade", "F"),
                "metrics": metric_details,
                "issues": [m for m in metric_details if m["status"] in ["warning", "critical"]]
            }
        
        return {
            "overall": {
                "score": result["overall_score"],
                "grade": result["grade"]
            },
            "categories": categories
        }
    
    def analyze_trend(self, history: List[Dict], period_days: int = 30) -> Dict[str, Any]:
        """Analyze score trend over time"""
        if not history or len(history) < 2:
            return {
                "trend": "insufficient_data",
                "data_points": len(history) if history else 0
            }
        
        # Filter by period
        cutoff = datetime.now() - timedelta(days=period_days)
        relevant = []
        
        for h in history:
            if isinstance(h.get("date"), str):
                try:
                    date = datetime.fromisoformat(h["date"].replace("Z", "+00:00"))
                    if date.replace(tzinfo=None) >= cutoff:
                        relevant.append({"date": date, "score": h.get("score", 0)})
                except ValueError:
                    continue
            else:
                relevant.append(h)
        
        if len(relevant) < 2:
            return {
                "trend": "insufficient_data",
                "period_days": period_days,
                "data_points": len(relevant)
            }
        
        # Sort by date
        relevant.sort(key=lambda x: x["date"] if isinstance(x["date"], datetime) else x.get("date", ""))
        
        scores = [h["score"] for h in relevant]
        first_score = scores[0]
        last_score = scores[-1]
        change = last_score - first_score
        
        # Determine trend
        if change > 5:
            direction = "improving"
        elif change < -5:
            direction = "declining"
        else:
            direction = "stable"
        
        # Calculate velocity (change per day)
        days = max(1, (relevant[-1]["date"] - relevant[0]["date"]).days) if isinstance(relevant[0]["date"], datetime) else period_days
        velocity = change / days
        
        return {
            "trend": direction,
            "change": round(change, 1),
            "change_percent": round((change / max(first_score, 1)) * 100, 1),
            "velocity_per_day": round(velocity, 2),
            "statistics": {
                "first": first_score,
                "last": last_score,
                "average": round(statistics.mean(scores), 1),
                "min": min(scores),
                "max": max(scores),
                "std_dev": round(statistics.stdev(scores), 2) if len(scores) > 1 else 0
            },
            "data_points": len(relevant),
            "period_days": period_days
        }
    
    def predict_score(self, current_score: float, improvements: List[Dict], 
                     category_scores: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Predict future score after implementing improvements"""
        if not improvements:
            return {
                "current_score": current_score,
                "predicted_score": current_score,
                "change": 0,
                "confidence": 1.0
            }
        
        total_impact = 0
        confidence_factors = []
        
        for imp in improvements:
            # Base impact
            impact = imp.get("score_increase", imp.get("impact", {}).get("scoreIncrease", 2))
            
            # Adjust for effort level
            effort_multipliers = {
                "low": 1.0,
                "medium": 0.9,
                "high": 0.8,
                "very_high": 0.7
            }
            effort = imp.get("effort", {}).get("level", "medium")
            impact *= effort_multipliers.get(effort, 0.85)
            
            total_impact += impact
            
            # Confidence based on implementation status
            status = imp.get("status", "identified")
            status_confidence = {
                "identified": 0.5,
                "planned": 0.6,
                "in_progress": 0.8,
                "completed": 1.0
            }
            confidence_factors.append(status_confidence.get(status, 0.5))
        
        # Apply diminishing returns
        effective_impact = total_impact * (1 - total_impact / 200)
        predicted_score = min(100, current_score + effective_impact)
        
        # Calculate confidence
        avg_confidence = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.5
        final_confidence = avg_confidence * (0.9 ** (len(improvements) - 1))  # Decreases with more improvements
        
        return {
            "current_score": current_score,
            "predicted_score": round(predicted_score, 1),
            "change": round(predicted_score - current_score, 1),
            "raw_impact": round(total_impact, 1),
            "effective_impact": round(effective_impact, 1),
            "confidence": round(final_confidence, 2),
            "improvements_count": len(improvements)
        }
    
    def _calculate_metric_score(self, metric: Any) -> float:
        """Calculate score for a single metric"""
        value = metric.value
        good = metric.threshold_good or 80
        warning = metric.threshold_warning or 60
        critical = metric.threshold_critical or 40
        
        if value >= good:
            return 100
        elif value >= warning:
            return 70 + ((value - warning) / (good - warning)) * 30
        elif value >= critical:
            return 30 + ((value - critical) / (warning - critical)) * 40
        else:
            return max(0, (value / critical) * 30)
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        for threshold, grade in self.grade_thresholds:
            if score >= threshold:
                return grade
        return "F"
    
    def _get_status(self, score: float) -> str:
        """Get status based on score"""
        if score >= 80:
            return "good"
        elif score >= 60:
            return "warning"
        else:
            return "critical"
