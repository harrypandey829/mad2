export default {
  template: `
    <div class="d-flex min-vh-100">
      <!-- Sidebar -->
      <div class="sidebar bg-dark text-white p-3" style="width: 250px; min-width: 200px; max-width: 25%;">
        <h4 class="text-center mb-4 fw-bold" style="color: #3498db;">Customer Portal</h4>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/customerdashboard/home" active-class="bg-primary">Home</router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/customerdashboard/history" active-class="bg-primary">Service History</router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/customerdashboard/ongoing" active-class="bg-primary">Ongoing Services</router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/customerdashboard/profile" active-class="bg-primary">Profile</router-link>
          </li>
          <li class="nav-item mt-auto">
            <a href="#" class="nav-link text-danger" @click.prevent="logout"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
          </li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="flex-grow-1 p-4" style="background: #ecf0f1;">
        <div class="container mt-4">
          <!-- User Info Top-Right -->
          <div class="user-info position-absolute end-0 p-3" style="top: 100px;">
            <div class="card shadow-sm border-0" style="width: 200px; background: #34495e;">
              <div class="card-body p-2 text-center text-white">
                <h6 class="mb-0 fw-bold">{{ fullName }}</h6>
              </div>
            </div>
          </div>
          <!-- Children Routes Render Here -->
          <router-view></router-view>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      fullName: localStorage.getItem("fullName") || "Unknown User",
    };
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    }
  }
};