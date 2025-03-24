export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Ongoing Services</h2>
      <div class="row">
        <div class="col-md-12">
          <div class="card shadow-sm border-0 mb-3" v-for="request in ongoing" :key="request.id">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ request.service_type }}</h5>
              <p class="card-text">
                <strong>Customer:</strong> {{ request.customer_name }}<br>
                <strong>Professional:</strong> {{ request.professional_name || 'N/A' }}<br>
                <strong>Status:</strong> {{ request.status }}<br>
                <strong>Request Date:</strong> {{ request.date_of_request }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            ongoing: []
        };
    },
    mounted() {
        this.fetchOngoing();
    },
    methods: {
        async fetchOngoing() {
            try {
                const response = await fetch('/api/admin/ongoing', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch ongoing services: ${response.status}`);
                this.ongoing = await response.json();
            } catch (error) {
                console.error('Error fetching ongoing services:', error);
                alert(error.message);
            }
        }
    }
};