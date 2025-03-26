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
              <p><strong>Professional:</strong> {{ request.professional_name || 'Not Assigned Yet' }}</p>
              <p><strong>Date Requested:</strong> {{ request.date_of_request }}</p>
              <div v-if="request.status === 'Ongoing'">
                <button class="btn btn-success btn-sm" @click="finishService(request.id)">Finish</button>
              </div>
              <div v-if="request.status === 'CustomerFinished'">
                <p><strong>Rating:</strong> {{ request.service_rating || 'Not Rated Yet' }}</p>
                <label for="rating">Rate (1-7):</label>
                <input type="number" v-model="request.rating" min="1" max="7" class="form-control w-25 d-inline-block mx-2" :disabled="request.service_rating !== null" />
                <button class="btn btn-primary btn-sm" @click="updateRating(request.id, request.rating)" :disabled="request.service_rating !== null">Update Rating</button>
              </div>
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
        this.ongoingServices = data.map(service => ({ ...service, rating: service.service_rating || null })) || [];
      } catch (error) {
        console.error("Fetch Ongoing Error:", error);
        alert(error.message);
      }
    },
    async finishService(serviceId) {
      try {
        const response = await fetch(`/api/customer/service/${serviceId}/finish`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          },
          body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to finish service');
        const data = await response.json();
        alert(data.message || 'Service finished successfully!');
        this.fetchOngoingServices(); // Refresh list
      } catch (error) {
        console.error("Finish Service Error:", error);
        alert(error.message);
      }
    },
    async updateRating(serviceId, rating) {
      try {
        const body = { rating: parseInt(rating) };
        const response = await fetch(`/api/customer/service/${serviceId}/finish`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to update rating');
        const data = await response.json();
        alert(data.message || 'Rating updated successfully!');
        this.fetchOngoingServices(); // Refresh list
      } catch (error) {
        console.error("Update Rating Error:", error);
        alert(error.message);
      }
    }
  }
};