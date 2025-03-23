from flask import request
from flask_restful import Resource, Api
from flask_security import roles_required, current_user
from .database import db
from .models import Service

class ServiceResource(Resource):
    @roles_required('admin')
    def get(self, service_id):
        service = Service.query.get_or_404(service_id)
        return {
            'id': service.id,
            'service_type': service.service_type,
            'base_price': service.base_price,
            'description': service.description,
            'time_required': service.time_required
        }, 200

    @roles_required('admin')
    def put(self, service_id):
        service = Service.query.get_or_404(service_id)
        data = request.get_json()
        service.service_type = data.get('service_type', service.service_type)
        service.base_price = data.get('base_price', service.base_price)
        service.description = data.get('description', service.description)
        service.time_required = data.get('time_required', service.time_required)
        db.session.commit()
        return {'message': 'Service updated successfully'}, 200

    @roles_required('admin')
    def delete(self, service_id):
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return {'message': 'Service deleted successfully'}, 204

class ServiceListResource(Resource):
    def get(self):
        if not (current_user.has_role('admin') or current_user.has_role('customer')):
            return {'error': 'Unauthorized Access! Only Admin and Customer allowed.'}, 403
        services = Service.query.all()
        return [{
            'id': service.id,
            'service_type': service.service_type,
            'base_price': service.base_price,
            'description': service.description,
            'time_required': service.time_required
        } for service in services], 200

    @roles_required('admin')
    def post(self):
        data = request.get_json()
        if not data.get('service_type') or not data.get('base_price') or not data.get('time_required'):
            return {'message': 'service_type, base_price, and time_required are required'}, 400
        if Service.query.filter_by(service_type=data['service_type']).first():
            return {'message': 'Service type already exists'}, 409
        new_service = Service(
            service_type=data['service_type'],
            base_price=data['base_price'],
            description=data.get('description', ''),
            time_required=data['time_required']
        )
        db.session.add(new_service)
        db.session.commit()
        return {
            'message': 'Service created successfully',
            'id': new_service.id
        }, 201

def init_api(app):
    api = Api(app)
    api.add_resource(ServiceListResource, '/api/services')
    api.add_resource(ServiceResource, '/api/services/<int:service_id>')