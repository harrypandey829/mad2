export default {
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg" style="margin-top: 50px; margin-bottom: 100px;">
            <div class="card-header bg-success text-white text-center">
              <h3 class="mb-0">Register Form</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleRegister">
                <div class="form-group mb-3">
                  <label for="full_name" class="form-label">Full Name</label>
                  <input type="text" id="full_name" class="form-control" v-model="full_name" required />
                </div>
                <div class="form-group mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" id="email" class="form-control" v-model="email" required />
                </div>
                <div class="form-group mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input type="password" id="password" class="form-control" v-model="password" required />
                </div>
                <div class="form-group mb-3">
                  <label for="address" class="form-label">Address</label>
                  <input type="text" id="address" class="form-control" v-model="address" required />
                </div>
                <div class="form-group mb-3">
                  <label for="pincode" class="form-label">Pincode</label>
                  <input type="number" id="pincode" class="form-control" v-model="pincode" required />
                </div>
                <div class="form-group mb-3">
                  <label for="role" class="form-label">Role</label>
                  <select id="role" class="form-control" v-model="role" @change="updateServiceType" required>
                    <option value="customer">Customer</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div class="form-group mb-4" v-if="role === 'professional'">
                  <label for="service_type" class="form-label">Service Type</label>
                  <select id="service_type" class="form-control" v-model="service_type" required>
                    <option value="" disabled>Select a service</option>
                    <option v-for="service in availableServices" :key="service.id" :value="service.service_type">
                      {{ service.service_type }}
                    </option>
                  </select>
                </div>
                <button type="submit" class="btn btn-success w-100">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      full_name: "",
      email: "",
      password: "",
      address: "",
      pincode: "",
      role: "customer", // Default role is customer
      service_type: "", // Default empty for professional, None for customer
      availableServices: [] // To store fetched services
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
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        this.availableServices = data || [];
      } catch (error) {
        console.error("Fetch Services Error:", error);
        alert("Could not load available services.");
      }
    },
    updateServiceType() {
      // Reset service_type when role changes
      if (this.role === 'customer') {
        this.service_type = ""; // Will be set to "None" in backend
      } else {
        this.service_type = ""; // Let professional select
      }
    },
    async handleRegister() {
      try {
        const payload = {
          full_name: this.full_name,
          email: this.email,
          password: this.password,
          address: this.address,
          pincode: this.pincode,
          role: this.role
        };
        // Only include service_type if role is professional
        if (this.role === 'professional') {
          if (!this.service_type) {
            alert("Please select a service type!");
            return;
          }
          payload.service_type = this.service_type;
        }

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert(`Registration Successful! Please log in.`);
          this.$router.push("/login");
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        alert("Something went wrong! Please try again.");
      }
    },
  },
};