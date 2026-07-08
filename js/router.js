class Router {
    static init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    static handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        if (hash.startsWith('admin')) {
            if (window.currentUserData?.role === 'admin') {
                document.getElementById('admin-container').style.display = 'block';
                document.getElementById('main-container').style.display = 'none';
                // Admin routing
            }
        } else {
            document.getElementById('admin-container').style.display = 'none';
            document.getElementById('main-container').style.display = 'block';
            App.navigateTo(hash);
        }
    }
}
window.Router = Router;
