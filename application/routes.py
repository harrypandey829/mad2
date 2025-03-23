from flask import request, jsonify, render_template
from flask_security import hash_password, auth_required, current_user,roles_required,login_user 
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

    # Log in the user (sets Flask-Security session)
    login_user(user)

    # Generate auth token (optional, agar token-based auth bhi chahiye)
    token = user.get_auth_token()

    # Get user's role (first role, since user has one primary role in your setup)
    role = [r.name for r in user.roles][0] if user.roles else "unknown"

    # Print for debugging
    print("Login Successful for:", email)

    # Return user data with role
    return jsonify({
        "success": True,
        "token": token,
        "userId": user.id,
        "fullName": user.full_name or email.split('@')[0],  # Fallback if full_name is null
        "role": role,
        "message": "Login successful!"
    }), 200

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
    



@app.route("/logout", methods=["POST"])
@auth_required("token")
def logout():
    return jsonify({"message": "Logged out successfully!"})


@app.route('/api/professional/ongoing-services', methods=['GET'])
@auth_required('token')
def get_ongoing_services():
    if not current_user.has_role('professional'):
        return jsonify({'error': 'Unauthorized Access! Only Professionals can view ongoing services.'}), 403
    
    # Fetch ongoing service requests for the logged-in professional
    ongoing_requests = ServiceRequest.query.filter_by(
        professional_id=current_user.id,
        status='ongoing'  # Assuming 'ongoing' is a status in your ServiceRequest model
    ).all()

    services_list = []
    for request in ongoing_requests:
        service = Service.query.get(request.service_id)
        customer = User.query.get(request.customer_id)
        services_list.append({
            'id': request.id,
            'service_type': service.service_type,
            'customer_name': customer.full_name or customer.email.split('@')[0],
            'status': request.status,
            'scheduled_time': request.scheduled_time.strftime('%Y-%m-%d %H:%M') if request.scheduled_time else 'N/A'
        })
    
    return jsonify({'services': services_list}), 200  # Added status code 200 for clarity
@app.route('/api/service/<int:service_id>/professionals', methods=['GET'])
@auth_required('token')
def get_professionals_for_service(service_id):
    if not current_user.has_role('customer'):
        return jsonify({'error': 'Unauthorized Access! Only Customers can view professionals.'}), 403

    # Check if the service exists
    service = Service.query.get(service_id)
    if not service:
        return jsonify({'error': 'Service not found.'}), 404

    # Fetch professionals (assuming all professionals offer all services for now)
    # You might need a ProfessionalService table to link professionals to services
    professionals = User.query.filter(User.roles.any(name='professional')).all()

    professionals_list = []
    for pro in professionals:
        professionals_list.append({
            'id': pro.id,
            'full_name': pro.full_name or pro.email.split('@')[0],
            'experience_years': pro.experience_years if hasattr(pro, 'experience_years') else 5,  # Default or add this field
            'rating': pro.rating if hasattr(pro, 'rating') else None,  # Default or add this field
        })

    return jsonify({'professionals': professionals_list})
