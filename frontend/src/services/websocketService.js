class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
  }

  connect() {
    try {
      // For development, we'll simulate WebSocket with polling
      // In production, you'd use: new WebSocket('ws://your-websocket-server')
      this.simulateRealTimeUpdates();
      console.log('WebSocket service initialized (simulation mode)');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  simulateRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
      this.emit('stats-update', {
        activeUsers: Math.floor(Math.random() * 50) + 100,
        todayMealPlans: Math.floor(Math.random() * 20) + 15,
        weeklyGoalProgress: Math.min(Math.random() * 100, 100)
      });
    }, 10000);

    // Simulate notifications
    setInterval(() => {
      const notifications = [
        {
          id: Date.now(),
          type: 'expiry',
          message: `${Math.floor(Math.random() * 5) + 1} items in your pantry expire soon`,
          time: 'Just now',
          urgent: Math.random() > 0.7
        },
        {
          id: Date.now() + 1,
          type: 'achievement',
          message: 'You completed your daily nutrition goal!',
          time: 'Just now',
          urgent: false
        },
        {
          id: Date.now() + 2,
          type: 'suggestion',
          message: 'New recipe suggestions based on your preferences',
          time: 'Just now',
          urgent: false
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      this.emit('notification', randomNotification);
    }, 30000);

    // Simulate activity updates
    setInterval(() => {
      const activities = [
        {
          type: 'meal-plan',
          message: 'New meal plan created by another user',
          time: new Date().toISOString()
        },
        {
          type: 'recipe',
          message: 'Popular recipe trending now',
          time: new Date().toISOString()
        }
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      this.emit('activity-update', randomActivity);
    }, 45000);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Utility methods for dashboard
  subscribeToStats(callback) {
    this.on('stats-update', callback);
  }

  subscribeToNotifications(callback) {
    this.on('notification', callback);
  }

  subscribeToActivity(callback) {
    this.on('activity-update', callback);
  }

  // Send data (for future real WebSocket implementation)
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
