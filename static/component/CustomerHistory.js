export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50;">Service History</h2>
      <div class="row">
        <div v-for="request in serviceHistory" :key="request.id" class="col-md-6 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ request.service_type }}</h5>
              <p><strong>Status:</strong> {{ request.status }}</p>
              <p><strong>Date Requested:</strong> {{ request.date_of_request }}</p>
              <p><strong>Completed:</strong> {{ request.date_of_completion || 'N/A' }}</p>
              <p><strong>Rating:</strong> {{ request.service_rating || 'Not Rated' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            serviceHistory: []
        };
    },
    mounted() {
        this.fetchServiceHistory();
    },
    methods: {
        async fetchServiceHistory() {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch('/api/customer/service-history', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': token
                    }
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Failed to fetch service history: ${response.status} - ${text}`);
                }

                const data = await response.json();
                this.serviceHistory = data || [];
            } catch (error) {
                console.error("Fetch History Error:", error);
                alert(`Error fetching history: ${error.message}`);
            }
        }
    }
};