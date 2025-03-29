from celery import shared_task
from application.database import db
from application.models import User, ServiceRequest
from application.utils import format_report
from .mail import send_email  
from datetime import datetime
import csv
import requests
from flask import current_app as app

# Daily Reminder for Professionals
@shared_task(ignore_result=True, name="daily_reminder")
def daily_reminder():
    with app.app_context():
        
        pending_requests = ServiceRequest.query.filter_by(status='Requested').all()
        professionals = set([req.professional for req in pending_requests if req.professional])

        for pro in professionals:
            if pro and not pro.is_blocked:  # Blocked professionals skipped.
                msg = f"Reminder: You have pending service requests. Please accept or reject them."
                
                # Google Chat Webhook Url
                
                response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAQMQ7Jbg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=k0OE0kiNGwKgxiYCPKG0bpAiJYMpPUt66_rCbyRK-4w", json = {"text": f"{pro.full_name}: {msg}"})
                    
                print(response.status_code)
    return "Daily reminders sent"

# Monthly Activity Report for Customers
@shared_task(ignore_result=True, name="monthly_report")
def monthly_report():
    with app.app_context():
        customers = User.query.filter(User.roles.any(name='customer')).all()
        for customer in customers:
            if customer.is_blocked:
                continue  # Blocked customers  skipped
            
            requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            if not requests:
                continue  # If No  request then simply skipped skip
            
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
            message = format_report('templates/mail_details.html', user_data)
            send_email(customer.email, subject="Your Monthly Service Report", message=message, content="html")
            #send_email(user.email, subject = "Monthly transaction Report - Fast Logistics", message = message)
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