export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50;">Profile</h2>
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg p-4">
            <h4 class="text-center mb-4">{{ profile.full_name || fullName }}</h4>
            <p><strong>Email:</strong> {{ profile.email || 'N/A' }}</p>
            <p><strong>Address:</strong> {{ profile.address || 'Not Set' }}</p>
            <p><strong>Pincode:</strong> {{ profile.pincode || 'Not Set' }}</p>
            <p><strong>Role:</strong> Customer</p>
            <p><strong>Account Created:</strong> {{ profile.date_of_creation || dateOfCreation }}</p>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            profile: {},
            fullName: localStorage.getItem('fullName') || 'Unknown User', // Initialize from localStorage
            dateOfCreation: localStorage.getItem('dateOfCreation') || 'N/A' // Initialize from localStorage
        };
    },
    mounted() {
        this.fetchProfile();
    },
    methods: {
        async fetchProfile() {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch('/userinfo', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': token
                    }
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Failed to fetch profile: ${response.status} - ${text}`);
                }

                const data = await response.json();
                console.log("Profile Data:", data); // Debug
                this.profile = data || {};
                // Update local data if API provides these values
                if (data.full_name) this.fullName = data.full_name;
                if (data.date_of_creation) this.dateOfCreation = data.date_of_creation;
            } catch (error) {
                console.error("Fetch Profile Error:", error);
                alert(`Error fetching profile: ${error.message}`);
            }
        }
    }
};