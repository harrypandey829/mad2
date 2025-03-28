export default {
  template: `
    <div>
      <h2 class="text-center mb-4 fw-bold text-uppercase" style="color: #2c3e50;">Admin Home</h2>
      <!-- Download CSV Button Yahan Top Pe Add Kiya -->
      <div class="text-end mb-3">
        <button @click="csvExport" class="btn btn-secondary">Download Completed Services as CSV</button>
        <p v-if="exportStatus" class="mt-2">{{ exportStatus }}</p>
      </div>
      <div class="row">
        <div class="col-md-8">
          <h4 class="fw-bold mb-3" style="color: #34495e;">Available Services</h4>
          <div class="row">
            <div class="col-md-6 mb-3" v-for="service in services" :key="service.id">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-body">
                  <h5 class="card-title fw-bold" style="color: #2c3e50;">{{ service.service_type }}</h5>
                  <p class="card-text">
                    <strong>Base Price:</strong> ₹{{ service.base_price }}<br>
                    <strong>Time:</strong> {{ service.time_required }} mins<br>
                    <strong>Description:</strong> {{ service.description || 'No description' }}
                  </p>
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-warning btn-sm" @click="editService(service)">Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteService(service.id)">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h4 class="fw-bold mb-3" style="color: #34495e;">Create New Service</h4>
              <form @submit.prevent="createService">
                <div class="mb-3">
                  <input v-model="newService.service_type" class="form-control" placeholder="Service Type" required>
                </div>
                <div class="mb-3">
                  <input v-model.number="newService.base_price" type="number" class="form-control" placeholder="Base Price" required>
                </div>
                <div class="mb-3">
                  <input v-model.number="newService.time_required" type="number" class="form-control" placeholder="Time Required (mins)" required>
                </div>
                <div class="mb-3">
                  <textarea v-model="newService.description" class="form-control" placeholder="Description" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100">Create Service</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div v-if="editingService" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Service</h5>
              <button type="button" class="btn-close" @click="editingService = null"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input v-model="editingService.service_type" class="form-control" placeholder="Service Type" required>
              </div>
              <div class="mb-3">
                <input v-model.number="editingService.base_price" type="number" class="form-control" placeholder="Base Price" required>
              </div>
              <div class="mb-3">
                <input v-model.number="editingService.time_required" type="number" class="form-control" placeholder="Time Required (mins)" required>
              </div>
              <div class="mb-3">
                <textarea v-model="editingService.description" class="form-control" placeholder="Description" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" @click="updateService">Save</button>
              <button class="btn btn-secondary" @click="editingService = null">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      services: [],
      newService: {
        service_type: '',
        base_price: null,
        time_required: null,
        description: ''
      },
      editingService: null,
      exportStatus: ''
    };
  },
  mounted() {
    this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch services: ${response.status}`);
        this.services = await response.json();
      } catch (error) {
        console.error('Error fetching services:', error);
        alert(error.message);
      }
    },
    async createService() {
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          },
          credentials: 'include',
          body: JSON.stringify(this.newService)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Failed to create service: ${response.status}`);
        alert(data.message);
        this.fetchServices();
        this.newService = { service_type: '', base_price: null, time_required: null, description: '' };
      } catch (error) {
        console.error('Error creating service:', error);
        alert(error.message);
      }
    },
    editService(service) {
      this.editingService = { ...service };
    },
    async updateService() {
      try {
        const response = await fetch(`/api/services/${this.editingService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authentication-Token': localStorage.getItem('authToken') || ''
          },
          credentials: 'include',
          body: JSON.stringify(this.editingService)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Failed to update service: ${response.status}`);
        alert(data.message);
        this.fetchServices();
        this.editingService = null;
      } catch (error) {
        console.error('Error updating service:', error);
        alert(error.message);
      }
    },
    async deleteService(serviceId) {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Authentication-Token': localStorage.getItem('authToken') || ''
            }
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Failed to delete service: ${response.status}`);
          }
          alert('Service deleted successfully');
          this.fetchServices();
        } catch (error) {
          console.error('Error deleting service:', error);
          alert(error.message);
        }
      }
    },
    csvExport() {
      this.exportStatus = 'Processing...';
      fetch('/api/export', {
        method: 'GET',
        headers: {
          'Authentication-Token': localStorage.getItem('authToken') || ''
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to trigger export');
          return response.json();
        })
        .then(data => {
          const taskId = data.id;
          this.exportStatus = `Task ID: ${taskId}. Waiting for file...`;

          const checkResult = setInterval(() => {
            fetch(`/api/csv_result/${taskId}`, {
              method: 'GET',
              headers: {
                'Authentication-Token': localStorage.getItem('authToken') || ''
              }
            })
              .then(response => {
                if (response.ok) {
                  clearInterval(checkResult);
                  response.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `completed_services_${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    this.exportStatus = 'File downloaded!';
                  });
                } else {
                  return response.json();
                }
              })
              .then(data => {
                if (data && data.status === 'Processing') {
                  this.exportStatus = 'Still processing...';
                }
              })
              .catch(err => {
                this.exportStatus = 'Error: ' + err.message;
                clearInterval(checkResult);
              });
          }, 2000);
        })
        .catch(err => {
          this.exportStatus = 'Error: ' + err.message;
        });
    }
  }
};