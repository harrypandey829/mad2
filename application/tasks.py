from celery import shared_task
from application.database import db
from application.models import User, ServiceRequest
from application.utils import format_report
from application.mail import send_mail  
from datetime import datetime
import csv
import requests
from flask import current_app as app

# Daily Reminder for Professionals
@shared_task(ignore_result=True, name="daily_reminder")
def daily_reminder():
    with app.app_context():
        # Professionals jo pending requests ke saath hain
        pending_requests = ServiceRequest.query.filter_by(status='Requested').all()
        professionals = set([req.professional for req in pending_requests if req.professional])

        for pro in professionals:
            if pro and not pro.is_blocked:  # Blocked professionals ko skip karo
                msg = f"Reminder: You have pending service requests. Please accept or reject them."
                
                # Google Chat Webhook (replace with your webhook URL)
                webhook_url = "https://chat.googleapis.com/v1/spaces/XXXX/messages?key=YYYY&token=ZZZZ"  # Apna webhook URL daal
                try:
                    requests.post(webhook_url, json={"text": f"{pro.full_name}: {msg}"})
                except:
                    # Agar webhook fail ho, to email bhej do
                    send_mail(pro.email, "Daily Reminder", msg)
    return "Daily reminders sent"

# Monthly Activity Report for Customers
@shared_task(ignore_result=True, name="monthly_report")
def monthly_report():
    with app.app_context():
        customers = User.query.filter(User.roles.any(name='customer')).all()
        for customer in customers:
            if customer.is_blocked:
                continue  # Blocked customers ko skip karo
            
            requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            if not requests:
                continue  # Agar koi request nahi, to skip
            
            # Data for HTML template
            user_data = {
                'username': customer.full_name,
                'email': customer.email,
                'services': [
                    {
                        'service_type': req.service_type,
                        'status': req.status,
                        'date_of_request': req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A',
                        'date_of_completion': req.date_of_completion.strftime('%Y-%m-%d') if req.date_of_completion else 'N/A'
                    } for req in requests
                ]
            }
            message = format_report('templates/email_details.html', user_data)
            send_mail(customer.email, "Your Monthly Service Report", message, content="html")
    return "Monthly reports sent"

# CSV Export for Admin
@shared_task(ignore_result=False, name="download_csv_report")
def csv_report():
    with app.app_context():
        completed_requests = ServiceRequest.query.filter_by(status='Completed').all()
        filename = f"completed_services_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
        filepath = f"static/{filename}"
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Service ID', 'Customer ID', 'Professional ID', 'Date of Request', 'Date of Completion', 'Remarks'])
            for req in completed_requests:
                writer.writerow([
                    req.service_id,
                    req.customer_id,
                    req.professional_id,
                    req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A',
                    req.date_of_completion.strftime('%Y-%m-%d') if req.date_of_completion else 'N/A',
                    req.remarks or 'N/A'
                ])
        return filename