export default {
  template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Service History</h2>
      <div class="row">
        <div class="col-md-12">
          <div class="card shadow-sm border-0 mb-3" v-for="request in history" :key="request.id">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ request.service_type }}</h5>
              <p class="card-text">
                <strong>Customer:</strong> {{ request.customer_name }}<br>
                <strong>Professional:</strong> {{ request.professional_name || 'N/A' }}<br>
                <strong>Status:</strong> {{ request.status }}<br>
                <strong>Request Date:</strong> {{ request.date_of_request }}<br>
                <strong>Completion Date:</strong> {{ request.date_of_completion || 'N/A' }}<br>
                <strong>Service Rating:</strong> {{ request.service_rating || 'Not Rated' }}<br>
                <strong>Customer Rating:</strong> {{ request.customer_rating || 'Not Rated' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      history: []
    };
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      try {
        const response = await fetch('/api/admin/history', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
        this.history = await response.json();
      } catch (error) {
        console.error('Error fetching history:', error);
        alert(error.message);
      }
    }
  }
};