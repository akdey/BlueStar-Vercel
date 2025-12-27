import os
import json
from typing import List, Dict, Any
from google import genai
from google.genai import types
from datetime import datetime, timedelta

from app.features.dashboard.dashboard_repository import DashboardRepository
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
            "get_top_partners": self._get_top_partners
        }
        
        self.system_prompt = """You are the BlueStar Enterprise Assistant. Your job is to help users query data about their Trading and Transport business.

You have access to the following functions to retrieve real-time data:
- get_monthly_sales: Get sales summary for the current month
- get_monthly_expenses: Get trip operating expenses (fuel, toll, driver) for current month
- get_inventory_status: Get items that are low on stock
- get_outstanding_balances: Get total receivable and payable balances
- get_fleet_status: Get current status of vehicles and drivers
- get_top_partners: Get top customers and suppliers by balance

RULES:
1. ONLY provide information derived from these functions
2. DO NOT provide outside general knowledge or information not in the system
3. If asked for something you cannot answer with available functions, politely say you don't have access to that data yet
4. Be professional, concise, and helpful
5. When you need data, call the appropriate function

When responding, if you need to call a function, respond with: CALL_FUNCTION: function_name"""

    async def _get_monthly_sales(self) -> str:
        """Gets the sales summary for the current month."""
        start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.now()
        stats = await DashboardRepository.get_sales_stats(start_date, end_date)
        return f"Total Sales Value for this month: ₹{stats['total_sales_value']:,.2f}"

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
            
            # Add system prompt and current message
            full_prompt = f"{self.system_prompt}\n\nUser: {message}"
            contents.append(types.Content(
                role="user",
                parts=[types.Part(text=full_prompt)]
            ))
            
            # Generate response using gemini-pro-latest
            response = self.client.models.generate_content(
                model='gemini-pro-latest',
                contents=contents
            )
            
            response_text = response.text
            
            # Check if function call is needed
            if "CALL_FUNCTION:" in response_text:
                func_name = response_text.split("CALL_FUNCTION:")[1].strip().split()[0]
                if func_name in self.tools:
                    logger.info(f"Calling function: {func_name}")
                    func_result = await self.tools[func_name]()
                    
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
                        model='gemini-pro-latest',
                        contents=follow_up_contents
                    )
                    return final_response.text
            
            return response_text
            
        except Exception as e:
            logger.error(f"Error in ChatService: {str(e)}")
            return f"I encountered an error while processing your request. Please try rephrasing your question."
