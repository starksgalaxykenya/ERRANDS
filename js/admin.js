class Admin {
    static async init() {
        // Check if user is admin
        if (!window.currentUserData || window.currentUserData.role !== 'admin') {
            window.location.hash = '#/';
            return;
        }
        this.loadDashboard();
    }

    static async loadDashboard() {
        const main = document.getElementById('admin-main');
        main.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon purple"><i class="fas fa-users"></i></div>
                    <div class="stat-info"><h3>Total Users</h3><p id="admin-total-users">0</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-tasks"></i></div>
                    <div class="stat-info"><h3>Total Errands</h3><p id="admin-total-errands">0</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-info"><h3>Open Disputes</h3><p id="admin-open-disputes">0</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-money-bill"></i></div>
                    <div class="stat-info"><h3>Platform Earnings</h3><p id="admin-platform-earnings">0</p></div>
                </div>
            </div>
            <div class="card">
                <h3>Quick Actions</h3>
                <button class="btn-primary" onclick="Admin.manageUsers()">Manage Users</button>
                <button class="btn-primary" onclick="Admin.viewDisputes()">View Disputes</button>
                <button class="btn-primary" onclick="Admin.kycApprovals()">KYC Approvals</button>
                <button class="btn-primary" onclick="Admin.settings()">Platform Settings</button>
            </div>
        `;
        // Fetch stats
        const usersSnap = await (await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js")).getDocs(collection(window.firebaseDb, 'users'));
        document.getElementById('admin-total-users').textContent = usersSnap.size;

        const errandsSnap = await (await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js")).getDocs(collection(window.firebaseDb, 'errands'));
        document.getElementById('admin-total-errands').textContent = errandsSnap.size;

        const disputesSnap = await (await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js")).getDocs(query(collection(window.firebaseDb, 'errands'), where('status', '==', APP_CONFIG.errandStatuses.DISPUTED)));
        document.getElementById('admin-open-disputes').textContent = disputesSnap.size;

        const earnings = await window.payments.getPlatformEarnings();
        document.getElementById('admin-platform-earnings').textContent = Utils.formatCurrency(earnings);
    }

    static async manageUsers() {
        // Implement user management
    }

    static async viewDisputes() {
        // Implement dispute resolution
    }

    static async kycApprovals() {
        // Implement KYC review
    }

    static async settings() {
        // settings page for platform fee, job categories, etc.
    }
}
window.Admin = Admin;
