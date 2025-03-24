export default {
    template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Profile</h2>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold" style="color: #16a085;">{{ user.full_name }}</h5>
              <p class="card-text">
                <strong>Email:</strong> {{ user.email }}<br>
                <strong>Address:</strong> {{ user.address || 'N/A' }}<br>
                <strong>Pincode:</strong> {{ user.pincode || 'N/A' }}<br>
                <strong>Service Type:</strong> {{ user.service_type || 'N/A' }}<br>
                <strong>Rating:</strong> {{ user.user_rating || 'Not Rated' }}<br>
                <strong>Joined:</strong> {{ user.date_of_creation }}
              </p>
              <button class="btn btn-primary w-100" @click="editProfile">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="editing" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Profile</h5>
              <button type="button" class="btn-close" @click="editing = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="editedUser.full_name" class="form-control" placeholder="Full Name" required>
              </div>
              <div class="mb-3">
                <input v-model="editedUser.address" class="form-control" placeholder="Address" required>
              </div>
              <div class="mb-3">
                <input v-model="editedUser.pincode" class="form-control" placeholder="Pincode" required>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" @click="saveProfile">Save</button>
              <button class="btn btn-secondary" @click="editing = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            user: {},
            editing: false,
            editedUser: {}
        };
    },
    mounted() {
        this.fetchProfile();
    },
    methods: {
        async fetchProfile() {
            try {
                const response = await fetch('/userinfo', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);
                this.user = await response.json();
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert(error.message);
            }
        },
        editProfile() {
            this.editedUser = { ...this.user };
            this.editing = true;
        },
        async saveProfile() {
            try {
                const response = await fetch('/api/professional/profile', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    },
                    body: JSON.stringify(this.editedUser)
                });
                if (!response.ok) throw new Error('Failed to update profile');
                alert('Profile updated successfully');
                this.fetchProfile();
                this.editing = false;
            } catch (error) {
                console.error('Error updating profile:', error);
                alert(error.message);
            }
        }
    }
};