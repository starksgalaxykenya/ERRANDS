class Rating {
    static async submitRating(errandId, ratedUserId, rating, review) {
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const ratingData = {
            errandId,
            fromUserId: window.firebaseAuth.currentUser.uid,
            toUserId: ratedUserId,
            rating,
            review,
            createdAt: new Date()
        };
        await addDoc(collection(window.firebaseDb, 'ratings'), ratingData);
        // Update user's average rating
        await this.updateUserRating(ratedUserId);
    }

    static async updateUserRating(userId) {
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(collection(window.firebaseDb, 'ratings'), where('toUserId', '==', userId));
        const snapshot = await getDocs(q);
        let total = 0, count = 0;
        snapshot.forEach(doc => {
            total += doc.data().rating;
            count++;
        });
        const avg = count > 0 ? total / count : 0;
        await User.updateProfile(userId, { rating: avg });
    }

    static async getUserRatings(userId) {
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(collection(window.firebaseDb, 'ratings'), where('toUserId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
}
window.Rating = Rating;
