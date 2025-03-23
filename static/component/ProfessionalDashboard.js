export default {
    template: `
    <div class="container mt-5 pt-5">
      <!-- User Info in Top-Right Corner -->
      <div class="user-info position-absolute end-0 p-3" style="top: 80px;">
        <div class="card shadow-sm border-0" style="width: 200px; background: #16a085;">
          <div class="card-body p-2 text-center text-white">
            <h6 class="mb-0 fw-bold">{{ fullName }}</h6>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50; letter-spacing: 1.5px;">Professional Dashboard</h2>
      <div class="row">
        <div class="col-12">
          <h5 class="mb-4 text-center fw-semibold" style="color: #7f8c8d;">Ongoing Services</h5>
          <div class="row justify-content-center">
            <div v-for="service in ongoingServices" :key="service.id" class="col-md-4 col-sm-6 mb-4">
              <div class="card h-100 shadow-lg border-0 service-card" style="background: #ffffff; border-radius: 10px; overflow: hidden;">
                <div class="card-body text-center p-4" style="background: #ecf0f1;">
                  <h5 class="card-title fw-bold" style="color: #16a085;">{{ service.service_type }}</h5>
                  <p class="card-text" style="color: #7f8c8d; font-size: 0.9rem;"><strong>Customer:</strong> {{ service.customer_name }}</p>
                  <p class="mb-1"><strong>Status:</strong> <span style="color: #d35400;">{{ service.status }}</span></p>
                  <p class="mb-3"><strong>Scheduled:</strong> <span style="color: #3498db;">{{ service.scheduled_time }}</span></p>
                  <button class="btn btn-sm see-more-btn" @click="seeMore(service.id)">View Details</button>
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
            fullName: localStorage.getItem("fullName") || "Unknown Professional",
            ongoingServices: [],
        };
    },
    mounted() {
        this.fetchOngoingServices();
    },
    methods: {
        async fetchOngoingServices() {
            try {
                const response = await fetch('/api/professional/ongoing-services', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to fetch ongoing services: ${response.status}`);
                }
                const data = await response.json();
                console.log("Ongoing Services Response:", data);
                this.ongoingServices = data.services || [];
            } catch (error) {
                console.error("Fetch Ongoing Services Error:", error);
                alert(error.message);
            }
        },
        seeMore(serviceId) {
            alert(`Viewing details for service ID: ${serviceId}`);
            // Add more logic here if needed
        },
    },
};