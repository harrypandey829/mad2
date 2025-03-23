export default {
  template: `
    <div class="container mt-5">
      <h2 class="text-center">User Dashboard</h2>
      <div class="card mt-4">
        <div class="card-header bg-success text-white">
          <h4>Welcome, {{ role }} {{ fullName }}!</h4>
        </div>
        <div class="card-body">
          <p><strong>Full Name:</strong> {{ fullName }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
          <p><strong>Role:</strong> {{ role }}</p>
          <p><strong>User ID:</strong> {{ userId }}</p>
          <!-- Random Placeholder Data -->
          <p><strong>Last Login:</strong> {{ lastLogin }}</p>
          <p><strong>Total Requests:</strong> {{ totalRequests }}</p>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      fullName: localStorage.getItem("fullName") || "Unknown User",
      email: localStorage.getItem("email") || "N/A",  // Email from localStorage
      role: localStorage.getItem("role") || "Unknown",
      userId: localStorage.getItem("userId") || "N/A",
      lastLogin: "March 22, 2025, 10:30 AM",  // Random static data
      totalRequests: Math.floor(Math.random() * 10)  // Random number 0-9
    };
  }
};