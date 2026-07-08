// Application Configuration
const APP_CONFIG = {
    appName: 'ERRANDS',
    version: '1.0.0',
    
    // Platform fee percentage (can be modified in admin panel)
    platformFee: 10, // 10%
    
    // Currency
    currency: 'KES',
    currencySymbol: 'KSh',
    
    // Pagination
    itemsPerPage: 20,
    
    // File upload limits
    maxFileSize: 5 * 1024 * 1024, // 5MB
    
    // Job categories (can be modified in admin panel)
    jobCategories: [
        { id: 'custom', name: 'Custom Errand', icon: 'fa-tasks' },
        { id: 'house_cleaning', name: 'House Cleaning', icon: 'fa-broom' },
        { id: 'house_help', name: 'House Help', icon: 'fa-home' },
        { id: 'plumber', name: 'Plumber', icon: 'fa-wrench' },
        { id: 'electrician', name: 'Electrician', icon: 'fa-bolt' },
        { id: 'driver', name: 'Driver', icon: 'fa-car' },
        { id: 'gardener', name: 'Gardener', icon: 'fa-leaf' },
        { id: 'painter', name: 'Painter', icon: 'fa-paint-roller' },
        { id: 'mover', name: 'Moving Help', icon: 'fa-truck' },
        { id: 'tutor', name: 'Tutor', icon: 'fa-book' },
        { id: 'chef', name: 'Private Chef', icon: 'fa-utensils' },
        { id: 'security', name: 'Security Guard', icon: 'fa-shield-alt' }
    ],
    
    // Errand statuses
    errandStatuses: {
        OPEN: 'open',
        BIDDING: 'bidding',
        ASSIGNED: 'assigned',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        DISPUTED: 'disputed',
        CANCELLED: 'cancelled'
    },
    
    // Payment statuses
    paymentStatuses: {
        PENDING: 'pending',
        HELD: 'held_in_escrow',
        RELEASED: 'released',
        REFUNDED: 'refunded'
    },
    
    // KYC statuses
    kycStatuses: {
        NOT_SUBMITTED: 'not_submitted',
        PENDING: 'pending',
        VERIFIED: 'verified',
        REJECTED: 'rejected'
    },
    
    // Notification types
    notificationTypes: {
        NEW_BID: 'new_bid',
        BID_ACCEPTED: 'bid_accepted',
        ERRAND_ASSIGNED: 'errand_assigned',
        ERRAND_COMPLETED: 'errand_completed',
        PAYMENT_RECEIVED: 'payment_received',
        NEW_MESSAGE: 'new_message',
        DISPUTE_CREATED: 'dispute_created',
        KYC_VERIFIED: 'kyc_verified',
        RATING_RECEIVED: 'rating_received'
    }
};

// Make config globally available
window.APP_CONFIG = APP_CONFIG;
