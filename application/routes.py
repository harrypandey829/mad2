from flask import request, jsonify, render_template
from flask_security import hash_password, auth_required, current_user,roles_required 
from .models import *
from flask_security.utils import verify_password
from flask import current_app as app 

# Create Blueprint

# Access datastore from the app context
datastore = app.security.datastore


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Find user using Flask-Security
    user = datastore.find_user(email=email)

    # If user not found or password is wrong
    if not user or not verify_password(password, user.password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    # Generate auth token using Flask-Security
    token = user.get_auth_token()

    # Print for debugging
    print("Login Successful for:", email)

    # ✅ Return user data properly
    return jsonify({
        "success": True,
        "token": token,
        "userId": user.id,           # Add user ID
        "fullName": user.full_name,       # Add user's full name
        "message": "Login successful!"
    })

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    address = data.get("address")
    pincode = data.get("pincode")
    role_name = data.get("role", "customer")  # Default to 'customer' if not provided

    # Check if user already exists
    if datastore.find_user(email=email):
        return jsonify({"error": "User already exists!"}), 409

    # Find the role dynamically
    role = datastore.find_role(role_name.lower())
    if not role:
        return jsonify({"error": "Invalid role provided!"}), 400

    # Create user with hashed password and assigned role
    user = datastore.create_user(
        email=email,
        password=hash_password(password),
        full_name=full_name,
        address=address,
        pincode=pincode,
        roles=[role],
        active=True,
    )

    # Save to the database
    db.session.commit()

    return jsonify({"message": "User registered successfully!"})

# 🟢 Get User Info (Protected API)
@app.route("/userinfo", methods=["GET"])
@auth_required("token")
def userinfo():
    user = request.user
    return jsonify({
        "email": user.email,
        "full_name": user.full_name,
        "address": user.address,
        "pincode": user.pincode,
        "roles": [role.name for role in user.roles]
    })
# API to get all available services (Accessible to Admin and Customer only)
@app.route('/api/services', methods=['GET'])
@auth_required('token')
def get_services():
    # Check if the user has the required roles
    if current_user.has_role('admin') or current_user.has_role('customer'):
        services = Service.query.all()
        services_list = []
        for service in services:
            services_list.append({
                'id': service.id,
                'service_type': service.service_type,
                'base_price': service.base_price,
                'description': service.description,
                'time_required': service.time_required
            })
        return jsonify({'services': services_list})
    
    # Return error if the user doesn't have the required role
    return jsonify({'error': 'Unauthorized Access! Only Admin and Customer can view services.'}), 403

# API to get the role of the logged-in user
@app.route('/api/user-role', methods=['GET'])
@auth_required('token')
def get_user_role():
    if current_user.has_role('admin'):
        return jsonify({'role': 'admin'})
    elif current_user.has_role('service_professional'):
        return jsonify({'role': 'service_professional'})
    else:
        return jsonify({'role': 'user'})
    
#API to manage services (Only accessible by Admins)
@app.route('/api/manage-services', methods=['POST', 'PUT', 'DELETE'])
@auth_required('token')
@roles_required('admin')
def manage_services():
    data = request.json

    if request.method == 'POST':
        # Create a new service
        new_service = Service(
            service_type=data['service_type'],
            base_price=data['base_price'],
            description=data['description'],
            time_required=data['time_required']
        )
        db.session.add(new_service)
        db.session.commit()
        return jsonify({'message': 'Service created successfully!'})

    elif request.method == 'PUT':
        # Update an existing service
        service = Service.query.get(data['id'])
        if service:
            service.service_type = data['service_type']
            service.base_price = data['base_price']
            service.description = data['description']
            service.time_required = data['time_required']
            db.session.commit()
            return jsonify({'message': 'Service updated successfully!'})
        else:
            return jsonify({'error': 'Service not found'}), 404

    elif request.method == 'DELETE':
        # Delete a service
        service = Service.query.get(data['id'])
        if service:
            db.session.delete(service)
            db.session.commit()
            return jsonify({'message': 'Service deleted successfully!'})
        else:
            return jsonify({'error': 'Service not found'}), 404


@app.route("/logout", methods=["POST"])
@auth_required("token")
def logout():
    return jsonify({"message": "Logged out successfully!"})
