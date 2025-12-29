"""Benchmark analysis and comparison"""

from typing import Dict, Any, List


class BenchmarkAnalyzer:
    """Analyze and compare against industry benchmarks"""
    
    def __init__(self):
        # Industry benchmarks (simulated data based on industry research)
        self.benchmarks = {
            "finance": {
                "small": {"overall": 75, "network": 78, "endpoint": 76, "identity": 82, "data": 80, "application": 72, "cloud": 70, "compliance": 85},
                "medium": {"overall": 80, "network": 82, "endpoint": 80, "identity": 85, "data": 84, "application": 78, "cloud": 76, "compliance": 88},
                "large": {"overall": 85, "network": 87, "endpoint": 85, "identity": 90, "data": 88, "application": 83, "cloud": 82, "compliance": 92},
                "enterprise": {"overall": 88, "network": 90, "endpoint": 88, "identity": 93, "data": 91, "application": 86, "cloud": 85, "compliance": 95}
            },
            "healthcare": {
                "small": {"overall": 72, "network": 70, "endpoint": 68, "identity": 75, "data": 80, "application": 65, "cloud": 65, "compliance": 82},
                "medium": {"overall": 78, "network": 76, "endpoint": 75, "identity": 80, "data": 85, "application": 72, "cloud": 72, "compliance": 87},
                "large": {"overall": 82, "network": 80, "endpoint": 80, "identity": 85, "data": 88, "application": 78, "cloud": 78, "compliance": 90},
                "enterprise": {"overall": 86, "network": 85, "endpoint": 84, "identity": 88, "data": 92, "application": 82, "cloud": 82, "compliance": 93}
            },
            "technology": {
                "small": {"overall": 78, "network": 80, "endpoint": 75, "identity": 78, "data": 76, "application": 82, "cloud": 80, "compliance": 70},
                "medium": {"overall": 82, "network": 84, "endpoint": 80, "identity": 82, "data": 80, "application": 86, "cloud": 85, "compliance": 75},
                "large": {"overall": 86, "network": 88, "endpoint": 85, "identity": 86, "data": 84, "application": 90, "cloud": 88, "compliance": 80},
                "enterprise": {"overall": 90, "network": 92, "endpoint": 88, "identity": 90, "data": 88, "application": 93, "cloud": 92, "compliance": 85}
            },
            "retail": {
                "small": {"overall": 65, "network": 68, "endpoint": 62, "identity": 65, "data": 70, "application": 60, "cloud": 58, "compliance": 68},
                "medium": {"overall": 72, "network": 75, "endpoint": 70, "identity": 72, "data": 76, "application": 68, "cloud": 65, "compliance": 75},
                "large": {"overall": 78, "network": 80, "endpoint": 76, "identity": 78, "data": 82, "application": 75, "cloud": 72, "compliance": 80},
                "enterprise": {"overall": 82, "network": 85, "endpoint": 80, "identity": 82, "data": 86, "application": 80, "cloud": 78, "compliance": 85}
            },
            "manufacturing": {
                "small": {"overall": 60, "network": 65, "endpoint": 58, "identity": 60, "data": 55, "application": 55, "cloud": 50, "compliance": 65},
                "medium": {"overall": 68, "network": 72, "endpoint": 66, "identity": 68, "data": 64, "application": 62, "cloud": 58, "compliance": 72},
                "large": {"overall": 74, "network": 78, "endpoint": 72, "identity": 75, "data": 70, "application": 70, "cloud": 66, "compliance": 78},
                "enterprise": {"overall": 80, "network": 84, "endpoint": 78, "identity": 80, "data": 76, "application": 76, "cloud": 72, "compliance": 84}
            },
            "government": {
                "small": {"overall": 70, "network": 72, "endpoint": 68, "identity": 75, "data": 72, "application": 65, "cloud": 55, "compliance": 80},
                "medium": {"overall": 76, "network": 78, "endpoint": 74, "identity": 80, "data": 78, "application": 72, "cloud": 62, "compliance": 85},
                "large": {"overall": 82, "network": 84, "endpoint": 80, "identity": 85, "data": 84, "application": 78, "cloud": 70, "compliance": 90},
                "enterprise": {"overall": 86, "network": 88, "endpoint": 85, "identity": 90, "data": 88, "application": 82, "cloud": 75, "compliance": 93}
            },
            "general": {
                "small": {"overall": 65, "network": 68, "endpoint": 62, "identity": 65, "data": 64, "application": 60, "cloud": 58, "compliance": 68},
                "medium": {"overall": 72, "network": 75, "endpoint": 70, "identity": 72, "data": 72, "application": 68, "cloud": 66, "compliance": 75},
                "large": {"overall": 78, "network": 80, "endpoint": 76, "identity": 78, "data": 78, "application": 75, "cloud": 73, "compliance": 80},
                "enterprise": {"overall": 84, "network": 86, "endpoint": 82, "identity": 84, "data": 84, "application": 80, "cloud": 78, "compliance": 86}
            }
        }
        
        # Percentile data (based on score distributions)
        self.percentiles = {
            "p25": 55,
            "p50": 70,
            "p75": 82,
            "p90": 90,
            "p95": 94
        }
    
    def get_benchmark(self, industry: str, size: str = "medium") -> Dict[str, Any]:
        """Get benchmark for industry and size"""
        industry = industry.lower()
        size = size.lower()
        
        if industry not in self.benchmarks:
            industry = "general"
        
        if size not in self.benchmarks[industry]:
            size = "medium"
        
        return {
            "industry": industry,
            "size": size,
            "scores": self.benchmarks[industry][size],
            "percentiles": self.percentiles
        }
    
    def compare(self, scores: Dict[str, float], industry: str, size: str = "medium") -> Dict[str, Any]:
        """Compare scores against industry benchmark"""
        benchmark = self.get_benchmark(industry, size)
        benchmark_scores = benchmark["scores"]
        
        categories = ["network", "endpoint", "identity", "data", "application", "cloud", "compliance"]
        
        comparison = {
            "overall": self._compare_score(
                scores.get("overall", 0),
                benchmark_scores["overall"]
            ),
            "categories": {},
            "summary": {
                "above_benchmark": 0,
                "at_benchmark": 0,
                "below_benchmark": 0
            }
        }
        
        for cat in categories:
            your_score = scores.get(cat, 0)
            bench_score = benchmark_scores.get(cat, 70)
            
            cat_comparison = self._compare_score(your_score, bench_score)
            comparison["categories"][cat] = cat_comparison
            
            if cat_comparison["difference"] > 5:
                comparison["summary"]["above_benchmark"] += 1
            elif cat_comparison["difference"] < -5:
                comparison["summary"]["below_benchmark"] += 1
            else:
                comparison["summary"]["at_benchmark"] += 1
        
        # Calculate percentile
        overall = scores.get("overall", 0)
        comparison["overall"]["percentile"] = self._calculate_percentile(overall)
        
        # Recommendations
        comparison["recommendations"] = self._generate_recommendations(
            scores, benchmark_scores, categories
        )
        
        comparison["benchmark"] = {
            "industry": industry,
            "size": size
        }
        
        return comparison
    
    def identify_gaps(self, scores: Dict[str, float], industry: str, size: str = "medium") -> Dict[str, Any]:
        """Identify security gaps compared to benchmark"""
        benchmark = self.get_benchmark(industry, size)
        benchmark_scores = benchmark["scores"]
        
        gaps = []
        opportunities = []
        
        categories = ["network", "endpoint", "identity", "data", "application", "cloud", "compliance"]
        
        for cat in categories:
            your_score = scores.get(cat, 0)
            bench_score = benchmark_scores.get(cat, 70)
            diff = your_score - bench_score
            
            if diff < -10:
                gaps.append({
                    "category": cat,
                    "your_score": your_score,
                    "benchmark": bench_score,
                    "gap": abs(diff),
                    "severity": "critical" if diff < -20 else "high",
                    "priority": 1 if diff < -20 else 2,
                    "recommendation": f"Urgent attention needed for {cat} security"
                })
            elif diff < -5:
                gaps.append({
                    "category": cat,
                    "your_score": your_score,
                    "benchmark": bench_score,
                    "gap": abs(diff),
                    "severity": "medium",
                    "priority": 3,
                    "recommendation": f"Improve {cat} security to meet industry standards"
                })
            elif diff > 10:
                opportunities.append({
                    "category": cat,
                    "your_score": your_score,
                    "benchmark": bench_score,
                    "advantage": diff,
                    "note": f"Strong performance in {cat} - above industry average"
                })
        
        # Sort gaps by priority
        gaps.sort(key=lambda x: x["priority"])
        
        return {
            "gaps": gaps,
            "opportunities": opportunities,
            "summary": {
                "critical_gaps": len([g for g in gaps if g["severity"] == "critical"]),
                "high_gaps": len([g for g in gaps if g["severity"] == "high"]),
                "medium_gaps": len([g for g in gaps if g["severity"] == "medium"]),
                "strengths": len(opportunities)
            },
            "overall_position": self._assess_position(scores.get("overall", 0), benchmark_scores["overall"])
        }
    
    def _compare_score(self, your_score: float, benchmark: float) -> Dict[str, Any]:
        """Compare single score against benchmark"""
        diff = your_score - benchmark
        
        if diff > 10:
            status = "significantly_above"
        elif diff > 5:
            status = "above"
        elif diff > -5:
            status = "at_benchmark"
        elif diff > -10:
            status = "below"
        else:
            status = "significantly_below"
        
        return {
            "your_score": your_score,
            "benchmark": benchmark,
            "difference": round(diff, 1),
            "status": status
        }
    
    def _calculate_percentile(self, score: float) -> int:
        """Calculate percentile based on score"""
        if score >= self.percentiles["p95"]:
            return 95
        elif score >= self.percentiles["p90"]:
            return 90
        elif score >= self.percentiles["p75"]:
            return 75
        elif score >= self.percentiles["p50"]:
            return 50
        elif score >= self.percentiles["p25"]:
            return 25
        else:
            return 10
    
    def _generate_recommendations(self, scores: Dict[str, float], 
                                  benchmark: Dict[str, float], 
                                  categories: List[str]) -> List[Dict[str, Any]]:
        """Generate recommendations based on gaps"""
        recommendations = []
        
        below_benchmark = [
            (cat, scores.get(cat, 0), benchmark.get(cat, 70))
            for cat in categories
            if scores.get(cat, 0) < benchmark.get(cat, 70)
        ]
        
        # Sort by gap size
        below_benchmark.sort(key=lambda x: x[1] - x[2])
        
        for cat, your_score, bench_score in below_benchmark[:3]:
            gap = bench_score - your_score
            recommendations.append({
                "category": cat,
                "action": f"Improve {cat} security",
                "current": your_score,
                "target": bench_score,
                "gap": round(gap, 1),
                "priority": "high" if gap > 15 else "medium"
            })
        
        return recommendations
    
    def _assess_position(self, score: float, benchmark: float) -> str:
        """Assess overall market position"""
        diff = score - benchmark
        if diff > 15:
            return "Industry Leader"
        elif diff > 5:
            return "Above Average"
        elif diff > -5:
            return "At Industry Average"
        elif diff > -15:
            return "Below Average"
        else:
            return "Needs Significant Improvement"
