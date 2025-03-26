export default {
  template: `
    <div>
      <!-- Warning Display -->
      <div v-if="warning" class="alert alert-warning text-center mb-4" style="background: #f8d7da; border-color: #f5c6cb; color: #721c24;">
        {{ warning }}
      </div>

      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">Available Services</h2>
      
      <!-- Search Bar with Styling -->
      <div class="mb-4">
        <input 
          v-model="searchQuery" 
          class="form-control w-50 mx-auto shadow-sm" 
          placeholder="Search by service name" 
          @input="filterServices"
          style="border-radius: 25px; padding: 10px 20px; border: 1px solid #ced4da;"
        >
      </div>

      <div class="row">
        <div class="col-md-6 mb-4" v-for="service in filteredServices" :key="service.id">
          <div class="card h-100 shadow border-0" style="background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s;">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #1a5276;">{{ service.service_type }}</h5>
              <p class="card-text" style="color: #2c3e50;">
                <strong>Base Price:</strong> ₹{{ service.base_price }}<br>
                <strong>Time:</strong> {{ service.time_required }} mins<br>
                <strong>Description:</strong> {{ service.description || 'No description' }}
              </p>
              <button class="btn btn-primary btn-sm" style="background: #2980b9; border: none; border-radius: 20px; padding: 6px 20px;" @click="showProfessionals(service.id)">See More</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedService" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6); z-index: 1050;">
        <div class="modal-dialog modal-lg" style="margin-top: 120px;">
          <div class="modal-content" style="background: #ffffff; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <div class="modal-header" style="background: linear-gradient(90deg, #2c3e50 0%, #1a5276 100%); color: #ffffff; border-radius: 12px 12px 0 0;">
              <h5 class="modal-title fw-bold">Select a Professional</h5>
              <button type="button" class="btn-close btn-close-white" @click="selectedService = null"></button>
            </div>
            <div class="modal-body">
              <div v-if="professionals.length === 0" class="alert alert-info">No professionals available</div>
              <div v-else class="row">
                <div class="col-md-6 mb-4" v-for="pro in professionals" :key="pro.id">
                  <div class="card h-100 shadow border-0" style="background: linear-gradient(135deg, #ecf0f1 0%, #dfe6e9 100%); border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s;">
                    <div class="card-body">
                      <h6 class="fw-bold" style="color: #1a5276;">{{ pro.full_name }}</h6>
                      <p class="mb-1" style="color: #2c3e50;">
                        <strong>Rating:</strong> {{ pro.user_rating || 'Not Rated' }}
                      </p>
                      <p class="mb-1" style="color: #2c3e50;">
                        <strong>Address:</strong> {{ pro.address }}
                      </p>
                      <button class="btn btn-success btn-sm" style="background: #27ae60; border: none; border-radius: 20px; padding: 6px 20px;" @click="bookService(selectedService, pro.id)">Book</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      services: [],
      filteredServices: [],
      selectedService: null,
      professionals: [],
      searchQuery: '',
      warning: null
    };
  },
  mounted() {
    this.fetchServices();
    this.fetchUserInfo();
  },
  methods: {
    async fetchServices() {
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        if (!response.ok) throw new Error('Failed to fetch services');
        this.services = await response.json();
        this.filteredServices = this.services; // Initially show all services
      } catch (error) {
        console.error('Error fetching services:', error);
        alert(error.message);
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
    async showProfessionals(serviceId) {
      try {
        const response = await fetch(`/api/service/${serviceId}/professionals`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        if (!response.ok) throw new Error('Failed to fetch professionals');
        const data = await response.json();
        this.professionals = data.professionals;
        this.selectedService = serviceId;
      } catch (error) {
        console.error('Error fetching professionals:', error);
        alert(error.message);
      }
    },
    async bookService(serviceId, professionalId) {
      try {
        const response = await fetch('/api/book-service', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          },
          body: JSON.stringify({ service_id: serviceId, professional_id: professionalId })
        });
        if (!response.ok) throw new Error('Failed to book service');
        const data = await response.json();
        alert(data.message);
        this.selectedService = null;
      } catch (error) {
        console.error('Error booking service:', error);
        alert(error.message);
      }
    },
    filterServices() {
      const query = this.searchQuery.toLowerCase();
      this.filteredServices = this.services.filter(service =>
        service.service_type.toLowerCase().includes(query)
      );
    }
  }
};