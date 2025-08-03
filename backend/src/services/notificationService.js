const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
  }

  createEmailTransporter() {
    if (!process.env.EMAIL_HOST) {
      console.log('Email configuration not found, email notifications disabled');
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Check for expiring pantry items and send notifications
  async checkExpiringItems() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringItems = await prisma.pantryItem.findMany({
        where: {
          expiryDate: {
            lte: threeDaysFromNow,
            gte: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      // Group by user
      const userExpiringItems = {};
      expiringItems.forEach(item => {
        const userId = item.user.id;
        if (!userExpiringItems[userId]) {
          userExpiringItems[userId] = {
            user: item.user,
            items: []
          };
        }
        userExpiringItems[userId].items.push(item);
      });

      // Send notifications to each user
      for (const [userId, data] of Object.entries(userExpiringItems)) {
        await this.sendExpiryNotification(data.user, data.items);
      }

      return {
        notificationsSent: Object.keys(userExpiringItems).length,
        itemsExpiring: expiringItems.length
      };

    } catch (error) {
      console.error('Error checking expiring items:', error);
      throw error;
    }
  }

  // Send expiry notification email
  async sendExpiryNotification(user, expiringItems) {
    if (!this.emailTransporter) {
      console.log(`Would send expiry notification to ${user.email} for ${expiringItems.length} items`);
      return;
    }

    try {
      const itemsList = expiringItems.map(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return `• ${item.name} (${item.quantity} ${item.unit}) - expires in ${daysUntilExpiry} day(s)`;
      }).join('\n');

      const emailContent = `
Hi ${user.name},

You have ${expiringItems.length} item(s) in your pantry that will expire soon:

${itemsList}

Consider using these ingredients in your next meal plan to avoid waste!

Best regards,
SmartMealBuddy Team
      `;

      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@smartmealbuddy.com',
        to: user.email,
        subject: '🥕 Pantry Items Expiring Soon - SmartMealBuddy',
        text: emailContent,
        html: this.generateExpiryEmailHTML(user, expiringItems)
      });

      console.log(`Expiry notification sent to ${user.email}`);

    } catch (error) {
      console.error(`Failed to send expiry notification to ${user.email}:`, error);
    }
  }

  // Generate HTML email for expiry notifications
  generateExpiryEmailHTML(user, expiringItems) {
    const itemsHTML = expiringItems.map(item => {
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      const urgencyClass = daysUntilExpiry <= 1 ? 'urgent' : 'warning';
      
      return `
        <div class="item ${urgencyClass}">
          <strong>${item.name}</strong>
          <span class="quantity">${item.quantity} ${item.unit}</span>
          <span class="expiry">Expires in ${daysUntilExpiry} day(s)</span>
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; }
    .item { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #fbbf24; }
    .item.urgent { border-left-color: #ef4444; }
    .quantity { float: right; color: #666; }
    .expiry { display: block; font-size: 0.9em; color: #666; margin-top: 5px; }
    .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    .cta-button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥕 Pantry Alert</h1>
      <p>Items expiring soon in your pantry</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>You have <strong>${expiringItems.length}</strong> item(s) in your pantry that will expire soon:</p>
      
      ${itemsHTML}
      
      <p>Consider using these ingredients in your next meal plan to avoid waste!</p>
      
      <a href="${process.env.FRONTEND_URL}/pantry" class="cta-button">View My Pantry</a>
      <a href="${process.env.FRONTEND_URL}/recipes/pantry/suggestions" class="cta-button">Get Recipe Ideas</a>
    </div>
    
    <div class="footer">
      <p>SmartMealBuddy - Your Intelligent Meal Planning Companion</p>
      <p><small>You're receiving this because you have pantry notifications enabled.</small></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Send meal plan reminder
  async sendMealPlanReminder(user, mealPlan) {
    if (!this.emailTransporter) {
      console.log(`Would send meal plan reminder to ${user.email}`);
      return;
    }

    try {
      const emailContent = `
Hi ${user.name},

Your meal plan "${mealPlan.name}" starts tomorrow! Here's what you have planned:

Week of ${new Date(mealPlan.startDate).toLocaleDateString()} - ${new Date(mealPlan.endDate).toLocaleDateString()}

Don't forget to check your grocery list and prep ingredients for a smooth week ahead.

Happy cooking!
SmartMealBuddy Team
      `;

      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@smartmealbuddy.com',
        to: user.email,
        subject: '📅 Your Meal Plan Starts Tomorrow - SmartMealBuddy',
        text: emailContent,
        html: this.generateMealPlanReminderHTML(user, mealPlan)
      });

      console.log(`Meal plan reminder sent to ${user.email}`);

    } catch (error) {
      console.error(`Failed to send meal plan reminder to ${user.email}:`, error);
    }
  }

  // Generate HTML for meal plan reminder
  generateMealPlanReminderHTML(user, mealPlan) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; }
    .meal-plan { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Meal Plan Reminder</h1>
      <p>Your meal plan starts tomorrow!</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.name},</p>
      
      <div class="meal-plan">
        <h3>${mealPlan.name}</h3>
        <p><strong>Duration:</strong> ${new Date(mealPlan.startDate).toLocaleDateString()} - ${new Date(mealPlan.endDate).toLocaleDateString()}</p>
        <p>Your delicious meal plan is ready to go! Make sure you have all your ingredients ready.</p>
      </div>
      
      <p>Pro tips for meal plan success:</p>
      <ul>
        <li>✅ Check your grocery list one more time</li>
        <li>🥘 Prep ingredients the night before</li>
        <li>⏰ Set cooking reminders on your phone</li>
        <li>📱 Keep the SmartMealBuddy app handy for recipes</li>
      </ul>
      
      <a href="${process.env.FRONTEND_URL}/meal-plans/${mealPlan.id}" class="cta-button">View Meal Plan</a>
      <a href="${process.env.FRONTEND_URL}/grocery-lists" class="cta-button">Check Grocery List</a>
    </div>
    
    <div class="footer">
      <p>SmartMealBuddy - Your Intelligent Meal Planning Companion</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Send weekly meal planning suggestion
  async sendWeeklyPlanSuggestion(user) {
    if (!this.emailTransporter) {
      console.log(`Would send weekly suggestion to ${user.email}`);
      return;
    }

    try {
      const emailContent = `
Hi ${user.name},

It's time to plan your meals for the upcoming week! 

Based on your preferences and pantry items, we have some great suggestions ready for you.

Start planning now to ensure a healthy and delicious week ahead!

Best regards,
SmartMealBuddy Team
      `;

      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@smartmealbuddy.com',
        to: user.email,
        subject: '🍽️ Time to Plan Your Weekly Meals - SmartMealBuddy',
        text: emailContent,
        html: this.generateWeeklySuggestionHTML(user)
      });

      console.log(`Weekly suggestion sent to ${user.email}`);

    } catch (error) {
      console.error(`Failed to send weekly suggestion to ${user.email}:`, error);
    }
  }

  // Generate HTML for weekly suggestion
  generateWeeklySuggestionHTML(user) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; }
    .suggestion-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
    .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    .cta-button { background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Weekly Meal Planning</h1>
      <p>Time to plan your delicious week ahead!</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.name},</p>
      
      <div class="suggestion-box">
        <h3>🎯 This Week's Focus</h3>
        <p>Based on your preferences and goals, here are some ideas for this week:</p>
        <ul>
          <li>🥗 Try 2-3 new healthy recipes</li>
          <li>🍳 Use up ingredients from your pantry</li>
          <li>⏱️ Plan some quick 20-minute meals for busy days</li>
          <li>🥘 Prep one slow-cooker meal for easy cooking</li>
        </ul>
      </div>
      
      <p>Ready to create your perfect meal plan?</p>
      
      <a href="${process.env.FRONTEND_URL}/meal-plans" class="cta-button">Start Planning</a>
      <a href="${process.env.FRONTEND_URL}/recipes/random/suggestions" class="cta-button">Browse Recipes</a>
    </div>
    
    <div class="footer">
      <p>SmartMealBuddy - Your Intelligent Meal Planning Companion</p>
      <p><small>You can manage your notification preferences in your account settings.</small></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Check for users who need meal plan reminders
  async checkMealPlanReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const mealPlansStartingTomorrow = await prisma.mealPlan.findMany({
        where: {
          startDate: {
            gte: tomorrow,
            lt: nextDay
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      for (const mealPlan of mealPlansStartingTomorrow) {
        await this.sendMealPlanReminder(mealPlan.user, mealPlan);
      }

      return {
        remindersSent: mealPlansStartingTomorrow.length
      };

    } catch (error) {
      console.error('Error checking meal plan reminders:', error);
      throw error;
    }
  }

  // Send weekly planning suggestions to all users
  async sendWeeklyPlanSuggestions() {
    try {
      // Send on Sundays to plan for the upcoming week
      const today = new Date();
      if (today.getDay() !== 0) { // 0 = Sunday
        return { message: 'Weekly suggestions only sent on Sundays' };
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      let suggestionsSent = 0;
      for (const user of users) {
        await this.sendWeeklyPlanSuggestion(user);
        suggestionsSent++;
        
        // Add delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        suggestionsSent
      };

    } catch (error) {
      console.error('Error sending weekly suggestions:', error);
      throw error;
    }
  }

  // Create in-app notification
  async createInAppNotification(userId, type, title, message, data = {}) {
    try {
      // This would require a notifications table in the database
      // For now, we'll just log it
      console.log(`In-app notification for user ${userId}:`, {
        type,
        title,
        message,
        data
      });

      // In a real implementation, you would:
      // 1. Save to notifications table
      // 2. Send via WebSocket to connected clients
      // 3. Update notification count in user session

      return {
        success: true,
        notificationId: `notif_${Date.now()}`
      };

    } catch (error) {
      console.error('Error creating in-app notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
