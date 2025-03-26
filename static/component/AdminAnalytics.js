export default {
    template: `
    <div>
      <h2 class="text-center mb-5 fw-bold text-uppercase" style="color: #2c3e50;">Analytics</h2>
      <div class="row">
        <div class="col-md-4 mb-4">
          <h4 class="fw-bold mb-3 text-center" style="color: #34495e;">Professionals by Services</h4>
          <canvas id="professionalChart"></canvas>
        </div>
        <div class="col-md-4 mb-4">
          <h4 class="fw-bold mb-3 text-center" style="color: #34495e;">Customers by Orders</h4>
          <canvas id="customerChart"></canvas>
        </div>
        <div class="col-md-4 mb-4">
          <h4 class="fw-bold mb-3 text-center" style="color: #34495e;">Services by Orders</h4>
          <canvas id="serviceChart"></canvas>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            analytics: { professionals: [], customers: [], services: [] }
        };
    },
    mounted() {
        this.fetchAnalytics();
    },
    methods: {
        async fetchAnalytics() {
            try {
                const response = await fetch('/api/admin/analytics', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authentication-Token': localStorage.getItem('authToken') || ''
                    }
                });
                if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.status}`);
                this.analytics = await response.json();
                this.renderCharts();
            } catch (error) {
                console.error('Error fetching analytics:', error);
                alert(error.message);
            }
        },
        renderCharts() {
            // Professional Bar Chart
            const professionalCtx = document.getElementById('professionalChart').getContext('2d');
            new Chart(professionalCtx, {
                type: 'bar',
                data: {
                    labels: this.analytics.professionals.map(p => p.name),
                    datasets: [{
                        label: 'Services Served',
                        data: this.analytics.professionals.map(p => p.services),
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true, title: { display: true, text: 'No. of Services' } } },
                    plugins: { legend: { display: false } }
                }
            });

            // Customer Pie Chart
            const customerCtx = document.getElementById('customerChart').getContext('2d');
            new Chart(customerCtx, {
                type: 'pie',
                data: {
                    labels: this.analytics.customers.map(c => c.name),
                    datasets: [{
                        label: 'Orders',
                        data: this.analytics.customers.map(c => c.orders),
                        backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
                    }]
                },
                options: {
                    plugins: { legend: { position: 'right' } }
                }
            });

            // Service Doughnut Chart
            const serviceCtx = document.getElementById('serviceChart').getContext('2d');
            new Chart(serviceCtx, {
                type: 'doughnut',
                data: {
                    labels: this.analytics.services.map(s => s.type),
                    datasets: [{
                        label: 'Orders',
                        data: this.analytics.services.map(s => s.orders),
                        backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
                    }]
                },
                options: {
                    plugins: { legend: { position: 'right' } }
                }
            });
        }
    }
};