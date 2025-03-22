export default {
    template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg" style="height: 450px; margin-top: 50px; margin-bottom: 100px;">
            <div class="card-header bg-primary text-white text-center">
              <h3 class="mb-0">Login Form</h3>
            </div>
            <div class="card-body d-flex flex-column justify-content-center">
              <form @submit.prevent="loginUser">
                <div class="form-group mb-4">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    v-model="formData.email"
                    required
                  />
                </div>
                <div class="form-group mb-4">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    v-model="formData.password"
                    required
                  />
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    data() {
        return {
            formData: {
                email: "", // Email ko formData me bind kiya
                password: "", // Password ko bhi bind kiya
            },
        };
    },
    methods: {
        async loginUser() {
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.formData),
                });

                // Response check
                if (!response.ok) {
                    throw new Error("Login failed! Invalid credentials.");
                }

                // Parse JSON response
                const data = await response.json();
                console.log("API Response Data:", data); // Debug API response

                // ✅ Check success condition
                if (data.success) {
                    // Auth token, userId, and fullName ko localStorage me store karo
                    localStorage.setItem("authToken", data.token); // Token store
                    localStorage.setItem("fullName", data.fullName); // Full Name store
                    localStorage.setItem("userId", data.userId); // User ID store

                    // Console logs for confirmation
                    console.log("Auth Token:", localStorage.getItem("authToken"));
                    console.log("User Full Name:", localStorage.getItem("fullName"));
                    console.log("User ID:", localStorage.getItem("userId"));

                    // ✅ Welcome alert and redirect
                    alert(`Welcome, ${data.fullName}! Login Successful.`);
                    this.$router.push("/dashboard"); // Redirect to dashboard
                } else {
                    alert(data.message || "Login failed. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Something went wrong. Please try again later.");
            }
        },
    },
};
