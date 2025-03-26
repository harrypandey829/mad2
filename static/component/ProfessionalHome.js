export default {
  template: `
  <div>
    <!-- Warning Display -->
    <div v-if="warning" class="alert alert-warning text-center mb-4" style="background: #f8d7da; border-color: #f5c6cb; color: #721c24;">
      {{ warning }}
    </div>

    <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Professional Services</h2>
    
    <!-- Ongoing Services -->
    <h3 class="mb-3" style="color: #16a085;">Ongoing Services</h3>
    <div v-if="ongoingError" class="alert alert-danger">{{ ongoingError }}</div>
    <div v-else-if="ongoingServices.length === 0" class="alert alert-info">No ongoing services found.</div>
    <div class="row">
      <div class="col-md-4 mb-3" v-for="service in ongoingServices" :key="service.id">
        <div class="card h-100 shadow-sm border-0" style="background: #f8f9fa; border-radius: 10px;">
          <div class="card-body">
            <h5 class="card-title fw-bold" style="color: #16a085;">{{ service.service_type }}</h5>
            <p class="card-text mb-2">
              <strong>Customer:</strong> {{ service.customer_name }}<br>
              <strong>Rating:</strong> {{ service.customer_rating || 'Not Rated' }}<br>
              <strong>Address:</strong> {{ service.customer_address || 'N/A' }}<br>
              <strong>Status:</strong> {{ service.status }}
            </p>
            <div v-if="service.status === 'CustomerFinished'" class="mt-2">
              <label>Rate Customer (1-7):</label>
              <input type="number" v-model="service.rating" min="1" max="7" class="form-control w-25 d-inline-block mx-2" />
              <button class="btn btn-success btn-sm" @click="finishService(service.id, service.rating)">Finish & Rate</button>
            </div>
            <button v-else class="btn btn-success btn-sm" disabled>Finish (Waiting for Customer)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- History (Completed + Rejected) -->
    <h3 class="mt-5 mb-3" style="color: #16a085;">Service History</h3>
    <div v-if="historyError" class="alert alert-danger">{{ historyError }}</div>
    <div v-else-if="historyServices.length === 0" class="alert alert-info">No service history found.</div>
    <div class="row">
      <div class="col-md-4 mb-3" v-for="service in historyServices" :key="service.id">
        <div class="card h-100 shadow-sm border-0" style="background: #f8f9fa; border-radius: 10px;">
          <div class="card-body">
            <h5 class="card-title fw-bold" style="color: #16a085;">{{ service.service_type }}</h5>
            <p class="card-text mb-2">
              <strong>Customer:</strong> {{ service.customer_name }}<br>
              <strong>Avg. Rating:</strong> {{ service.customer_rating || 'Not Rated' }}<br>
              <strong>Address:</strong> {{ service.customer_address || 'N/A' }}<br>
              <strong>Status:</strong> {{ service.status }}<br>
              <strong>Completed:</strong> {{ service.date_of_completion || 'N/A' }}<br>
              <strong>Your Rating:</strong> {{ service.professional_rating || 'Not Rated' }}<br>
              <strong>Customer Rating:</strong> {{ service.service_rating || 'Not Rated' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      ongoingServices: [],
      historyServices: [],
      ongoingError: null,
      historyError: null,
      warning: null
    };
  },
  mounted() {
    this.fetchOngoingServices();
    this.fetchHistoryServices();
    this.fetchUserInfo();
  },
  methods: {
    async fetchOngoingServices() {
      try {
        const token = localStorage.getItem('authToken') || '';
        const response = await fetch('/api/professional/ongoing-services', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Authentication-Token': token
          }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        this.ongoingServices = data.services.map(service => ({ ...service, rating: null })) || [];
        this.ongoingError = null;
      } catch (error) {
        console.error("Fetch Ongoing Services Error:", error.message);
        this.ongoingError = error.message;
      }
    },
    async fetchHistoryServices() {
      try {
        const token = localStorage.getItem('authToken') || '';
        const response = await fetch('/api/professional/service-history', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Authentication-Token': token
          }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        this.historyServices = data.services || [];
        this.historyError = null;
      } catch (error) {
        console.error("Fetch History Services Error:", error.message);
        this.historyError = error.message;
      }
    },
    async fetchUserInfo() {
      try {
        const response = await fetch('/userinfo', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();
        if (data.description && data.description.includes('Warning')) {
          this.warning = data.description;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    },
    async finishService(serviceId, rating) {
      try {
        const token = localStorage.getItem('authToken') || '';
        const body = rating ? { customer_rating: parseInt(rating) } : {};
        const response = await fetch(`/api/professional/service/${serviceId}/finish`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authentication-Token': token
          },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        alert(data.message || 'Service finished successfully!');
        this.fetchOngoingServices();
        this.fetchHistoryServices();
      } catch (error) {
        console.error("Finish Service Error:", error.message);
        alert(error.message);
      }
    }
  }
};