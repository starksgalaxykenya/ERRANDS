// Errands Module
class Errands {
    constructor() {
        this.db = window.firebaseDb;
        this.errandsCollection = 'errands';
        this.bidsCollection = 'bids';
    }
    
    async createErrand(errandData) {
        try {
            const { collection, addDoc, doc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const errand = {
                ...errandData,
                clientId: window.firebaseAuth.currentUser.uid,
                clientName: window.currentUserData.name,
                status: APP_CONFIG.errandStatuses.OPEN,
                createdAt: new Date(),
                updatedAt: new Date(),
                bids: [],
                selectedBid: null
            };
            
            const docRef = await addDoc(collection(this.db, this.errandsCollection), errand);
            
            Utils.showNotification('Errand created successfully!', 'success');
            return { id: docRef.id, ...errand };
        } catch (error) {
            Utils.showNotification('Error creating errand', 'error');
            console.error('Create errand error:', error);
            throw error;
        }
    }
    
    async getErrands(filters = {}) {
        try {
            const { collection, query, where, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            let q = query(collection(this.db, this.errandsCollection), orderBy('createdAt', 'desc'));
            
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }
            
            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }
            
            const querySnapshot = await getDocs(q);
            const errands = [];
            
            querySnapshot.forEach((doc) => {
                errands.push({ id: doc.id, ...doc.data() });
            });
            
            return errands;
        } catch (error) {
            console.error('Get errands error:', error);
            throw error;
        }
    }
    
    async getErrand(errandId) {
        try {
            const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            const errandDoc = await getDoc(doc(this.db, this.errandsCollection, errandId));
            return errandDoc.exists() ? { id: errandDoc.id, ...errandDoc.data() } : null;
        } catch (error) {
            console.error('Get errand error:', error);
            throw error;
        }
    }
    
    async updateErrand(errandId, updates) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            await updateDoc(doc(this.db, this.errandsCollection, errandId), {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Update errand error:', error);
            throw error;
        }
    }
    
    async deleteErrand(errandId) {
        try {
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            await deleteDoc(doc(this.db, this.errandsCollection, errandId));
            Utils.showNotification('Errand deleted successfully', 'success');
        } catch (error) {
            Utils.showNotification('Error deleting errand', 'error');
            throw error;
        }
    }
    
    async submitBid(errandId, bidData) {
        try {
            const { collection, addDoc, updateDoc, doc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const bid = {
                errandId,
                runnerId: window.firebaseAuth.currentUser.uid,
                runnerName: window.currentUserData.name,
                amount: bidData.amount,
                message: bidData.message,
                estimatedTime: bidData.estimatedTime,
                status: 'pending',
                createdAt: new Date()
            };
            
            const bidRef = await addDoc(collection(this.db, this.bidsCollection), bid);
            
            // Update errand with bid reference
            await updateDoc(doc(this.db, this.errandsCollection, errandId), {
                bids: arrayUnion(bidRef.id),
                status: APP_CONFIG.errandStatuses.BIDDING
            });
            
            Utils.showNotification('Bid submitted successfully!', 'success');
            return { id: bidRef.id, ...bid };
        } catch (error) {
            Utils.showNotification('Error submitting bid', 'error');
            throw error;
        }
    }
    
    async getBids(errandId) {
        try {
            const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const q = query(
                collection(this.db, this.bidsCollection),
                where('errandId', '==', errandId)
            );
            
            const querySnapshot = await getDocs(q);
            const bids = [];
            
            querySnapshot.forEach((doc) => {
                bids.push({ id: doc.id, ...doc.data() });
            });
            
            return bids;
        } catch (error) {
            console.error('Get bids error:', error);
            throw error;
        }
    }
    
    async acceptBid(errandId, bidId) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            await updateDoc(doc(this.db, this.errandsCollection, errandId), {
                selectedBid: bidId,
                status: APP_CONFIG.errandStatuses.ASSIGNED,
                updatedAt: new Date()
            });
            
            await updateDoc(doc(this.db, this.bidsCollection, bidId), {
                status: 'accepted',
                updatedAt: new Date()
            });
            
            Utils.showNotification('Bid accepted! Runner has been assigned.', 'success');
        } catch (error) {
            Utils.showNotification('Error accepting bid', 'error');
            throw error;
        }
    }
    
    async completeErrand(errandId) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            await updateDoc(doc(this.db, this.errandsCollection, errandId), {
                status: APP_CONFIG.errandStatuses.COMPLETED,
                completedAt: new Date(),
                updatedAt: new Date()
            });
            
            Utils.showNotification('Errand marked as completed', 'success');
        } catch (error) {
            Utils.showNotification('Error completing errand', 'error');
            throw error;
        }
    }
    
    async createDispute(errandId, reason) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            await updateDoc(doc(this.db, this.errandsCollection, errandId), {
                status: APP_CONFIG.errandStatuses.DISPUTED,
                disputeReason: reason,
                disputedAt: new Date(),
                updatedAt: new Date()
            });
            
            Utils.showNotification('Dispute created. Admin will review.', 'success');
        } catch (error) {
            Utils.showNotification('Error creating dispute', 'error');
            throw error;
        }
    }
}

window.Errands = Errands;
