class Notifications {
    static async send(userId, data) {
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await addDoc(collection(window.firebaseDb, 'notifications'), {
            userId,
            ...data,
            read: false,
            createdAt: new Date()
        });
    }

    static async getUserNotifications(userId) {
        const { collection, query, where, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(
            collection(window.firebaseDb, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    static async markAsRead(notificationId) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await updateDoc(doc(window.firebaseDb, 'notifications', notificationId), { read: true });
    }

    static listenForNotifications(userId, callback) {
        const { collection, query, where, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(
            collection(window.firebaseDb, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const notifs = [];
            snapshot.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
            callback(notifs);
        });
    }
}
window.Notifications = Notifications;
