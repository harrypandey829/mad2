export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50;">Ongoing Services</h2>
      <div class="row">
        <div v-for="request in ongoingServices" :key="request.id" class="col-md-4 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ request.service_type }}</h5>
              <p><strong>Status:</strong> {{ request.status }}</p>
              <p><strong>Professional:</strong> {{ request.professional_name || 'Assigned Soon' }}</p>
              <p><strong>Date Requested:</strong> {{ request.date_of_request }}</p>
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
                const response = await fetch('/api/customer/ongoing-services', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch ongoing services');
                const data = await response.json();
                this.ongoingServices = data || [];
            } catch (error) {
                console.error("Fetch Ongoing Error:", error);
                alert(error.message);
            }
        }
    }
};