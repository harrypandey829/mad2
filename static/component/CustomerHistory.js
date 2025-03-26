export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50;">Service History</h2>
      <div class="row">
        <div v-for="request in serviceHistory" :key="request.id" class="col-md-6 mb-4">
          <div class="card shadow-sm border-0" style="background: #f8f9fa; border-radius: 10px;">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ request.service_type }}</h5>
              <p class="card-text mb-2">
                <strong>Status:</strong> {{ request.status }}<br>
                <strong>Professional:</strong> {{ request.professional_name }}<br>
                <strong>Date Requested:</strong> {{ request.date_of_request }}<br>
                <strong>Completed:</strong> {{ request.date_of_completion || 'N/A' }}<br>
                <strong>Your Rating:</strong> {{ request.service_rating || 'Not Rated' }}<br>
                <strong>Professional Rating:</strong> {{ request.customer_rating || 'Not Rated' }}
              </p>
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
                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();
                this.serviceHistory = data || [];
            } catch (error) {
                console.error("Fetch History Error:", error);
                alert(`Error fetching history: ${error.message}`);
            }
        }
    }
};