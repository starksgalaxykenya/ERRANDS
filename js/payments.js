// Payments Module
class Payments {
    constructor() {
        this.db = window.firebaseDb;
        this.paymentsCollection = 'payments';
    }
    
    async processPayment(errandId, amount, clientId, runnerId) {
        try {
            // Calculate platform fee
            const platformFee = (amount * APP_CONFIG.platformFee) / 100;
            const runnerAmount = amount - platformFee;
            
            const payment = {
                errandId,
                clientId,
                runnerId,
                totalAmount: amount,
                platformFee,
                runnerAmount,
                status: APP_CONFIG.paymentStatuses.HELD,
                createdAt: new Date(),
                releasedAt: null
            };
            
            const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            const docRef = await addDoc(collection(this.db, this.paymentsCollection), payment);
            
            Utils.showNotification('Payment held in escrow', 'success');
            return { id: docRef.id, ...payment };
        } catch (error) {
            Utils.showNotification('Payment processing error', 'error');
            throw error;
        }
    }
    
    async releasePayment(paymentId) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            await updateDoc(doc(this.db, this.paymentsCollection, paymentId), {
                status: APP_CONFIG.paymentStatuses.RELEASED,
                releasedAt: new Date()
            });
            
            Utils.showNotification('Payment released to runner', 'success');
        } catch (error) {
            Utils.showNotification('Error releasing payment', 'error');
            throw error;
        }
    }
    
    async refundPayment(paymentId) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            await updateDoc(doc(this.db, this.paymentsCollection, paymentId), {
                status: APP_CONFIG.paymentStatuses.REFUNDED,
                refundedAt: new Date()
            });
            
            Utils.showNotification('Payment refunded to client', 'success');
        } catch (error) {
            Utils.showNotification('Error refunding payment', 'error');
            throw error;
        }
    }
    
    async getPaymentHistory(userId) {
        try {
            const { collection, query, where, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const clientQuery = query(
                collection(this.db, this.paymentsCollection),
                where('clientId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const runnerQuery = query(
                collection(this.db, this.paymentsCollection),
                where('runnerId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const [clientSnapshot, runnerSnapshot] = await Promise.all([
                getDocs(clientQuery),
                getDocs(runnerQuery)
            ]);
            
            const payments = [];
            
            clientSnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data(), type: 'sent' });
            });
            
            runnerSnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data(), type: 'received' });
            });
            
            return payments.sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.error('Get payment history error:', error);
            throw error;
        }
    }
    
    async getPlatformEarnings() {
        try {
            const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const q = query(
                collection(this.db, this.paymentsCollection),
                where('status', '==', APP_CONFIG.paymentStatuses.RELEASED)
            );
            
            const querySnapshot = await getDocs(q);
            let totalEarnings = 0;
            
            querySnapshot.forEach((doc) => {
                totalEarnings += doc.data().platformFee;
            });
            
            return totalEarnings;
        } catch (error) {
            console.error('Get platform earnings error:', error);
            throw error;
        }
    }
}

window.Payments = Payments;
