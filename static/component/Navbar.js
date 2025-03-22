export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a class="navbar-brand" href="#">A-Z Household Services</a>
      <div class="collapse navbar-collapse">
        <!-- Left Side Links -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
        </ul>

        <!-- Search Box in Center -->
        <form class="d-flex mx-auto" @submit.prevent="handleSearch">
          <input
            class="form-control me-2"
            type="search"
            v-model="searchQuery"
            placeholder="Search services..."
            aria-label="Search"
          />
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>

        <!-- Right Side Links -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/register">Register</router-link>
          </li>
        </ul>
      </div>
    </nav>
  `,
    data() {
        return {
            searchQuery: "",
        };
    },
    methods: {
        handleSearch() {
            if (this.searchQuery) {
                alert(`Searching for: ${this.searchQuery}`);
                // Search logic implement here if needed
            } else {
                alert("Please enter a search term!");
            }
        },
    },
};
