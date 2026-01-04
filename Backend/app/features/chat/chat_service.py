import os
import json
from typing import List, Dict, Any
from google import genai
from google.genai import types
from datetime import datetime, timedelta

from app.features.dashboard.dashboard_repository import DashboardRepository
from app.features.parties.party_repository import PartyRepository
from app.features.vouchers.voucher_repository import VoucherRepository
from app.features.trips.trip_repository import TripRepository
from app.core.logger import logger
from app.core.config import settings

class ChatService:
    def __init__(self):
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
            
        self.client = genai.Client(api_key=api_key)
        
        # Define available tools/functions
        self.tools = {
            "get_monthly_sales": self._get_monthly_sales,
            "get_monthly_expenses": self._get_monthly_expenses,
            "get_inventory_status": self._get_inventory_status,
            "get_outstanding_balances": self._get_outstanding_balances,
            "get_fleet_status": self._get_fleet_status,
            "get_top_partners": self._get_top_partners,
            "search_parties": self._search_parties,
            "get_party_details": self._get_party_details,
            "get_recent_vouchers": self._get_recent_vouchers,
            "get_recent_trips": self._get_recent_trips
        }
        
        self.system_instruction = """You are the BlueStar Enterprise Assistant. Your job is to help users query data about their Trading and Transport business.

You have access to the following functions to retrieve real-time data:
- get_monthly_sales: Get sales summary for the current month.
- get_monthly_expenses: Get trip operating expenses for current month.
- get_inventory_status: Get items that are low on stock.
- get_outstanding_balances: Get total receivable and payable balances.
- get_fleet_status: Get current status of vehicles and drivers.
- get_top_partners: Get top customers and suppliers by balance.

NEW GRANULAR FUNCTIONS:
- search_parties(query: str): Search for customers or suppliers by name or phone.
- get_party_details(party_id: int): Get full details and balance for a specific party.
- get_recent_vouchers(voucher_type: str, limit: int): Get recent vouchers. voucher_type can be 'invoice', 'challan', 'bill', or 'quotation'.
- get_recent_trips(limit: int): Get most recent transport trips with status and basic income.

RULES:
1. ONLY provide information derived from these functions.
2. If you need data, call a function by responding with exactly: CALL_FUNCTION: function_name({"arg1": val1, ...})
3. If no arguments are needed, use: CALL_FUNCTION: function_name({})
4. Be professional, concise, and helpful."""

    async def _get_monthly_sales(self) -> str:
        """Gets the sales summary for the current month."""
        start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.now()
        stats = await DashboardRepository.get_sales_stats(start_date, end_date)
        return f"Total Sales Value for this month: ₹{stats['total_sales_amount']:,.2f}"

    async def _get_monthly_expenses(self) -> str:
        """Gets the trip operating expenses for the current month."""
        start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.now()
        stats = await DashboardRepository.get_trip_stats(start_date, end_date)
        total_exp = stats['total_diesel_cost'] + stats['total_toll_cost'] + stats['total_driver_cost']
        return (
            f"Trip Expenses for this month:\n"
            f"- Diesel: ₹{stats['total_diesel_cost']:,.2f}\n"
            f"- Toll: ₹{stats['total_toll_cost']:,.2f}\n"
            f"- Driver Allowance: ₹{stats['total_driver_cost']:,.2f}\n"
            f"Total Operating Expense: ₹{total_exp:,.2f}"
        )

    async def _get_inventory_status(self) -> str:
        """Gets items that are low on stock."""
        alerts = await DashboardRepository.get_inventory_alerts()
        if not alerts:
            return "All inventory levels are healthy."
        
        report = "Low Stock Alerts:\n"
        for item in alerts:
            report += f"- {item['name']}: Current {item['current_stock']} {item['unit']} (Min: {item['min_level']})\n"
        return report

    async def _get_outstanding_balances(self) -> str:
        """Gets the total receivable and payable balances."""
        balances = await DashboardRepository.get_outstanding_balance()
        return f"Total Receivable: ₹{balances['total_receivable']:,.2f}\nTotal Payable: ₹{balances['total_payable']:,.2f}"

    async def _get_fleet_status(self) -> str:
        """Gets the current status of the fleet."""
        fleet = await DashboardRepository.get_fleet_overview()
        v_stats = ", ".join([f"{k}: {v}" for k, v in fleet['vehicles'].items()]) if fleet['vehicles'] else "No vehicles"
        d_stats = ", ".join([f"{k}: {v}" for k, v in fleet['drivers'].items()]) if fleet['drivers'] else "No drivers"
        return f"Vehicles: {v_stats}\nDrivers: {d_stats}"

    async def _get_top_partners(self) -> str:
        """Gets the top customers and suppliers."""
        partners = await DashboardRepository.get_top_parties()
        cust = ", ".join([f"{p['name']} (₹{p['balance']:,.2f})" for p in partners['top_customers']]) if partners['top_customers'] else "None"
        supp = ", ".join([f"{p['name']} (₹{p['balance']:,.2f})" for p in partners['top_suppliers']]) if partners['top_suppliers'] else "None"
        return f"Top Customers: {cust}\nTop Suppliers: {supp}"

    async def _search_parties(self, query: str) -> str:
        """Searches for parties (customers/suppliers)."""
        parties = await PartyRepository.get_all(search=query, limit=5)
        if not parties:
            return f"No customers or suppliers found matching '{query}'."
        res = "Search Results:\n"
        for p in parties:
            res += f"- {p.name} (ID: {p.id}, Code: {p.code}, Type: {p.party_type})\n"
        return res

    async def _get_party_details(self, party_id: int) -> str:
        """Gets full details of a specific party."""
        p = await PartyRepository.get_by_id(party_id)
        if not p:
            return f"Party with ID {party_id} not found."
        return (
            f"Details for {p.name}:\n"
            f"- Code: {p.code}\n"
            f"- Type: {p.party_type}\n"
            f"- Contact: {p.phone or p.mobile or 'N/A'}\n"
            f"- GSTIN: {p.gstin or 'N/A'}\n"
            f"- Current Balance: ₹{p.current_balance:,.2f} ({'Receivable' if p.current_balance > 0 else 'Payable'})\n"
            f"- Address: {p.address_line_1}, {p.city}, {p.state}"
        )

    async def _get_recent_vouchers(self, voucher_type: str = None, limit: int = 5) -> str:
        """Gets recent vouchers of a certain type."""
        v_type = None
        if voucher_type:
            from app.features.vouchers.voucher_entity import VoucherType
            try:
                v_type = VoucherType(voucher_type.lower())
            except: pass
            
        vouchers = await VoucherRepository.get_all(limit=limit, voucher_type=v_type)
        if not vouchers:
            return "No recent vouchers found."
        
        res = f"Recent {voucher_type or 'Voucher'}s:\n"
        for v in vouchers:
            res += f"- #{v.voucher_number} | {v.voucher_date} | {v.grand_total:,.2f} | Status: {v.status}\n"
        return res

    async def _get_recent_trips(self, limit: int = 5) -> str:
        """Gets recent transport trips."""
        trips = await TripRepository.get_all(limit=limit)
        if not trips:
            return "No recent trips found."
        
        res = "Recent Trips:\n"
        for t in trips:
            res += f"- Trip ID: {t.id} | Vehicle: {t.vehicle_number or 'N/A'} | Start: {t.start_date.date()} | Revenue: ₹{t.freight_income:,.2f} | Status: {t.status}\n"
        return res

    async def get_response(self, message: str, history: List[Dict[str, str]] = []) -> str:
        """Get response from the AI assistant."""
        try:
            # Build conversation history
            contents = []
            
            # Add history
            for msg in history[-10:]:  # Keep last 10 messages for context
                role = "user" if msg['role'] == 'user' else "model"
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=msg['content'])]
                ))
            
            # Add current message
            contents.append(types.Content(
                role="user",
                parts=[types.Part(text=message)]
            ))
            
            # Use GenerateContentConfig for system instruction and model optimization
            config = types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.1,  # Lower temperature for more factual data responses
            )

            # Generate response using gemini-flash-lite-latest (Highest free-tier quota)
            response = self.client.models.generate_content(
                model='gemini-flash-lite-latest',
                contents=contents,
                config=config
            )
            
            response_text = response.text
            
            # Check if function call is needed
            if "CALL_FUNCTION:" in response_text:
                try:
                    # Parse "CALL_FUNCTION: function_name({"arg": val})"
                    parts = response_text.split("CALL_FUNCTION:")[1].strip().split("(", 1)
                    func_name = parts[0].strip()
                    args_str = parts[1].rsplit(")", 1)[0].strip()
                    args = json.loads(args_str) if args_str else {}
                    
                    if func_name in self.tools:
                        logger.info(f"Calling function: {func_name} with args: {args}")
                        func_result = await self.tools[func_name](**args)
                        
                        # Get final response with the data
                        follow_up_contents = contents + [
                            types.Content(
                                role="model",
                                parts=[types.Part(text=response_text)]
                            ),
                            types.Content(
                                role="user",
                                parts=[types.Part(text=f"Based on this data: {func_result}\n\nProvide a clear, helpful answer to the user's question: {message}")]
                            )
                        ]
                        
                        final_response = self.client.models.generate_content(
                            model='gemini-flash-lite-latest',
                            contents=follow_up_contents,
                            config=config
                        )
                        return final_response.text
                except Exception as ex:
                    logger.error(f"Failed to parse or execute function call: {str(ex)}")
                    return f"I tried to look that up but had trouble processing the data. (Error: {str(ex)})"
            
            return response_text
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str:
                logger.warning(f"Gemini Quota Exhausted: {error_str}")
                return "I've hit my usage limit (Quota Exhausted). Please wait a minute or ensure your API key has high-tier access enabled."
            
            logger.error(f"Error in ChatService: {error_str}")
            return f"I encountered an error while processing your request. Please try rephrasing your question."
