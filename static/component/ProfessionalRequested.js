export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Requested Services</h2>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="request in requestedServices" :key="request.id">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #16a085;">{{ request.service_type }}</h5>
              <p class="card-text">
                <strong>Customer:</strong> {{ request.customer_name }}<br>
                <strong>Rating:</strong> {{ request.customer_rating || 'Not Rated' }}<br>
                <strong>Address:</strong> {{ request.customer_address || 'N/A' }}<br>
                <strong>Status:</strong> {{ request.status }}
              </p>
              <div class="d-flex justify-content-between">
                <button class="btn btn-primary btn-sm" @click="acceptService(request.id)">Accept</button>
                <button class="btn btn-danger btn-sm" @click="rejectService(request.id)">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            requestedServices: []
        };
    },
    mounted() {
        this.fetchRequestedServices();
    },
    methods: {
        async fetchRequestedServices() {
            try {
                const response = await fetch('/api/professional/requested-services', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch requested services: ${response.status}`);
                const data = await response.json();
                this.requestedServices = data.services || [];
            } catch (error) {
                console.error('Error fetching requested services:', error);
                alert(error.message);
            }
        },
        async acceptService(serviceId) {
            try {
                const response = await fetch(`/api/professional/service/${serviceId}/accept`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({})
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to accept service: ${errorText}`);
                }
                alert('Service accepted');
                this.fetchRequestedServices(); // Refresh requested list
                this.$router.push('/professionaldashboard/home'); // Go to home to see ongoing
            } catch (error) {
                console.error('Error accepting service:', error);
                alert(error.message);
            }
        },
        async rejectService(serviceId) {
            if (confirm('Reject this service request?')) {
                try {
                    const response = await fetch(`/api/professional/service/${serviceId}/reject`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': localStorage.getItem('authToken') || ''
                        },
                        body: JSON.stringify({})
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to reject service: ${errorText}`);
                    }
                    alert('Service rejected');
                    this.fetchRequestedServices(); // Refresh requested list
                    this.$router.push('/professionaldashboard/home'); // Go to home to see history
                } catch (error) {
                    console.error('Error rejecting service:', error);
                    alert(error.message);
                }
            }
        }
    }
};