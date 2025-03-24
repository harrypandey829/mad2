export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Users</h2>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="user in users" :key="user.id">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ user.full_name }}</h5>
              <p class="card-text">
                <strong>Role:</strong> {{ user.roles[0] }}<br>
                <strong>Email:</strong> {{ user.email }}<br>
                <strong>Address:</strong> {{ user.address || 'N/A' }}<br>
                <strong>Rating:</strong> {{ user.user_rating || 'Not Rated' }}<br>
                <strong>Service Type:</strong> {{ user.service_type || 'None' }}
              </p>
              <div class="d-flex justify-content-between">
                <button class="btn btn-primary btn-sm" @click="toggleVerification(user)" :disabled="user.is_blocked">
                  {{ user.is_verified ? 'Unverify' : 'Verify' }}
                </button>
                <button class="btn btn-danger btn-sm" @click="toggleBlock(user)">
                  {{ user.is_blocked ? 'Unblock' : 'Block' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            users: []
        };
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
                this.users = await response.json();
            } catch (error) {
                console.error('Error fetching users:', error);
                alert(error.message);
            }
        },
        async toggleVerification(user) {
            try {
                const response = await fetch(`/api/admin/users/${user.id}/verify`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({ is_verified: !user.is_verified })
                });
                if (!response.ok) throw new Error('Failed to update verification');
                this.fetchUsers();
            } catch (error) {
                console.error('Error toggling verification:', error);
                alert(error.message);
            }
        },
        async toggleBlock(user) {
            try {
                const response = await fetch(`/api/admin/users/${user.id}/block`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({ is_blocked: !user.is_blocked })
                });
                if (!response.ok) throw new Error('Failed to update block status');
                this.fetchUsers();
            } catch (error) {
                console.error('Error toggling block:', error);
                alert(error.message);
            }
        }
    }
};