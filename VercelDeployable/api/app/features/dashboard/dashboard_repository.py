from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from app.core.database import SessionLocal
from app.features.vouchers.voucher_entity import TradeVoucher, VoucherType, VoucherStatus
from app.features.transactions.transaction_entity import Transaction, TransactionType
from app.features.trips.trip_entity import Trip
from app.features.parties.party_entity import Party
from app.core.logger import logger

class DashboardRepository:
    @staticmethod
    async def get_sales_stats(start_date: datetime, end_date: datetime):
        async with SessionLocal() as db:
            # 1. Total Sales (Issued Invoices)
            sales_query = select(
                func.sum(TradeVoucher.grand_total),
                func.count(TradeVoucher.id),
                func.avg(TradeVoucher.grand_total)
            ).where(
                and_(
                    TradeVoucher.voucher_type == VoucherType.INVOICE,
                    TradeVoucher.status == VoucherStatus.ISSUED,
                    TradeVoucher.voucher_date >= start_date.date(),
                    TradeVoucher.voucher_date <= end_date.date()
                )
            )
            sales_result = await db.execute(sales_query)
            total_sales, sales_count, avg_sales = sales_result.one()

            # 2. Total Purchases (Issued Bills)
            purchase_query = select(func.sum(TradeVoucher.grand_total)).where(
                and_(
                    TradeVoucher.voucher_type == VoucherType.BILL,
                    TradeVoucher.status == VoucherStatus.ISSUED,
                    TradeVoucher.voucher_date >= start_date.date(),
                    TradeVoucher.voucher_date <= end_date.date()
                )
            )
            purchase_result = await db.execute(purchase_query)
            total_purchases = purchase_result.scalar() or 0.0
            
            return {
                "total_sales_amount": total_sales or 0.0,
                "sales_count": sales_count or 0,
                "average_sales_value": float(avg_sales or 0.0),
                "total_purchase_amount": total_purchases
            }

    @staticmethod
    async def get_outstanding_balance():
        async with SessionLocal() as db:
            # Sum of all Party Curren Balances (Positive = Receivable, Negative = Payable)
            # Receivable
            query_rec = select(func.sum(Party.current_balance)).where(Party.current_balance > 0)
            result_rec = await db.execute(query_rec)
            receivable = result_rec.scalar() or 0.0
            
            # Payable
            query_pay = select(func.sum(Party.current_balance)).where(Party.current_balance < 0)
            result_pay = await db.execute(query_pay)
            payable = result_pay.scalar() or 0.0
            
            return {"total_receivable": receivable, "total_payable": abs(payable)}

    @staticmethod
    async def get_trip_stats(start_date: datetime, end_date: datetime):
        async with SessionLocal() as db:
            # Stats by status
            query_status = select(Trip.status, func.count(Trip.id)).where(
                and_(Trip.start_date >= start_date, Trip.start_date <= end_date)
            ).group_by(Trip.status)
            result_status = await db.execute(query_status)
            status_distribution = {row[0]: row[1] for row in result_status.all()}

            # Total Metrics
            query_metrics = select(
                func.count(Trip.id),
                func.sum(Trip.freight_income),
                func.sum(Trip.diesel_expense),
                func.sum(Trip.toll_expense),
                func.sum(Trip.driver_allowance)
            ).where(
                and_(Trip.start_date >= start_date, Trip.start_date <= end_date)
            )
            result_metrics = await db.execute(query_metrics)
            metrics = result_metrics.one_or_none()
            
            return {
                "trip_count": metrics[0] or 0, 
                "total_freight_revenue": metrics[1] or 0.0,
                "total_diesel_cost": metrics[2] or 0.0,
                "total_toll_cost": metrics[3] or 0.0,
                "total_driver_cost": metrics[4] or 0.0,
                "status_distribution": status_distribution
            }

    @staticmethod
    async def get_inventory_alerts():
        async with SessionLocal() as db:
            from app.features.inventory.inventory_entity import Item
            query = select(Item).where(Item.current_stock <= Item.min_stock_level)
            result = await db.execute(query)
            items = result.scalars().all()
            return [
                {"name": i.name, "current_stock": i.current_stock, "min_level": i.min_stock_level, "unit": i.unit}
                for i in items
            ]

    @staticmethod
    async def get_fleet_overview():
        async with SessionLocal() as db:
            from app.features.fleet.fleet_entity import Vehicle, Driver
            # Vehicles by status
            v_query = select(Vehicle.current_status, func.count(Vehicle.id)).group_by(Vehicle.current_status)
            v_result = await db.execute(v_query)
            v_stats = {row[0]: row[1] for row in v_result.all()}

            # Drivers by status
            d_query = select(Driver.status, func.count(Driver.id)).group_by(Driver.status)
            d_result = await db.execute(d_query)
            d_stats = {row[0]: row[1] for row in d_result.all()}

            return {"vehicles": v_stats, "drivers": d_stats}

    @staticmethod
    async def get_top_parties(limit: int = 5):
        async with SessionLocal() as db:
            # Top Customers by Receivable
            query_top_cust = select(Party.name, Party.current_balance).where(Party.current_balance > 0).order_by(Party.current_balance.desc()).limit(limit)
            result_cust = await db.execute(query_top_cust)
            top_customers = [{"name": row[0], "balance": row[1]} for row in result_cust.all()]

            # Top Suppliers by Payable
            query_top_supp = select(Party.name, Party.current_balance).where(Party.current_balance < 0).order_by(Party.current_balance.asc()).limit(limit)
            result_supp = await db.execute(query_top_supp)
            top_suppliers = [{"name": row[0], "balance": abs(row[1])} for row in result_supp.all()]

            return {"top_customers": top_customers, "top_suppliers": top_suppliers}

    @staticmethod
    async def get_revenue_trends(days: int = 30):
        async with SessionLocal() as db:
            start_date = datetime.now() - timedelta(days=days)
            # Group invoices by date
            query = select(
                TradeVoucher.voucher_date,
                func.sum(TradeVoucher.grand_total)
            ).where(
                and_(
                    TradeVoucher.voucher_type == VoucherType.INVOICE,
                    TradeVoucher.status == VoucherStatus.ISSUED,
                    TradeVoucher.voucher_date >= start_date.date()
                )
            ).group_by(TradeVoucher.voucher_date).order_by(TradeVoucher.voucher_date)
            
            result = await db.execute(query)
            return [{"date": str(row[0]), "amount": row[1]} for row in result.all()]
