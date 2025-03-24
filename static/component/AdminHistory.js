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
                <strong>Rating:</strong> {{ request.service_rating || 'Not Rated' }}
              </p>
              <button class="btn btn-info btn-sm" @click="reviewRequest(request)" :disabled="request.service_rating">Review</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="reviewingRequest" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Review Service</h5>
              <button type="button" class="btn-close" @click="reviewingRequest = null"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label>Rating (1-5):</label>
                <input v-model.number="reviewRating" type="number" min="1" max="5" class="form-control" required>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" @click="submitReview">Submit</button>
              <button class="btn btn-secondary" @click="reviewingRequest = null">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            history: [],
            reviewingRequest: null,
            reviewRating: null
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
        },
        reviewRequest(request) {
            this.reviewingRequest = request;
            this.reviewRating = null;
        },
        async submitReview() {
            try {
                const response = await fetch(`/api/admin/history/${this.reviewingRequest.id}/review`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({ service_rating: this.reviewRating })
                });
                if (!response.ok) throw new Error('Failed to submit review');
                this.fetchHistory();
                this.reviewingRequest = null;
            } catch (error) {
                console.error('Error submitting review:', error);
                alert(error.message);
            }
        }
    }
};