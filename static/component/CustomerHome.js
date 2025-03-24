export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50; letter-spacing: 1.5px;">Available Services</h2>
      <div class="row justify-content-center">
        <div v-for="service in services" :key="service.id" class="col-md-4 col-sm-6 mb-4">
          <div class="card h-100 shadow-lg border-0 service-card" style="background: #ffffff; border-radius: 10px; overflow: hidden;">
            <div class="card-body text-center p-4" style="background: #ecf0f1;">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ service.service_type }}</h5>
              <p class="card-text" style="color: #7f8c8d; font-size: 0.9rem;">{{ service.description || 'No description available' }}</p>
              <p class="mb-1"><strong>Base Price:</strong> <span style="color: #27ae60;">₹{{ service.base_price }}</span></p>
              <p class="mb-3"><strong>Time:</strong> <span style="color: #3498db;">{{ service.time_required }} mins</span></p>
              <button class="btn btn-sm btn-primary" @click="seeMore(service.id)">See More</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Professionals -->
      <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Professionals for {{ selectedService.service_type }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="professionals.length === 0">No professionals available for this service.</div>
              <div v-else class="row">
                <div v-for="pro in professionals" :key="pro.id" class="col-md-6 mb-3">
                  <div class="card shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">{{ pro.full_name }}</h5>
                      <p><strong>Rating:</strong> {{ pro.user_rating || 'Not Rated' }}</p>
                      <p><strong>Address:</strong> {{ pro.address || 'Not Provided' }}</p>
                      <p><strong>Description:</strong> {{ pro.description || 'No description available' }}</p>
                      <button class="btn btn-success btn-sm" @click="bookProfessional(pro.id, selectedService.id)">Book</button>
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
            showModal: false,
            selectedService: {},
            professionals: []
        };
    },
    mounted() {
        this.fetchServices();
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch('/api/services', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch services: ${response.status}`);
                const data = await response.json();
                console.log("Fetched Services:", data); // Debug
                this.services = data || [];
            } catch (error) {
                console.error("Fetch Services Error:", error);
                alert(error.message);
            }
        },
        async seeMore(serviceId) {
            try {
                this.selectedService = this.services.find(s => s.id === serviceId) || {};
                console.log("Selected Service:", this.selectedService); // Debug

                const response = await fetch(`/api/service/${serviceId}/professionals`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Failed to fetch professionals: ${response.status} - ${text}`);
                }
                const data = await response.json();
                console.log("Fetched Professionals:", data); // Debug
                this.professionals = data.professionals || [];
                this.showModal = true;
            } catch (error) {
                console.error("Fetch Professionals Error:", error);
                alert(error.message);
            }
        },
        async bookProfessional(professionalId, serviceId) {
            try {
                const response = await fetch('/api/book-service', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({
                        service_id: serviceId,
                        professional_id: professionalId
                    })
                });
                if (!response.ok) throw new Error('Failed to book service');
                const data = await response.json();
                alert(data.message || 'Service booked successfully!');
                this.closeModal();
            } catch (error) {
                console.error("Book Service Error:", error);
                alert(error.message);
            }
        },
        closeModal() {
            this.showModal = false;
            this.professionals = [];
            this.selectedService = {};
        }
    }
};