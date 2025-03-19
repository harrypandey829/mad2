from database import db  
from flask_security import UserMixin , RoleMixin



# User <----many to many ------> Role , userroles (assosiation table)

class User(db.Model, UserMixin): #user(Table name ) 
    # required attributes.
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String,unique = True, nullable=False)# Encrypted version of email and password --> Token  .
    active = db.Column(db.Boolean, nullable=False)
    roles = db.relationship('Role', backref='bearer', secondary='user_roles')

    # more attributes can be added .




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
    

