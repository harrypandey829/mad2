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

    # Generate auth token
    token = user.get_auth_token()

    # Get user's role (first role, since user has one primary role in your setup)
    role = [r.name for r in user.roles][0] if user.roles else "unknown"

    # Ensure full_name is not null (debugging)
    full_name = user.full_name if user.full_name else email.split('@')[0]

    # Print for debugging
    print("Login Successful for:", email, "Full Name:", full_name)

    # Return user data with role
    return jsonify({
        "success": True,
        "token": token,
        "userId": user.id,
        "fullName": full_name,
        "role": role,
        "date_of_creation": user.date_of_creation.strftime('%Y-%m-%d') if user.date_of_creation else None,  # Added for profile
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
    service_type = data.get("service_type")  # Optional field

    # Check if user already exists
    if datastore.find_user(email=email):
        return jsonify({"error": "User already exists!"}), 409

    # Find the role dynamically
    role = datastore.find_role(role_name.lower())
    if not role:
        return jsonify({"error": "Invalid role provided!"}), 400

    # Validate service_type for professional
    if role_name.lower() == "professional":
        if not service_type:
            return jsonify({"error": "Service type is required for professionals!"}), 400
        # Check if service_type exists in Service table
        if not Service.query.filter_by(service_type=service_type).first():
            return jsonify({"error": "Invalid service type!"}), 400
    else:
        # Default to 'None' for customers
        service_type = "None"

    # Create user with hashed password and assigned role
    user = datastore.create_user(
        email=email,
        password=hash_password(password),
        full_name=full_name,
        address=address,
        pincode=pincode,
        service_type=service_type,
        roles=[role],
        active=True,
    )

    # Save to the database
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/userinfo", methods=["GET"])
@auth_required("token")
def userinfo():
    try:
        # Use current_user instead of request.user
        user = current_user
        if not user.is_authenticated:
            return jsonify({"error": "User not authenticated"}), 401
        
        return jsonify({
            "email": user.email,
            "full_name": user.full_name,
            "address": user.address,
            "pincode": user.pincode,
            "date_of_creation": user.date_of_creation.strftime('%Y-%m-%d') if user.date_of_creation else None,
            "roles": [role.name for role in user.roles]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
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



@app.route('/api/service/<int:service_id>/professionals', methods=['GET'])
@auth_required('token')
def get_professionals_for_service(service_id):
    try:
        if not current_user.has_role('customer'):
            return jsonify({'error': 'Unauthorized Access! Only Customers can view professionals.'}), 403

        # Check if service exists
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'error': 'Service not found.'}), 404

        # Fetch professionals with matching service_type
        professionals = User.query.filter(
            User.roles.any(name='professional'),
            User.service_type == service.service_type,
            User.is_blocked == False
            # Removed is_verified condition temporarily for testing
        ).all()

        # Debugging: Log how many professionals found
        print(f"Service ID: {service_id}, Service Type: {service.service_type}, Found Professionals: {len(professionals)}")

        professionals_list = [{
            'id': pro.id,
            'full_name': pro.full_name,
            'user_rating': pro.user_rating,
            'address': pro.address,
            'description': pro.description
        } for pro in professionals]

        return jsonify({'professionals': professionals_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Service booking .

from flask import jsonify, request
from application.models import ServiceRequest, db

@app.route('/api/book-service', methods=['POST'])
@auth_required('token')
def book_service():
    try:
        if not current_user.has_role('customer'):
            return jsonify({'error': 'Unauthorized Access! Only Customers can book services.'}), 403
        
        data = request.json
        service_id = data.get('service_id')
        professional_id = data.get('professional_id')

        if not service_id or not professional_id:
            return jsonify({'error': 'Service ID and Professional ID are required'}), 400

        service = Service.query.get(service_id)
        professional = User.query.get(professional_id)
        if not service or not professional:
            return jsonify({'error': 'Service or Professional not found'}), 404

        # Create new service request
        service_request = ServiceRequest(
            service_id=service_id,
            service_type=service.service_type,
            customer_id=current_user.id,
            professional_id=professional_id,
            status='Requested'
        )
        db.session.add(service_request)
        db.session.commit()

        return jsonify({'message': 'Service booked successfully!', 'request_id': service_request.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@app.route('/api/customer/service-history', methods=['GET'])
@auth_required('token')
def get_service_history():
    try:
        if not current_user.has_role('customer'):
            return jsonify({'error': 'Unauthorized Access! Only Customers can view history.'}), 403
        
        history = ServiceRequest.query.filter_by(customer_id=current_user.id).all()
        history_list = [{
            'id': req.id,
            'service_type': req.service_type,
            'status': req.status,
            'date_of_request': req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A',
            'date_of_completion': req.date_of_completion.strftime('%Y-%m-%d') if req.date_of_completion else None,
            'service_rating': req.service_rating
        } for req in history]
        
        return jsonify(history_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/api/customer/ongoing-services', methods=['GET'])
@auth_required('token')
def get_ongoing_services_customer():
    if not current_user.has_role('customer'):
        return jsonify({'error': 'Unauthorized Access! Only Customers can view ongoing services.'}), 403
    
    # Fetch ongoing services for the logged-in customer
    ongoing = ServiceRequest.query.filter_by(customer_id=current_user.id, status='ongoing').all()
    ongoing_list = [{
        'id': req.id,
        'service_type': req.service_type,
        'status': req.status,
        'professional_name': User.query.get(req.professional_id).full_name if req.professional_id else None,
        'date_of_request': req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A'
    } for req in ongoing]
    
    return jsonify(ongoing_list), 200





# All Users
@app.route('/api/admin/users', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    try:
        users = User.query.all()
        return jsonify([{
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'address': user.address,
            'user_rating': user.user_rating,
            'service_type': user.service_type,
            'roles': [role.name for role in user.roles],
            'is_verified': user.is_verified,
            'is_blocked': user.is_blocked
        } for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Toggle Verification
@app.route('/api/admin/users/<int:user_id>/verify', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def toggle_verification(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        user.is_verified = data.get('is_verified', False)
        db.session.commit()
        return jsonify({'message': 'Verification updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Toggle Block
@app.route('/api/admin/users/<int:user_id>/block', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def toggle_block(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        user.is_blocked = data.get('is_blocked', False)
        db.session.commit()
        return jsonify({'message': 'Block status updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Service History
@app.route('/api/admin/history', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_service_history_admin():
    try:
        history = ServiceRequest.query.all()
        return jsonify([{
            'id': req.id,
            'service_type': req.service_type,
            'customer_name': User.query.get(req.customer_id).full_name,
            'professional_name': User.query.get(req.professional_id).full_name if req.professional_id else None,
            'status': req.status,
            'date_of_request': req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A',
            'date_of_completion': req.date_of_completion.strftime('%Y-%m-%d') if req.date_of_completion else None,
            'service_rating': req.service_rating
        } for req in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Review Service
@app.route('/api/admin/history/<int:request_id>/review', methods=['PUT'])
@auth_required('token')
@roles_required('admin')
def review_service(request_id):
    try:
        request_obj = ServiceRequest.query.get_or_404(request_id)
        data = request.json
        request_obj.service_rating = data.get('service_rating')
        db.session.commit()
        return jsonify({'message': 'Review submitted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Ongoing Services
@app.route('/api/admin/ongoing', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_ongoing_services_admin():
    try:
        ongoing = ServiceRequest.query.filter(ServiceRequest.status.in_(['Requested', 'Accepted'])).all()
        return jsonify([{
            'id': req.id,
            'service_type': req.service_type,
            'customer_name': User.query.get(req.customer_id).full_name,
            'professional_name': User.query.get(req.professional_id).full_name if req.professional_id else None,
            'status': req.status,
            'date_of_request': req.date_of_request.strftime('%Y-%m-%d') if req.date_of_request else 'N/A'
        } for req in ongoing]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analytics
@app.route('/api/admin/analytics', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_analytics():
    try:
        # Customers by Orders
        customers = db.session.query(
            User.full_name.label('name'),
            func.count(ServiceRequest.id).label('orders')
        ).join(ServiceRequest, User.id == ServiceRequest.customer_id)\
         .group_by(User.id, User.full_name)\
         .order_by(func.count(ServiceRequest.id).desc())\
         .limit(5).all()
        
        # Professionals by Services
        professionals = db.session.query(
            User.full_name.label('name'),
            func.count(ServiceRequest.id).label('services')
        ).join(ServiceRequest, User.id == ServiceRequest.professional_id)\
         .group_by(User.id, User.full_name)\
         .order_by(func.count(ServiceRequest.id).desc())\
         .limit(5).all()
        
        # Services by Orders
        services = db.session.query(
            Service.service_type.label('type'),
            func.count(ServiceRequest.id).label('orders')
        ).join(ServiceRequest, Service.id == ServiceRequest.service_id)\
         .group_by(Service.id, Service.service_type)\
         .order_by(func.count(ServiceRequest.id).desc())\
         .limit(5).all()

        return jsonify({
            'customers': [{'name': c.name, 'orders': c.orders} for c in customers],
            'professionals': [{'name': p.name, 'services': p.services} for p in professionals],
            'services': [{'type': s.type, 'orders': s.orders} for s in services]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




#professional functionality 

# Professional Requested Services
@app.route('/api/professional/requested-services', methods=['GET'])
@auth_required('token')
@roles_required('professional')
def get_requested_services():
    try:
        requests = ServiceRequest.query.filter_by(
            professional_id=current_user.id,
            status='Requested'
        ).all()
        services_list = []
        for req in requests:
            customer = User.query.get(req.customer_id)
            services_list.append({
                'id': req.id,
                'service_type': req.service_type,
                'customer_name': customer.full_name or customer.email.split('@')[0],
                'customer_rating': customer.user_rating,
                'customer_address': customer.address,
                'status': req.status
            })
        return jsonify({'services': services_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Accept Service
@app.route('/api/professional/service/<int:service_id>/accept', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def accept_service(service_id):
    try:
        service = ServiceRequest.query.get_or_404(service_id)
        if service.professional_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        service.status = 'Accepted'
        db.session.commit()
        return jsonify({'message': 'Service accepted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Reject Service
@app.route('/api/professional/service/<int:service_id>/reject', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def reject_service(service_id):
    try:
        service = ServiceRequest.query.get_or_404(service_id)
        if service.professional_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        service.status = 'Rejected'
        db.session.commit()
        return jsonify({'message': 'Service rejected'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Finish Service
@app.route('/api/professional/service/<int:service_id>/finish', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def finish_service(service_id):
    try:
        service = ServiceRequest.query.get_or_404(service_id)
        if service.professional_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        service.status = 'Finished'
        service.date_of_completion = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Service finished'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Update Professional Profile
@app.route('/api/professional/profile', methods=['PUT'])
@auth_required('token')
@roles_required('professional')
def update_professional_profile():
    try:
        data = request.json
        user = current_user
        user.full_name = data.get('full_name', user.full_name)
        user.address = data.get('address', user.address)
        user.pincode = data.get('pincode', user.pincode)
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/professional/ongoing-services', methods=['GET'])
@auth_required('token')
def get_ongoing_services():
    if not current_user.has_role('service_professional'):  # DB role name
        return jsonify({'error': 'Unauthorized Access! Only Professionals can view ongoing services.'}), 403
    
    ongoing_requests = ServiceRequest.query.filter_by(
        professional_id=current_user.id,
        status='ongoing'
    ).all()

    services_list = []
    for request in ongoing_requests:
        service = Service.query.get(request.service_id)
        customer = User.query.get(request.customer_id)
        services_list.append({
            'id': request.id,
            'service_type': service.service_type,
            'customer_name': customer.full_name or customer.email.split('@')[0],
            'customer_rating': customer.user_rating,
            'customer_address': customer.address,
            'status': request.status,
            'scheduled_time': request.scheduled_time.strftime('%Y-%m-%d %H:%M') if request.scheduled_time else 'N/A'
        })
    
    return jsonify({'services': services_list}), 200