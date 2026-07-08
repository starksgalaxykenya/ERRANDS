// Main Application Controller
class App {
    static currentPage = 'dashboard';
    
    static async init() {
        // Initialize all modules
        window.auth = new Auth();
        window.errands = new Errands();
        window.chat = new Chat();
        window.payments = new Payments();
        
        // Setup auth listeners
        await window.auth.setupAuthListeners();
        
        // Setup routing
        this.setupRouting();
    }
    
    static async loadMainApp() {
        // Load header
        await this.loadComponent('components/header.html', 'header-container');
        
        // Load initial page
        await this.navigateTo('dashboard');
        
        // Setup navigation
        this.setupNavigation();
    }
    
    static async loadComponent(url, containerId) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            console.error(`Error loading component ${url}:`, error);
        }
    }
    
    static async navigateTo(page, params = {}) {
        this.currentPage = page;
        
        const mainContent = document.getElementById('main-content');
        
        switch(page) {
            case 'dashboard':
                mainContent.innerHTML = await this.getDashboardHTML();
                await this.loadDashboardData();
                break;
                
            case 'create-errand':
                mainContent.innerHTML = await this.getCreateErrandHTML();
                this.setupCreateErrandForm();
                break;
                
            case 'browse-errands':
                mainContent.innerHTML = await this.getBrowseErrandsHTML();
                await this.loadAvailableErrands();
                break;
                
            case 'my-errands':
                mainContent.innerHTML = await this.getMyErrandsHTML();
                await this.loadMyErrands();
                break;
                
            case 'chat':
                mainContent.innerHTML = await this.getChatHTML();
                window.chat.renderChat(params.conversationId);
                break;
                
            case 'profile':
                mainContent.innerHTML = await this.getProfileHTML();
                this.setupProfilePage();
                break;
                
            case 'kyc':
                mainContent.innerHTML = await this.getKYCHTML();
                this.setupKYCForm();
                break;
                
            case 'payments':
                mainContent.innerHTML = await this.getPaymentsHTML();
                await this.loadPaymentHistory();
                break;
        }
    }
    
    static setupNavigation() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
                
                // Update active state
                document.querySelectorAll('[data-page]').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }
    
    static setupRouting() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, e.state.params);
            }
        });
    }
    
    static async getDashboardHTML() {
        return `
            <div class="dashboard">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Total Errands</h3>
                            <p id="total-errands">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon green">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Completed</h3>
                            <p id="completed-errands">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon orange">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>In Progress</h3>
                            <p id="in-progress-errands">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon purple">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Rating</h3>
                            <p id="user-rating">0.0</p>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-2">
                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Errands</h3>
                            <button class="btn-primary" onclick="App.navigateTo('create-errand')">
                                <i class="fas fa-plus"></i> New Errand
                            </button>
                        </div>
                        <div id="recent-errands">
                            <p class="text-muted">No errands yet</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div class="quick-actions">
                            <button class="btn-outline" onclick="App.navigateTo('browse-errands')">
                                <i class="fas fa-search"></i> Browse Errands
                            </button>
                            <button class="btn-outline" onclick="App.navigateTo('chat')">
                                <i class="fas fa-comments"></i> Messages
                            </button>
                            <button class="btn-outline" onclick="App.navigateTo('profile')">
                                <i class="fas fa-user"></i> Profile
                            </button>
                            <button class="btn-outline" onclick="App.navigateTo('kyc')">
                                <i class="fas fa-id-card"></i> KYC Verification
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static async loadDashboardData() {
        // Load user stats
        const user = window.currentUserData;
        if (user) {
            document.getElementById('total-errands').textContent = user.totalErrands || 0;
            document.getElementById('completed-errands').textContent = user.completedErrands || 0;
            document.getElementById('in-progress-errands').textContent = (user.totalErrands || 0) - (user.completedErrands || 0);
            document.getElementById('user-rating').textContent = (user.rating || 0).toFixed(1);
            
            // Load recent errands
            const errands = await window.errands.getErrands();
            const recentErrands = errands.slice(0, 5);
            
            const recentErrandsContainer = document.getElementById('recent-errands');
            if (recentErrands.length > 0) {
                recentErrandsContainer.innerHTML = recentErrands.map(errand => `
                    <div class="errand-card">
                        <div class="errand-header">
                            <div>
                                <h4 class="errand-title">${errand.title}</h4>
                                <span class="badge badge-${errand.status}">${errand.status}</span>
                            </div>
                            <div class="errand-budget">${Utils.formatCurrency(errand.budget)}</div>
                        </div>
                        <p class="errand-details">${Utils.truncateText(errand.description, 100)}</p>
                        <div class="errand-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${errand.location}</span>
                            <span><i class="fas fa-calendar"></i> ${Utils.formatRelativeTime(errand.createdAt)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    static async getCreateErrandHTML() {
        const categories = APP_CONFIG.jobCategories;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h2>Create New Errand</h2>
                </div>
                
                <form id="create-errand-form">
                    <div class="form-group">
                        <label for="errand-title">Errand Title</label>
                        <input type="text" id="errand-title" required placeholder="e.g., Need house cleaning">
                    </div>
                    
                    <div class="form-group">
                        <label for="errand-category">Category</label>
                        <select id="errand-category" required>
                            <option value="">Select category</option>
                            ${categories.map(cat => `
                                <option value="${cat.id}">
                                    <i class="fas ${cat.icon}"></i> ${cat.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="errand-description">Description</label>
                        <textarea id="errand-description" rows="4" required 
                            placeholder="Describe what you need done in detail"></textarea>
                    </div>
                    
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label for="errand-budget">Budget (${APP_CONFIG.currencySymbol})</label>
                            <input type="number" id="errand-budget" required min="100" 
                                placeholder="Amount you're willing to pay">
                        </div>
                        
                        <div class="form-group">
                            <label for="errand-location">Location</label>
                            <input type="text" id="errand-location" required 
                                placeholder="Where should the errand be done?">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="errand-deadline">Deadline</label>
                        <input type="datetime-local" id="errand-deadline" required>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-paper-plane"></i> Post Errand
                    </button>
                </form>
            </div>
        `;
    }
    
    static setupCreateErrandForm() {
        document.getElementById('create-errand-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const errandData = {
                title: document.getElementById('errand-title').value,
                category: document.getElementById('errand-category').value,
                description: document.getElementById('errand-description').value,
                budget: parseFloat(document.getElementById('errand-budget').value),
                location: document.getElementById('errand-location').value,
                deadline: new Date(document.getElementById('errand-deadline').value)
            };
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            
            try {
                await window.errands.createErrand(errandData);
                App.navigateTo('dashboard');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Errand';
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
