// Extended bid functionality
class BidsManager {
    static async getRunnerBids(runnerId) {
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(collection(window.firebaseDb, 'bids'), where('runnerId', '==', runnerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    static async acceptBid(errandId, bidId) {
        await window.errands.acceptBid(errandId, bidId);
        // Notify runner (via notifications)
        const bid = await this.getBidById(bidId);
        if (bid) {
            await Notifications.send(bid.runnerId, {
                type: APP_CONFIG.notificationTypes.BID_ACCEPTED,
                message: 'Your bid was accepted!',
                errandId
            });
        }
    }

    static async getBidById(bidId) {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const snap = await getDoc(doc(window.firebaseDb, 'bids', bidId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }
}
window.BidsManager = BidsManager;
