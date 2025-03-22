export default {
    template: `
    <div class="d-flex flex-grow-1">
      <!-- Sidebar -->
      <div class="sidebar bg-dark text-white p-2" style="width: 50px; transition: width 0.3s;" @mouseover="expandSidebar" @mouseleave="collapseSidebar">
        <ul class="nav flex-column mt-3">
          <li v-for="item in sidebarItems" :key="item.name" class="nav-item mb-3">
            <a href="#" class="nav-link text-white d-flex align-items-center" @click.prevent="navigate(item.route)">
              <i :class="item.icon" class="me-2"></i>
              <span v-show="isSidebarExpanded" class="sidebar-text">{{ item.name }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Main Content Area -->
      <div class="content container-fluid mt-3 mb-3" style="flex-grow: 1;">
        <h2 class="text-center">Dashboard</h2>

        <!-- Section to Show Available Services -->
        <div class="row">
          <div class="col-12 mb-3">
            <h4 class="text-center">Available Services</h4>
            <div class="row">
              <div v-for="service in services" :key="service.id" class="col-md-4 mb-3">
                <div class="card shadow">
                  <div class="card-body">
                    <h5 class="card-title">{{ service.service_type }}</h5>
                    <p class="card-text">Price: ₹{{ service.base_price }}</p>
                    <p class="card-text">{{ service.description }}</p>
                    <p class="card-text"><strong>Time Required:</strong> {{ service.time_required }} mins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Functionalities (Only visible if user is Admin) -->
        <div v-if="isAdmin">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card shadow">
                <div class="card-body text-center">
                  <h5 class="card-title">Manage Services</h5>
                  <p class="card-text">Create, Update, or Delete services.</p>
                  <button class="btn btn-primary" @click="manageServices">Manage</button>
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow">
                <div class="card-body text-center">
                  <h5 class="card-title">Manage Users</h5>
                  <p class="card-text">Approve/Block service professionals.</p>
                  <button class="btn btn-warning">Manage</button>
                </div>
              </div>
            </div>

            <div class="col-md-4 mb-3">
              <div class="card shadow">
                <div class="card-body text-center">
                  <h5 class="card-title">Generate Reports</h5>
                  <p class="card-text">View/download activity reports.</p>
                  <button class="btn btn-info">Generate</button>
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
            services: [], // Array to store fetched services
            userRole: '', // Role to check if user is Admin
            isAdmin: false, // To control admin functionality visibility
            isSidebarExpanded: false, // To track sidebar state
            sidebarItems: [
                { name: 'Dashboard', icon: 'fas fa-home', route: '/dashboard' },
                { name: 'Ongoing Services', icon: 'fas fa-tasks', route: '/ongoing' },
                { name: 'Service History', icon: 'fas fa-history', route: '/history' },
                { name: 'Profile', icon: 'fas fa-user', route: '/profile' },
                { name: 'Reports', icon: 'fas fa-file-alt', route: '/reports' },
            ]
        };
    },

    mounted() {
        this.fetchServices(); // Fetch services when component loads
        this.checkUserRole(); // Check if user is Admin
    },

    methods: {
        // Fetch all available services
        fetchServices() {
            fetch('/api/services', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("Auth_token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch services');
                    }
                    return response.json();
                })
                .then(data => {
                    this.services = data.services;
                })
                .catch(error => {
                    console.error("Error fetching services:", error);
                });
        },

        // Check the role of the logged-in user
        checkUserRole() {
            fetch('/api/user-role', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("Auth_token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user role');
                    }
                    return response.json();
                })
                .then(data => {
                    this.userRole = data.role;
                    this.isAdmin = this.userRole === 'admin'; // Show admin section if user is admin
                })
                .catch(error => {
                    console.error("Error fetching user role:", error);
                });
        },

        // Navigate to different routes on sidebar click
        navigate(route) {
            this.$router.push(route);
        },

        // Manage services (redirect or show admin management panel)
        manageServices() {
            alert('Redirecting to Manage Services...');
        },

        // Expand sidebar on hover
        expandSidebar() {
            this.isSidebarExpanded = true;
            document.querySelector('.sidebar').style.width = '200px';
        },

        // Collapse sidebar when mouse leaves
        collapseSidebar() {
            this.isSidebarExpanded = false;
            document.querySelector('.sidebar').style.width = '50px';
        }
    }
};