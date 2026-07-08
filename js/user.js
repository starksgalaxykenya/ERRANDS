class User {
    static async getProfile(userId) {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const userDoc = await getDoc(doc(window.firebaseDb, 'users', userId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    }

    static async updateProfile(userId, data) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await updateDoc(doc(window.firebaseDb, 'users', userId), data);
    }

    static async uploadAvatar(userId, file) {
        const url = await Utils.uploadFile(file, `avatars/${userId}`);
        await User.updateProfile(userId, { avatar: url });
        return url;
    }

    static async getRunnerStats(userId) {
        // aggregate from errands
        const errands = await window.errands.getErrands({ runnerId: userId });
        const completed = errands.filter(e => e.status === APP_CONFIG.errandStatuses.COMPLETED).length;
        const totalEarnings = errands
            .filter(e => e.status === APP_CONFIG.errandStatuses.COMPLETED && e.runnerId === userId)
            .reduce((sum, e) => sum + (e.budget || 0), 0);
        return { completed, totalEarnings };
    }
}
window.User = User;
