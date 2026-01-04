from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChartDataPoint(BaseModel):
    label: str
    value: float
    meta: Optional[Dict[str, Any]] = None

class DashboardChart(BaseModel):
    chart_type: str  # 'line', 'bar', 'pie', 'doughnut', 'area'
    title: str
    data: List[ChartDataPoint]

class AnalyticsChartsResponse(BaseModel):
    success: bool
    charts: Dict[str, DashboardChart]
