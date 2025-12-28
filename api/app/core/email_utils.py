import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from app.core.config import settings
from app.core.logger import logger

class EmailUtil:
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        """
        Sends an HTML email using SMTP in a background thread.
        """
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}")
            return False

        try:
            # Run the synchronous smtplib code in a thread pool
            return await asyncio.to_thread(
                EmailUtil._send_sync, 
                to_email, 
                subject, 
                html_content
            )
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    def _send_sync(to_email: str, subject: str, html_content: str):
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_FROM
        message["To"] = to_email

        part = MIMEText(html_content, "html")
        message.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, message.as_string())
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
