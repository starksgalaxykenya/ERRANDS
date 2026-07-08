// Chat Module
class Chat {
    constructor() {
        this.db = window.firebaseDb;
        this.messagesCollection = 'messages';
        this.conversationsCollection = 'conversations';
        this.currentConversationId = null;
    }
    
    async createConversation(participants, errandId) {
        try {
            const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const conversation = {
                participants,
                errandId,
                lastMessage: '',
                lastMessageTime: new Date(),
                createdAt: new Date()
            };
            
            const docRef = await addDoc(collection(this.db, this.conversationsCollection), conversation);
            return docRef.id;
        } catch (error) {
            console.error('Create conversation error:', error);
            throw error;
        }
    }
    
    async sendMessage(conversationId, message) {
        try {
            const { collection, addDoc, doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const messageData = {
                conversationId,
                senderId: window.firebaseAuth.currentUser.uid,
                senderName: window.currentUserData.name,
                text: message,
                timestamp: new Date(),
                read: false
            };
            
            await addDoc(collection(this.db, this.messagesCollection), messageData);
            
            // Update conversation last message
            await updateDoc(doc(this.db, this.conversationsCollection, conversationId), {
                lastMessage: message,
                lastMessageTime: new Date()
            });
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    }
    
    async getMessages(conversationId) {
        try {
            const { collection, query, where, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const q = query(
                collection(this.db, this.messagesCollection),
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc')
            );
            
            return new Promise((resolve) => {
                onSnapshot(q, (snapshot) => {
                    const messages = [];
                    snapshot.forEach((doc) => {
                        messages.push({ id: doc.id, ...doc.data() });
                    });
                    resolve(messages);
                });
            });
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    }
    
    async listenToMessages(conversationId, callback) {
        try {
            const { collection, query, where, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            
            const q = query(
                collection(this.db, this.messagesCollection),
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc')
            );
            
            return onSnapshot(q, (snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
                callback(messages);
            });
        } catch (error) {
            console.error('Listen to messages error:', error);
            throw error;
        }
    }
    
    async getConversations() {
        try {
            const { collection, query, where, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
            const userId = window.firebaseAuth.currentUser.uid;
            
            const q = query(
                collection(this.db, this.conversationsCollection),
                where('participants', 'array-contains', userId),
                orderBy('lastMessageTime', 'desc')
            );
            
            return new Promise((resolve) => {
                onSnapshot(q, (snapshot) => {
                    const conversations = [];
                    snapshot.forEach((doc) => {
                        conversations.push({ id: doc.id, ...doc.data() });
                    });
                    resolve(conversations);
                });
            });
        } catch (error) {
            console.error('Get conversations error:', error);
            throw error;
        }
    }
    
    renderChat(conversationId) {
        this.currentConversationId = conversationId;
        const chatContainer = document.getElementById('chat-container');
        
        chatContainer.innerHTML = `
            <div class="chat-container">
                <div class="chat-list" id="chat-list">
                    <!-- Conversations will be loaded here -->
                </div>
                <div class="chat-main">
                    <div class="chat-header">
                        <h3 id="chat-user-name">Chat</h3>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <!-- Messages will be loaded here -->
                    </div>
                    <div class="chat-input">
                        <input type="text" id="message-input" placeholder="Type a message...">
                        <button class="btn-primary" id="send-message-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.loadConversations();
        
        if (conversationId) {
            this.loadMessages(conversationId);
        }
        
        // Send message event
        document.getElementById('send-message-btn').addEventListener('click', async () => {
            const input = document.getElementById('message-input');
            const message = input.value.trim();
            
            if (message && this.currentConversationId) {
                await this.sendMessage(this.currentConversationId, message);
                input.value = '';
            }
        });
    }
    
    async loadConversations() {
        const conversations = await this.getConversations();
        const chatList = document.getElementById('chat-list');
        
        chatList.innerHTML = conversations.map(conv => `
            <div class="chat-item ${conv.id === this.currentConversationId ? 'active' : ''}" 
                 data-conversation-id="${conv.id}">
                <div class="chat-item-header">
                    <strong>Errand #${conv.errandId.substr(0, 8)}</strong>
                    <span>${Utils.formatRelativeTime(conv.lastMessageTime)}</span>
                </div>
                <div class="chat-item-preview">
                    ${Utils.truncateText(conv.lastMessage, 50)}
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        chatList.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                this.loadMessages(item.dataset.conversationId);
            });
        });
    }
    
    async loadMessages(conversationId) {
        this.currentConversationId = conversationId;
        
        this.listenToMessages(conversationId, (messages) => {
            const chatMessages = document.getElementById('chat-messages');
            const currentUserId = window.firebaseAuth.currentUser.uid;
            
            chatMessages.innerHTML = messages.map(msg => `
                <div class="message ${msg.senderId === currentUserId ? 'sent' : 'received'}">
                    <div class="message-content">
                        <p>${msg.text}</p>
                        <small>${Utils.formatRelativeTime(msg.timestamp)}</small>
                    </div>
                </div>
            `).join('');
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
}

window.Chat = Chat;
