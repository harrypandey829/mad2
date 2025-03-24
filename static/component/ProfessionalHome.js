export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Ongoing Services</h2>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="service in ongoingServices" :key="service.id">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #16a085;">{{ service.service_type }}</h5>
              <p class="card-text">
                <strong>Customer:</strong> {{ service.customer_name }}<br>
                <strong>Rating:</strong> {{ service.customer_rating || 'Not Rated' }}<br>
                <strong>Address:</strong> {{ service.customer_address || 'N/A' }}<br>
                <strong>Status:</strong> {{ service.status }}<br>
                <strong>Scheduled:</strong> {{ service.scheduled_time }}
              </p>
              <button class="btn btn-success btn-sm" @click="finishService(service.id)">Finished</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            ongoingServices: []
        };
    },
    mounted() {
        this.fetchOngoingServices();
    },
    methods: {
        async fetchOngoingServices() {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('No auth token found. Please login again.');

                const response = await fetch('/api/professional/ongoing-services', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': token // Ensure token is sent
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch ongoing services: ${response.status}`);
                const data = await response.json();
                this.ongoingServices = data.services || [];
            } catch (error) {
                console.error('Error fetching ongoing services:', error);
                alert(error.message);
            }
        }
    }
};