from app.features.vouchers.voucher_entity import TradeVoucher, VoucherType
from app.features.parties.party_entity import Party
from app.core.email_utils import EmailUtil
from app.features.inventory.inventory_repository import InventoryRepository
from app.core.logger import logger
from datetime import datetime

class VoucherEmailService:
    @staticmethod
    async def send_voucher_email(voucher: TradeVoucher, party: Party):
        """
        Drafts and sends a professional HTML email for a Trade Voucher.
        """
        if not party.email:
            logger.warning(f"No email address found for party {party.name}. Skipping email.")
            return

        subject = f"Trade Voucher: {voucher.voucher_type.value.upper()} #{voucher.voucher_number} - BlueStar Trading"
        
        # Build Item Rows for the HTML Table
        item_rows = ""
        for item in voucher.items:
            # Get real item name
            inv_item = await InventoryRepository.get_item_by_id(item.item_id)
            item_name = inv_item.name if inv_item else f"Item #{item.item_id}"
            
            item_rows += f"""
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">{item_name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">{int(item.quantity)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹{item.rate:,.2f}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹{item.amount:,.2f}</td>
                </tr>
            """

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <div style="background: #1a237e; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">BLUE STAR</h1>
                    <p style="margin: 0; font-style: italic; opacity: 0.8;">Trading & Transport Solutions</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px;">
                    <p>Dear <strong>{party.name}</strong>,</p>
                    <p>Please find the details of the <strong>{voucher.voucher_type.value.upper()}</strong> issued to you today.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
                        <table width="100%">
                            <tr>
                                <td><strong>Voucher No:</strong> {voucher.voucher_number}</td>
                                <td align="right"><strong>Date:</strong> {voucher.voucher_date}</td>
                            </tr>
                            <tr>
                                <td><strong>Type:</strong> {voucher.voucher_type.value.capitalize()}</td>
                                <td align="right"><strong>Status:</strong> ISSUED</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Items Table -->
                    <table width="100%" style="border-collapse: collapse; margin-bottom: 25px;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #1a237e;">Description</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #1a237e;">Qty</th>
                                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a237e;">Rate</th>
                                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a237e;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item_rows}
                        </tbody>
                    </table>

                    <!-- Financials -->
                    <div style="text-align: right; border-top: 2px solid #eee; padding-top: 15px;">
                        <table width="100%">
                            <tr>
                                <td align="right" style="padding: 5px;">Subtotal:</td>
                                <td align="right" style="padding: 5px; width: 120px;">₹{voucher.total_amount:,.2f}</td>
                            </tr>
                            <tr>
                                <td align="right" style="padding: 5px;">Tax (GST):</td>
                                <td align="right" style="padding: 5px;">₹{voucher.tax_amount:,.2f}</td>
                            </tr>
                            <tr style="font-size: 18px; font-weight: bold; color: #1a237e;">
                                <td align="right" style="padding: 10px;">Grand Total:</td>
                                <td align="right" style="padding: 10px;">₹{voucher.grand_total:,.2f}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="margin-top: 30px;">Thank you for your business!</p>
                </div>

                <!-- Footer -->
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 5px 0;">BlueStar Trading & Transport</p>
                    <p style="margin: 5px 0;">This is an auto-generated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailUtil.send_email(party.email, subject, html_content)
        logger.info(f"Voucher email scheduled for {party.email}")
