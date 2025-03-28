from flask import Flask 
from application.config import localdevelopmentConfig
from application.models import * 
from flask_security import Security , SQLAlchemyUserDatastore
from flask_migrate import Migrate
from flask_security import hash_password
from application.resources import init_api  # Import init_api from resource.py
from application.celery_init import celery_init_app
from celery.schedules import crontab



app =None
def create_app():
    app = Flask(__name__, 
            static_folder="static", 
            template_folder="templates")
    app.config.from_object(localdevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User ,Role)# Datastore is a class which allows us to create entry in to database .
    app.security = Security(app, datastore) # Connect our appplication to flask security .
    # Initialize API routes from resource.py

   
    init_api(app)
    migrate = Migrate(app, db)  # Flask-Migrate initialize 
    app.app_context().push()
    return app

app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()

# i want to create default user and role entries into the db.

with app.app_context():
    db.create_all()
    # role = Role(name="admin", description="This is a admin.")
    app.security.datastore.find_or_create_role(name="admin", description="This is a admin.")
    
    app.security.datastore.find_or_create_role(name="customer", description="This is a customer.")
    app.security.datastore.find_or_create_role(name="professional", description="This is a professional.")
    db.session.commit()

    if not app.security.datastore.find_user(email="user@admin.com"):
        app.security.datastore.create_user(email="user@admin.com",full_name="Hariom Pandey",address="Kanpur", password = hash_password("1234"), roles=["admin"])
        
        db.session.commit()
    if not app.security.datastore.find_user(email="user1@user.com"):
        app.security.datastore.create_user(email="user1@user.com",full_name="Kamal",address="Fatehpur", password = hash_password("1234"), roles=["customer"])
    if not app.security.datastore.find_user(email="user2@user.com"):
        app.security.datastore.create_user(email="user2@user.com",full_name="Pooja",address="Fatehpur", password = hash_password("1234"), roles=["professional"])
        
        db.session.commit()


from application.routes import *
# from applicarion.routes import *

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    # Daily Reminder har roz shaam 6 baje
    sender.add_periodic_task(
        crontab(hour=18, minute=0),  # 6 PM IST
        daily_reminder.s(),
        name='Daily Reminder at 6 PM'
    )
    # Monthly Report har mahine ki 1st ko subah 9 baje
    sender.add_periodic_task(
        crontab(day_of_month=1, hour=9, minute=0),  # 1st of every month, 9 AM
        monthly_report.s(),
        name='Monthly Report on 1st at 9 AM'
    )


if __name__ == "__main__":
    app.run()

 