// Authentication Module
class Auth {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.currentUser = null;
        
        // Auth state observer
        this.auth.onAuthStateChanged((user) => {
            this.handleAuthStateChanged(user);
        });
    }
    
    async handleAuthStateChanged(user) {
        if (user) {
            this.currentUser = user;
            const userDoc = await this.getUserData(user.uid);
            
            if (userDoc) {
                window.currentUserData = userDoc;
                
                if (userDoc.role === 'admin') {
                    document.getElementById('admin-container').style.display = 'block';
                    document.getElementById('main-container').style.display = 'none';
                } else {
                    document.getElementById('admin-container').style.display = 'none';
                    document.getElementById('main-container').style.display = 'block';
                    await App.loadMainApp();
                }
            }
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('loading-screen').style.display = 'none';
        } else {
            this.currentUser = null;
            window.currentUserData = null;
            document.getElementById('auth-container').style.display = 'flex';
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('admin-container').style.display = 'none';
            document.getElementById('loading-screen').style.display = 'none';
        }
    }
    
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            Utils.showNotification('Login successful!', 'success');
            return userCredential.user;
        } catch (error) {
            Utils.showNotification(this.getErrorMessage(error.code), 'error');
            throw error;
        }
    }
    
    async register(userData) {
        try {
            // Create auth user
            const userCredential = await this.auth.createUserWithEmailAndPassword(
                userData.email, 
                userData.password
            );
            
            // Create user profile in Firestore
            await this.createUserProfile(userCredential.user.uid, {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role,
                createdAt: new Date(),
                kycStatus: APP_CONFIG.kycStatuses.NOT_SUBMITTED,
                rating: 0,
                totalErrands: 0,
                completedErrands: 0,
                balance: 0
            });
            
            Utils.showNotification('Registration successful!', 'success');
            return userCredential.user;
        } catch (error) {
            Utils.showNotification(this.getErrorMessage(error.code), 'error');
            throw error;
        }
    }
    
    async createUserProfile(userId, data) {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await setDoc(doc(this.db, 'users', userId), data);
    }
    
    async getUserData(userId) {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const userDoc = await getDoc(doc(this.db, 'users', userId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    }
    
    async updateUserProfile(userId, data) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await updateDoc(doc(this.db, 'users', userId), data);
    }
    
    async logout() {
        try {
            await this.auth.signOut();
            Utils.showNotification('Logged out successfully', 'success');
        } catch (error) {
            Utils.showNotification('Error logging out', 'error');
        }
    }
    
    async resetPassword(email) {
        try {
            const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js");
            await sendPasswordResetEmail(this.auth, email);
            Utils.showNotification('Password reset email sent!', 'success');
        } catch (error) {
            Utils.showNotification(this.getErrorMessage(error.code), 'error');
        }
    }
    
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid credentials',
            'auth/too-many-requests': 'Too many attempts. Please try again later'
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again';
    }
    
    async setupAuthListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            try {
                await this.login(email, password);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        });
        
        // Register form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            
            if (password !== confirmPassword) {
                Utils.showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                Utils.showNotification('Password must be at least 6 characters', 'error');
                return;
            }
            
            const userData = {
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value,
                password: password,
                role: document.getElementById('reg-role').value
            };
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            
            try {
                await this.register(userData);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            }
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${tab}-form`).classList.add('active');
            });
        });
        
        // Forgot password
        document.getElementById('forgot-password').addEventListener('click', async (e) => {
            e.preventDefault();
            const email = prompt('Enter your email address:');
            if (email) {
                await this.resetPassword(email);
            }
        });
    }
}

window.Auth = Auth;
