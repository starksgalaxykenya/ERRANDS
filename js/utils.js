// Utility Functions
class Utils {
    static formatCurrency(amount) {
        return `${APP_CONFIG.currencySymbol} ${parseFloat(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    
    static formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    static formatRelativeTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 7) return this.formatDate(timestamp);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }
    
    static generateId() {
        return 'errand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    static showLoading(element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
    
    static hideLoading(element, content) {
        element.innerHTML = content;
    }
    
    static async uploadFile(file, path) {
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
        const snapshot = await fileRef.put(file);
        return await snapshot.ref.getDownloadURL();
    }
    
    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    static validatePhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    }
    
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    static getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static async confirmDialog(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Confirm</h3>
                    <p>${message}</p>
                    <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="btn-outline" id="modal-cancel">Cancel</button>
                        <button class="btn-primary" id="modal-confirm">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#modal-cancel').onclick = () => {
                modal.remove();
                resolve(false);
            };
            
            modal.querySelector('#modal-confirm').onclick = () => {
                modal.remove();
                resolve(true);
            };
        });
    }
}

window.Utils = Utils;
