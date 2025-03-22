from .database import db  
from flask_security import UserMixin , RoleMixin
from datetime import date 



# User <----many to many ------> Role , userroles (assosiation table)

class User(db.Model, UserMixin): #user(Table name ) 
    # required attributes.
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String,unique = True, nullable=False)# Encrypted version of email and password --> Token  .
    active = db.Column(db.Boolean, nullable=False)
    roles = db.relationship('Role', backref='bearer', secondary='user_roles')

    # more attributes can be added .
    full_name = db.Column(db.String(),nullable=False)
    address = db.Column(db.String(),nullable=False)
    pincode = db.Column(db.Integer())
    experience = db.Column(db.Integer(), default = -1)
    service_type = db.Column(db.String(), db.ForeignKey('service.service_type',ondelete="CASCADE"), nullable = True )
    service_name = db.Column(db.String(), default = 'None')
    description = db.Column(db.String(), nullable = True)
    date_of_creation = db.Column(db.Date, nullable = True )
    user_rating = db.Column(db.Integer(),default = 0 )
    is_verified = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean(), default=False)
    customer_service_requests = db.relationship('ServiceRequest', backref='customer', foreign_keys='ServiceRequest.customer_id')
    professional_service_requests = db.relationship('ServiceRequest', backref='professional', foreign_keys='ServiceRequest.professional_id')





class Role(db.Model,RoleMixin): # role (Table name )
    # reuired attributes.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)
    

    # more attributes can be added .

class UserRoles(db.Model):# user_roles (Table name )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    
# Service Table 
class Service(db.Model):
    id = db.Column(db.Integer(),primary_key=True)
    service_type = db.Column(db.String(),nullable=False, unique=True)
    base_price = db.Column(db.Integer(),nullable=False, default = 1000)
    description = db.Column(db.String(200))
    time_required = db.Column(db.Integer())# Time in minutes.
    service_rqeuests = db.relationship('ServiceRequest', backref='service')  # Establishes a backref to Services

# Service Request Table 
class ServiceRequest(db.Model):
    id = db.Column(db.Integer(), primary_key = True )
    service_id = db.Column(db.Integer(), db.ForeignKey('service.id',ondelete="CASCADE"), nullable=False )
    service_type = db.Column(db.String(), nullable=True)  # Column to store service_type beaacuse later on when admin deleted the service then there should be service_type available for showing the histroy for custommer's pages.
    customer_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer(), db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(20), default='Requested')
    date_of_completion = db.Column(db.Date, nullable = True )
    date_of_request = db.Column(db.Date, default=date.today)
    remarks = db.Column(db.String(500),nullable = True) 
    service_rating  = db.Column(db.Integer(),nullable =True)
   
    
