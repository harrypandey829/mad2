from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText
import os
import smtplib

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

def send_mail(receiver, subject, message, content="text", attachment=None):
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver
    msg['Subject'] = subject

    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    if attachment:
        with open(attachment, 'rb') as attachment_:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment_.read())
        part.add_header('Content-Disposition', f'attachment; filename="{os.path.basename(attachment)}"')
        encoders.encode_base64(part)
        msg.attach(part)

    server = smtplib.SMTP(host=SMTP_HOST, port=SMTP_PORT)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()
    return 'Mail sent successfully !!'