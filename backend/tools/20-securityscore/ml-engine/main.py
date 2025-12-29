"""
SecurityScore ML Engine
Port: 8020
AI-powered security scoring and analytics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uvicorn

from models.score_calculator import ScoreCalculator
from models.benchmark_analyzer import BenchmarkAnalyzer
from models.improvement_recommender import ImprovementRecommender

app = FastAPI(
    title="SecurityScore ML Engine",
    version="1.0.0",
    description="AI-powered security scoring and analytics"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
score_calculator = ScoreCalculator()
benchmark_analyzer = BenchmarkAnalyzer()
improvement_recommender = ImprovementRecommender()


class MetricData(BaseModel):
    name: str
    category: str
    value: float
    weight: Optional[float] = 1.0
    threshold_good: Optional[float] = 80
    threshold_warning: Optional[float] = 60
    threshold_critical: Optional[float] = 40


class ScoreRequest(BaseModel):
    metrics: List[MetricData]
    weights: Optional[Dict[str, float]] = None


class BenchmarkRequest(BaseModel):
    scores: Dict[str, float]
    industry: str
    size: Optional[str] = "medium"


class ImprovementRequest(BaseModel):
    current_scores: Dict[str, float]
    metrics: List[Dict[str, Any]]
    budget: Optional[float] = None
    timeframe: Optional[str] = "short_term"


class TrendRequest(BaseModel):
    history: List[Dict[str, Any]]
    period_days: Optional[int] = 30


class PredictionRequest(BaseModel):
    current_score: float
    improvements: List[Dict[str, Any]]
    category_scores: Optional[Dict[str, float]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SecurityScore ML Engine",
        "version": "1.0.0"
    }


@app.post("/calculate/score")
async def calculate_score(request: ScoreRequest):
    """Calculate overall security score from metrics"""
    try:
        result = score_calculator.calculate(request.metrics, request.weights)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate/category")
async def calculate_category_scores(request: ScoreRequest):
    """Calculate scores for each security category"""
    try:
        result = score_calculator.calculate_by_category(request.metrics)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/benchmark")
async def analyze_benchmark(request: BenchmarkRequest):
    """Compare scores against industry benchmarks"""
    try:
        result = benchmark_analyzer.compare(
            request.scores,
            request.industry,
            request.size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/benchmarks/{industry}")
async def get_industry_benchmark(industry: str, size: str = "medium"):
    """Get benchmark data for an industry"""
    try:
        benchmark = benchmark_analyzer.get_benchmark(industry, size)
        return benchmark
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/improvements")
async def recommend_improvements(request: ImprovementRequest):
    """Get prioritized improvement recommendations"""
    try:
        recommendations = improvement_recommender.recommend(
            request.current_scores,
            request.metrics,
            request.budget,
            request.timeframe
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/gaps")
async def analyze_gaps(request: BenchmarkRequest):
    """Identify gaps compared to benchmarks"""
    try:
        gaps = benchmark_analyzer.identify_gaps(
            request.scores,
            request.industry,
            request.size
        )
        return gaps
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/trend")
async def analyze_trend(request: TrendRequest):
    """Analyze score trend over time"""
    try:
        result = score_calculator.analyze_trend(
            request.history,
            request.period_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/score")
async def predict_future_score(request: PredictionRequest):
    """Predict future score after improvements"""
    try:
        prediction = score_calculator.predict_score(
            request.current_score,
            request.improvements,
            request.category_scores
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/prioritize/improvements")
async def prioritize_improvements(request: ImprovementRequest):
    """Prioritize improvements by ROI"""
    try:
        prioritized = improvement_recommender.prioritize_by_roi(
            request.current_scores,
            request.metrics,
            request.budget
        )
        return prioritized
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
async def get_categories():
    """Get security categories with weights"""
    return {
        "categories": [
            {"name": "network", "weight": 0.15, "description": "Network security controls"},
            {"name": "endpoint", "weight": 0.15, "description": "Endpoint protection"},
            {"name": "identity", "weight": 0.15, "description": "Identity and access management"},
            {"name": "data", "weight": 0.15, "description": "Data protection"},
            {"name": "application", "weight": 0.15, "description": "Application security"},
            {"name": "cloud", "weight": 0.10, "description": "Cloud security"},
            {"name": "compliance", "weight": 0.15, "description": "Compliance status"}
        ]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8020)
