export default {
  template: `
    <div class="container mt-5 text-center">
      <h1 class="display-4 fw-bold" style="color: #2c3e50; text-shadow: 1px 1px 3px rgba(0,0,0,0.1);">Welcome to Household Services</h1>
      <p class="lead mb-4" style="color: #34495e;">Your one-stop solution for booking trusted professionals for all your home needs!</p>
      
      <!-- Image Placeholder -->
      <img src="/static/images/household-services-hero.jpg" alt="Household Services" class="img-fluid rounded shadow mb-4" style="max-width: 600px; height: auto;">

      <!-- Brief Info -->
      <div class="row justify-content-center mb-4">
        <div class="col-md-8">
          <p style="color: #2c3e50;">From plumbing to cleaning, we connect you with skilled professionals in just a few clicks. Reliable, affordable, and hassle-free!</p>
        </div>
      </div>

      <!-- Call to Action -->
      <router-link to="/services" class="btn btn-primary btn-lg" style="background: #2980b9; border: none; border-radius: 25px; padding: 10px 30px;">Explore Services</router-link>
    </div>
    `
};