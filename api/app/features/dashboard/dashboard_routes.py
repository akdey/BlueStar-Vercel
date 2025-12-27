from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.dashboard.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/overview")
async def get_dashboard_overview(period: str = "month"):
    """
    Get high-level business stats.
    Period options: 'today', 'week', 'month'.
    """
    data = await DashboardService.get_overview_stats(period)
    return JSONResponse(
        content={
            "success": True,
            "message": "Dashboard data retrieved",
            "data": data
        },
        headers={"Cache-Control": "no-cache"}
    )

@router.get("/charts")
async def get_dashboard_charts(period: str = "month"):
    """
    Get structured chart data for frontend visualization.
    Returns data mapped to Chart JS / Recharts compatible structures.
    """
    charts = await DashboardService.get_analytics_charts(period)
    # Convert Pydantic models to dict for JSONResponse
    charts_dump = {k: v.model_dump() for k, v in charts.items()}
    return JSONResponse(
        content={
            "success": True,
            "message": "Analytics charts retrieved",
            "data": charts_dump
        },
        headers={"Cache-Control": "no-cache"}
    )
