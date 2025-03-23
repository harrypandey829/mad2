import Home from './component/Home.js';
import Login from './component/Login.js';
import Register from './component/Register.js';
import AdminDashboard from './component/AdminDashboard.js';
import UserDashboard from './component/UserDashboard.js';
import ProfessionalDashboard from './component/ProfessionalDashboard.js'; // New import
import CustomerDashboard from './component/CustomerDashboard.js'; // New import
import Navbar from './component/Navbar.js';
import Footer from './component/Footer.js';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/admindashboard', component: AdminDashboard },
  { path: '/professionaldashboard', component: ProfessionalDashboard }, // New route
  { path: '/customerdashboard', component: CustomerDashboard }, // New route
  { path: '/userdashboard', component: UserDashboard },
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