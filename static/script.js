import Home from './component/Home.js';
import Login from './component/Login.js';
import Register from './component/Register.js';
import Dashboard from './component/Dashboard.js';
import Navbar from './component/Navbar.js';
import Footer from './component/Footer.js';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  el: '#app',
  router,
  template: `
    <div class="d-flex flex-column min-vh-100">
      <nav-bar></nav-bar>
      <div class="flex-grow-1">
        <router-view></router-view>
      </div>
      <foot></foot>
    </div>
  `,
  components: {
    'nav-bar': Navbar,
    'foot': Footer,
  },
});


