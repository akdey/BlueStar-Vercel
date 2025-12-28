from datetime import datetime, timedelta
from app.features.dashboard.dashboard_schema import DashboardChart, ChartDataPoint
from app.features.dashboard.dashboard_repository import DashboardRepository

class DashboardService:
    @staticmethod
    async def get_analytics_charts(period: str = "month"):
        now = datetime.now()
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            trend_days = 1
        elif period == "week":
            start_date = now - timedelta(days=7)
            trend_days = 7
        else: # month
            start_date = now - timedelta(days=30)
            trend_days = 30
            
        end_date = now
        
        # Fetch data from repository
        trip_stats = await DashboardRepository.get_trip_stats(start_date, end_date)
        revenue_trends = await DashboardRepository.get_revenue_trends(trend_days)
        top_parties = await DashboardRepository.get_top_parties()
        fleet_overview = await DashboardRepository.get_fleet_overview()

        charts = {}

        # 1. Revenue Trend Chart (Area/Line)
        charts["revenue_trend"] = DashboardChart(
            chart_type="area",
            title="Revenue Trend",
            data=[ChartDataPoint(label=item["date"], value=item["amount"]) for item in revenue_trends]
        )

        # 2. Trip Status Distribution (Doughnut)
        charts["trip_status"] = DashboardChart(
            chart_type="doughnut",
            title="Trip Status Breakdown",
            data=[ChartDataPoint(label=status, value=count) for status, count in trip_stats["status_distribution"].items()]
        )

        # 3. Expense Breakdown (Pie)
        charts["expense_breakdown"] = DashboardChart(
            chart_type="pie",
            title="Trip Expense Distribution",
            data=[
                ChartDataPoint(label="Fuel (Diesel)", value=trip_stats["total_diesel_cost"]),
                ChartDataPoint(label="Toll", value=trip_stats["total_toll_cost"]),
                ChartDataPoint(label="Driver Allowance", value=trip_stats["total_driver_cost"]),
            ]
        )

        # 4. Top Customers (Bar)
        charts["top_customers"] = DashboardChart(
            chart_type="bar",
            title="Top Customers by Balance",
            data=[ChartDataPoint(label=item["name"], value=item["balance"]) for item in top_parties["top_customers"]]
        )

        # 5. Vehicle Availability (Pie)
        charts["fleet_availability"] = DashboardChart(
            chart_type="pie",
            title="Fleet Status Overview",
            data=[ChartDataPoint(label=status, value=count) for status, count in fleet_overview["vehicles"].items()]
        )

        return charts

    @staticmethod
    async def get_overview_stats(period: str = "month"):
        # Define Time Range
        now = datetime.now()
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            trend_days = 1
        elif period == "week":
            start_date = now - timedelta(days=7)
            trend_days = 7
        else: # month
            start_date = now - timedelta(days=30)
            trend_days = 30
            
        end_date = now
        
        # 1. basic financial stats
        sales_data = await DashboardRepository.get_sales_stats(start_date, end_date)
        balance_data = await DashboardRepository.get_outstanding_balance()
        
        # 2. Comprehensive Trip Stats
        trip_data = await DashboardRepository.get_trip_stats(start_date, end_date)
        
        # 3. New Insights
        inventory_alerts = await DashboardRepository.get_inventory_alerts()
        fleet_overview = await DashboardRepository.get_fleet_overview()
        top_parties = await DashboardRepository.get_top_parties()
        revenue_trends = await DashboardRepository.get_revenue_trends(trend_days)
        
        # Calculations
        total_trip_expense = (
            trip_data["total_diesel_cost"] + 
            trip_data["total_toll_cost"] + 
            trip_data["total_driver_cost"]
        )
        
        gross_trading_revenue = sales_data["total_sales_amount"]
        gross_purchases = sales_data["total_purchase_amount"]
        trip_revenue = trip_data["total_freight_revenue"]
        
        # Consolidated Business Net Income
        # (Trading Sales + Transport Rev) - (Operating Costs + Stock Purchase Costs)
        business_net_income = (gross_trading_revenue + trip_revenue) - (total_trip_expense + gross_purchases)
        
        return {
            "period": period,
            "financial_summary": {
                "sales_revenue": gross_trading_revenue,
                "purchase_costs": gross_purchases,
                "total_receivable": balance_data["total_receivable"],
                "total_payable": balance_data["total_payable"],
                "estimated_cash_flow": balance_data["total_receivable"] - balance_data["total_payable"],
                "business_net_income": business_net_income,
                "sales_count": sales_data["sales_count"],
                "avg_sale_value": sales_data["average_sales_value"]
            },
            "logistics_performance": {
                "total_trips": trip_data["trip_count"],
                "status_breakdown": trip_data["status_distribution"],
                "freight_revenue": trip_revenue,
                "operating_expenses": {
                    "fuel": trip_data["total_diesel_cost"],
                    "toll": trip_data["total_toll_cost"],
                    "driver_allowance": trip_data["total_driver_cost"],
                    "total": total_trip_expense
                }
            },
            "fleet_status": fleet_overview,
            "inventory_health": {
                "low_stock_count": len(inventory_alerts),
                "alerts": inventory_alerts
            },
            "top_partners": top_parties,
            "charts": {
                "revenue_trend": revenue_trends
            }
        }
