from flask import Flask 
from application.config import localdevelopmentConfig
from application.models import db , User , Role 
from flask_security import Security , SQLAlchemyUserDatastore
from flask_security import hash_password

app =None
def create_app():
    app = Flask(__name__)
    app.config.from_object(localdevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User ,Role)# Datastore is a class which allows us to create entry in to database .
    app.security = Security(app, datastore) # Connect our appplication to flask security .
    app.app_context().push()
    return app

app = create_app()

# i want to create default user and role entries into the db.

with app.app_context():
    db.create_all()
    # role = Role(name="admin", description="This is a admin.")
    app.security.datastore.find_or_create_role(name="admin", description="This is a admin.")
    
    app.security.datastore.find_or_create_role(name="user", description="This is a user.")
    db.session.commit()

    if not app.security.datastore.find_user(email="user@admin.com"):
        app.security.datastore.create_user(email="user@admin.com",username="admin01", password = hash_password("1234"), roles=["admin"])
        
        db.session.commit()
    if not app.security.datastore.find_user(email="user1@user.com"):
        app.security.datastore.create_user(email="user1@user.com",username="user01", password = hash_password("1234"), roles=["user"])
        
        db.session.commit()



# from applicarion.routes import *
if __name__ == "__main__":
    app.run()

 