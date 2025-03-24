export default {
  template: `
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <nav class="col-md-3 col-lg-2 d-md-block sidebar" style="background: linear-gradient(180deg, #16a085, #2ecc71); min-height: 100vh;">
          <div class="position-sticky pt-3">
            <h4 class="text-white text-center mb-4 fw-bold" style="letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">Professional Panel</h4>
            <ul class="nav flex-column">
              <li class="nav-item mb-1">
                <router-link class="nav-link text-white py-2 px-3 rounded" to="/professionaldashboard/home" active-class="active-link">
                  <i class="bi bi-house-door me-2"></i>Home
                </router-link>
              </li>
              <li class="nav-item mb-1">
                <router-link class="nav-link text-white py-2 px-3 rounded" to="/professionaldashboard/requested" active-class="active-link">
                  <i class="bi bi-list-task me-2"></i>Requested Services
                </router-link>
              </li>
              <li class="nav-item mb-1">
                <router-link class="nav-link text-white py-2 px-3 rounded" to="/professionaldashboard/profile" active-class="active-link">
                  <i class="bi bi-person me-2"></i>Profile
                </router-link>
              </li>
              <li class="nav-item mt-3">
                <button class="nav-link w-100 text-start py-2 px-3 rounded btn-logout" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 mt-3">
          <router-view v-if="$route.matched.length"></router-view>
          <div v-else class="text-center">
            <h5>Loading dashboard...</h5>
          </div>
        </main>
      </div>
    </div>
    `,
  methods: {
    async logout() {
      try {
        await fetch('/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        localStorage.clear();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout Error:', error);
        alert('Failed to logout');
      }
    }
  }
};