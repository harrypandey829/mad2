export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Users</h2>
      <div class="mb-4">
        <input 
          v-model="searchQuery" 
          class="form-control w-50 mx-auto" 
          placeholder="Search by name or email" 
          @input="filterUsers"
        >
      </div>
      <div class="row">
        <div class="col-md-4 mb-3" v-for="user in filteredUsers" :key="user.id">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ user.full_name }}</h5>
              <p class="card-text">
                <strong>Role:</strong> {{ user.roles[0] }}<br>
                <strong>Email:</strong> {{ user.email }}<br>
                <strong>Address:</strong> {{ user.address || 'N/A' }}<br>
                <strong>Rating:</strong> {{ user.user_rating || 'Not Rated' }}<br>
                <strong>Service Type:</strong> {{ user.service_type || 'None' }}<br>
                <strong>Completed Services:</strong> {{ user.completed_services_count || 0 }}<br>
                <strong>Description:</strong> {{ user.description || 'N/A' }}
              </p>
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <button 
                  class="btn btn-primary btn-sm" 
                  @click="verifyUser(user)" 
                  :disabled="user.is_verified || user.is_blocked"
                  :class="{ 'btn-success': user.is_verified }"
                >
                  {{ user.is_verified ? 'Verified' : 'Verify' }}
                </button>
                <button 
                  class="btn btn-danger btn-sm" 
                  @click="toggleBlock(user)"
                  :disabled="!canBlock(user)"
                >
                  {{ user.is_blocked ? 'Unblock' : 'Block' }}
                </button>
                <button 
                  class="btn btn-warning btn-sm" 
                  @click="warnUser(user)"
                  :disabled="isWarned(user)"
                >
                  {{ isWarned(user) ? 'Warned' : 'Warn' }}
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
            users: [],
            searchQuery: '',
            filteredUsers: []
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
                this.filteredUsers = this.users;
            } catch (error) {
                console.error('Error fetching users:', error);
                alert(error.message);
            }
        },
        filterUsers() {
            this.filteredUsers = this.users.filter(user =>
                user.full_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        async verifyUser(user) {
            if (user.is_verified) return;
            try {
                const response = await fetch(`/api/admin/users/${user.id}/verify`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify({ is_verified: true })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to verify user');
                }
                this.fetchUsers();
                alert('User verified successfully!');
            } catch (error) {
                console.error('Error verifying user:', error);
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
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update block status');
                }
                this.fetchUsers();
            } catch (error) {
                console.error('Error toggling block:', error);
                alert(error.message);
            }
        },
        async warnUser(user) {
            if (this.isWarned(user)) return;
            try {
                const response = await fetch(`/api/admin/users/${user.id}/warn`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to warn user');
                }
                this.fetchUsers();
                alert('User warned successfully!');
            } catch (error) {
                console.error('Error warning user:', error);
                alert(error.message);
            }
        },
        canBlock(user) {
            // Block button enable only if rating < 3
            const rating = user.user_rating || 0;
            return rating < 3 && !user.is_blocked;
        },
        isWarned(user) {
            return user.description && user.description.includes('Warning');
        }
    }
};