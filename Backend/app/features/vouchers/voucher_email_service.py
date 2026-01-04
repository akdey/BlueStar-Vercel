from app.features.vouchers.voucher_entity import TradeVoucher, VoucherType, VoucherStatus
from app.features.parties.party_entity import Party
from app.core.email_utils import EmailUtil
from app.features.inventory.inventory_repository import InventoryRepository
from app.core.config import settings
from app.core.logger import logger
from datetime import datetime
from typing import Optional

class VoucherEmailService:
    @staticmethod
    async def send_voucher_email(voucher: TradeVoucher, party: Party, approver_name: Optional[str] = None):
        """
        Drafts and sends a professional HTML email for a Trade Voucher,
        matching the design of the PrintableVoucher component.
        """
        if not party.email:
            logger.warning(f"No email address found for party {party.name}. Skipping email.")
            return

        # 1. Determine Theme based on Voucher Type (Matching React logic)
        v_type = voucher.voucher_type
        if v_type == VoucherType.INVOICE:
            primary_color = "#0f172a"  # Slate 900
            accent_color = "#2563eb"   # Blue 600
            border_color = "#2563eb"
            light_bg = "#eff6ff"       # Blue 50
            label = "Tax Invoice"
        elif v_type == VoucherType.CHALLAN:
            primary_color = "#d97706"  # Amber 600
            accent_color = "#d97706"
            border_color = "#d97706"
            light_bg = "#fffbeb"       # Amber 50
            label = "Delivery Challan"
        elif v_type == VoucherType.QUOTATION:
            primary_color = "#059669"  # Emerald 600
            accent_color = "#059669"
            border_color = "#059669"
            light_bg = "#ecfdf5"       # Emerald 50
            label = "Quotation / Estimate"
        else:
            primary_color = "#1e293b"  # Slate 800
            accent_color = "#475569"   # Slate 600
            border_color = "#1e293b"
            light_bg = "#f8fafc"       # Slate 50
            label = str(v_type.value).capitalize() if v_type else "Voucher"

        subject = f"{label}: {voucher.voucher_number} - BlueStar Trading"
        is_draft = voucher.status == VoucherStatus.DRAFT

        # 2. Build Item Rows
        item_rows = ""
        for item in voucher.items:
            # Get real item name
            inv_item = await InventoryRepository.get_item_by_id(item.item_id)
            item_name = inv_item.name if inv_item else f"Item #{item.item_id}"
            
            tax_rate = item.tax_rate or 0
            tax_amt = (item.amount * tax_rate) / 100
            
            item_rows += f"""
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 16px;">
                        <div style="font-weight: bold; color: #0f172a;">{item_name}</div>
                        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">Code: {item.item_id}</div>
                    </td>
                    <td style="padding: 12px 16px; text-align: center; color: #475569;">{int(item.quantity)}</td>
                    <td style="padding: 12px 16px; text-align: right; color: #64748b;">₹{item.rate:,.2f}</td>
                    <td style="padding: 12px 16px; text-align: right; color: #64748b;">
                        <div style="font-size: 11px; color: #0f172a;">₹{tax_amt:,.2f}</div>
                        <div style="font-size: 9px; color: #94a3b8;">({tax_rate}%)</div>
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: bold; color: #0f172a;">₹{item.amount:,.2f}</td>
                </tr>
            """

        party_address = ", ".join(filter(None, [party.address_line_1, party.city, party.state, party.pincode]))
        party_contact = party.phone or party.mobile or "N/A"
        party_gstin = party.gstin or "N/A"

        # 3. Final HTML Template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ 
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                    margin: 0; padding: 20px; 
                    background-color: #f8fafc; 
                    color: #0f172a; 
                }}
                .email-wrapper {{
                    max-width: 800px;
                    margin: 0 auto;
                }}
                .greeting-section {{
                    margin-bottom: 30px;
                    padding: 0 20px;
                }}
                .container {{ 
                    background-color: #ffffff; 
                    padding: 48px; 
                    border-radius: 4px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); 
                    position: relative;
                    overflow: hidden;
                }}
                .watermark {{
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 120px;
                    font-weight: 900;
                    color: rgba(226, 232, 240, 0.4);
                    z-index: 0;
                    pointer-events: none;
                    text-transform: uppercase;
                    border: 8px solid rgba(226, 232, 240, 0.4);
                    padding: 10px 30px;
                    border-radius: 20px;
                    white-space: nowrap;
                }}
                table {{ width: 100%; border-collapse: collapse; }}
                .metadata-strip {{
                    background-color: {light_bg};
                    border: 1px solid {border_color}1a;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 48px;
                }}
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <!-- GREETING -->
                <div class="greeting-section">
                    <p style="font-size: 16px; margin-bottom: 12px;">Dear <strong>{party.name}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                        Greetings from <strong>{settings.COMPANY_NAME}</strong>. We hope you are doing well.<br>
                        Please find below the detailed breakdown of your {label.lower()}. This document acts as an official record of our transaction.
                    </p>
                </div>

                <div class="container">
                    {f'<div class="watermark">DRAFT</div>' if is_draft else ""}
                    
                    <!-- TOP BAR / BRANDING -->
                    <table style="margin-bottom: 48px; position: relative; z-index: 10;">
                        <tr>
                            <td style="vertical-align: middle;">
                                <table style="width: auto;">
                                    <tr>
                                        <td>
                                            <div style="width: 56px; height: 56px; background-color: {primary_color}; border-radius: 16px; text-align: center; line-height: 56px; color: white; font-size: 24px; font-weight: bold;">
                                                BS
                                            </div>
                                        </td>
                                        <td style="padding-left: 16px;">
                                            <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: -0.05em; color: #0f172a; line-height: 1;">{settings.COMPANY_NAME}</h1>
                                            <p style="margin: 6px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b;">Trading & Transport</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td style="text-align: right; vertical-align: top;">
                                <div style="display: inline-block; padding: 6px 16px; background-color: {primary_color}; color: white; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 8px;">
                                    {label}
                                </div>
                                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #94a3b8;">#{voucher.voucher_number or 'TRP-DRAFT'}</p>
                            </td>
                        </tr>
                    </table>

                    <!-- COMPANY & CLIENT INFO GRID -->
                    <table style="margin-bottom: 48px; position: relative; z-index: 10;">
                        <tr>
                            <!-- ISSUED BY -->
                            <td style="width: 50%; padding-right: 32px; border-left: 4px solid {primary_color}; vertical-align: top;">
                                <h3 style="margin: 0 0 16px 0; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Issued By</h3>
                                <div style="font-size: 12px; line-height: 1.5; color: #475569;">
                                    <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #0f172a;">{settings.COMPANY_NAME}</p>
                                    <table style="width: auto; margin-bottom: 4px;">
                                        <tr><td style="width: 20px; vertical-align: top; color: {accent_color}; font-size: 14px;">📍</td><td style="color: #475569;">{settings.COMPANY_ADDRESS}</td></tr>
                                    </table>
                                    <table style="width: auto; margin-bottom: 4px;">
                                        <tr><td style="width: 20px; color: {accent_color}; font-size: 14px;">📞</td><td style="color: #475569;">{settings.COMPANY_PHONE}</td></tr>
                                    </table>
                                    <table style="width: auto; margin-bottom: 4px;">
                                        <tr><td style="width: 20px; color: {accent_color}; font-size: 14px;">✉️</td><td style="color: #475569;">{settings.COMPANY_EMAIL}</td></tr>
                                    </table>
                                    <table style="width: auto;">
                                        <tr><td style="width: 20px; color: {accent_color}; font-size: 14px;">#️⃣</td><td style="color: #475569;">GSTIN: {settings.COMPANY_GSTIN}</td></tr>
                                    </table>
                                </div>
                            </td>
                            <!-- BILLED TO -->
                            <td style="width: 50%; padding-left: 32px; border-left: 4px solid #e2e8f0; vertical-align: top;">
                                <h3 style="margin: 0 0 16px 0; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Billed To</h3>
                                <div style="font-size: 12px; line-height: 1.5; color: #475569;">
                                    <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #0f172a; text-transform: uppercase;">{party.name}</p>
                                    {f'<table style="width: auto; margin-bottom: 4px;"><tr><td style="width: 20px; vertical-align: top; color: #94a3b8; font-size: 14px;">📍</td><td style="color: #475569;">{party_address}</td></tr></table>' if party_address else ''}
                                    <table style="width: auto; margin-bottom: 4px;">
                                        <tr><td style="width: 20px; color: #94a3b8; font-size: 14px;">📞</td><td style="color: #475569;">{party_contact}</td></tr>
                                    </table>
                                    {f'<table style="width: auto; margin-bottom: 4px;"><tr><td style="width: 20px; color: #94a3b8; font-size: 14px;">#️⃣</td><td style="color: #475569;">GSTIN: {party_gstin}</td></tr></table>' if party.gstin else ''}
                                    <div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">🏢 Customer ID: {voucher.party_id}</div>
                                    {f'<div style="margin-top: 12px; display: inline-block; padding: 4px 8px; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10px; font-weight: bold; color: #334155;">Vehicle: {voucher.vehicle_number}</div>' if voucher.vehicle_number else ''}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- METADATA STRIP -->
                    <div class="metadata-strip">
                        <table style="width: 100%;">
                            <tr>
                                <td style="width: 33%;">
                                    <p style="margin: 0 0 4px 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Date Issued</p>
                                    <div style="font-weight: bold; color: #0f172a; font-size: 14px; display: flex; align-items: center;">
                                        <span style="color: {accent_color}; margin-right: 8px;">📅</span> {voucher.voucher_date.strftime('%B %d, %Y')}
                                    </div>
                                </td>
                                <td style="width: 33%;">
                                    <p style="margin: 0 0 4px 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Place of Supply</p>
                                    <div style="font-weight: bold; color: #0f172a; font-size: 14px; display: flex; align-items: center;">
                                        <span style="color: {accent_color}; margin-right: 8px;">📍</span> {voucher.place_of_supply or 'West Bengal'}
                                    </div>
                                </td>
                                <td style="width: 33%;">
                                    <p style="margin: 0 0 4px 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Voucher Status</p>
                                    <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; { 'background-color: #fef3c7; color: #b45309;' if is_draft else 'background-color: #dcfce7; color: #15803d;' }">
                                        {voucher.status.value}
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- LINE ITEMS -->
                    <table style="margin-bottom: 48px;">
                        <thead>
                            <tr>
                                <th style="padding: 12px 16px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-bottom: 2px solid {border_color};">Description</th>
                                <th style="padding: 12px 16px; text-align: center; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-bottom: 2px solid {border_color};">Qty</th>
                                <th style="padding: 12px 16px; text-align: right; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-bottom: 2px solid {border_color};">Rate</th>
                                <th style="padding: 12px 16px; text-align: right; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-bottom: 2px solid {border_color};">Tax</th>
                                <th style="padding: 12px 16px; text-align: right; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-bottom: 2px solid {border_color};">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item_rows}
                        </tbody>
                    </table>

                    <!-- FOOTER SECTION -->
                    <table style="border-top: 2px solid #f1f5f9; padding-top: 32px;">
                        <tr>
                            <td style="width: 55%; vertical-align: top;">
                                <div style="margin-bottom: 24px;">
                                    <h4 style="margin: 0 0 8px 0; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Terms & Conditions</h4>
                                    <ul style="margin: 0; padding: 0 0 0 12px; font-size: 9px; color: #64748b; line-height: 1.5;">
                                        <li>Payment is due within 15 days of invoice date.</li>
                                        <li>Subject to West Bengal jurisdiction.</li>
                                        <li>Goods once sold will not be taken back.</li>
                                    </ul>
                                </div>
                                {f'<div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;"><h4 style="margin: 0 0 4px 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Remarks</h4><p style="margin: 0; font-size: 10px; color: #475569; font-style: italic;">"{voucher.notes}"</p></div>' if voucher.notes else ''}
                            </td>
                            <td style="width: 45%; vertical-align: top; padding-left: 48px;">
                                <!-- FINANCIALS -->
                                <table style="margin-bottom: 24px;">
                                    <tr><td style="padding: 4px 0; font-size: 12px; color: #64748b;">Subtotal</td><td style="padding: 4px 0; font-size: 12px; text-align: right; color: #475569;">₹{voucher.total_amount:,.2f}</td></tr>
                                    <tr><td style="padding: 4px 0; font-size: 12px; color: #64748b;">Total Tax</td><td style="padding: 4px 0; font-size: 12px; text-align: right; color: #475569;">₹{voucher.tax_amount:,.2f}</td></tr>
                                    <tr>
                                        <td style="padding: 12px 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: {accent_color}; border-top: 2px solid {border_color};">Total</td>
                                        <td style="padding: 12px 0; font-size: 24px; font-weight: 900; text-align: right; color: {accent_color}; border-top: 2px solid {border_color};">₹{voucher.grand_total:,.2f}</td>
                                    </tr>
                                </table>

                                <!-- SIGNATURE -->
                                <div style="text-align: right; margin-top: 48px;">
                                    <p style="margin: 0; font-size: 10px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: -0.01em;">Authorized Signatory For</p>
                                    <p style="margin: 4px 0 32px 0; font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">{settings.COMPANY_NAME}</p>
                                    
                                    {f'<p style="margin: 0; font-size: 11px; font-weight: bold; color: #0f172a; text-transform: uppercase;">{approver_name}</p>' if approver_name else '<div style="height: 16px;"></div>'}
                                    <p style="margin: 4px 0 0 0; font-size: 9px; font-weight: bold; color: #94a3b8; font-style: italic;">Digitally Signed Document</p>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- BOTTOM WATERMARK -->
                    <div style="margin-top: 64px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                        <p style="margin: 0; font-size: 8px; font-weight: 500; color: #cbd5e1; display: flex; justify-content: center; align-items: center;">
                            🌐 {settings.COMPANY_WEBSITE} &nbsp; • &nbsp; Generated on {datetime.now().strftime('%d %b, %Y')}
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailUtil.send_email(party.email, subject, html_content)
        logger.info(f"Voucher email sent to {party.email}")
