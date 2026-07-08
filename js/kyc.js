class KYC {
    static async submitKYC(data) {
        const userId = window.firebaseAuth.currentUser.uid;
        const frontUrl = await Utils.uploadFile(data.frontFile, `kyc/${userId}`);
        const backUrl = data.backFile ? await Utils.uploadFile(data.backFile, `kyc/${userId}`) : null;
        const selfieUrl = await Utils.uploadFile(data.selfieFile, `kyc/${userId}`);

        const kycData = {
            userId,
            idType: data.idType,
            idNumber: data.idNumber,
            frontImage: frontUrl,
            backImage: backUrl,
            selfieImage: selfieUrl,
            status: APP_CONFIG.kycStatuses.PENDING,
            submittedAt: new Date()
        };

        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await addDoc(collection(window.firebaseDb, 'kyc_verifications'), kycData);
        await User.updateProfile(userId, { kycStatus: APP_CONFIG.kycStatuses.PENDING });
        Utils.showNotification('KYC submitted for review', 'success');
    }

    static async getKYCStatus(userId) {
        const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        const q = query(collection(window.firebaseDb, 'kyc_verifications'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    static async approveKYC(kycId, userId) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await updateDoc(doc(window.firebaseDb, 'kyc_verifications', kycId), {
            status: APP_CONFIG.kycStatuses.VERIFIED,
            reviewedAt: new Date()
        });
        await User.updateProfile(userId, { kycStatus: APP_CONFIG.kycStatuses.VERIFIED });
    }

    static async rejectKYC(kycId, userId, reason) {
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
        await updateDoc(doc(window.firebaseDb, 'kyc_verifications', kycId), {
            status: APP_CONFIG.kycStatuses.REJECTED,
            rejectionReason: reason,
            reviewedAt: new Date()
        });
        await User.updateProfile(userId, { kycStatus: APP_CONFIG.kycStatuses.REJECTED });
    }
}
window.KYC = KYC;
