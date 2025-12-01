// Notification Service for Election Calendar
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.permission === 'denied') {
      throw new Error('Notifications have been denied');
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return this.permission === 'granted';
  }

  // Show immediate notification
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted or not supported');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    };

    return new Notification(title, defaultOptions);
  }

  // Schedule notification for upcoming election
  scheduleElectionReminder(election, minutesBefore = 60) {
    const electionStart = new Date(election.startDate);
    const reminderTime = new Date(electionStart.getTime() - (minutesBefore * 60 * 1000));
    const now = new Date();

    if (reminderTime <= now) {
      console.warn('Cannot schedule reminder: election starts too soon');
      return null;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      this.showElectionReminder(election);
    }, timeUntilReminder);

    // Store the timeout ID for potential cancellation
    const reminderId = `election_${election.id}_${minutesBefore}`;
    this.storeReminder(reminderId, timeoutId, election, reminderTime);

    return reminderId;
  }

  // Show election reminder notification
  showElectionReminder(election) {
    const timeUntilStart = this.getTimeUntilStart(election);
    
    this.showNotification(`Election Starting Soon: ${election.title}`, {
      body: `${election.title} starts ${timeUntilStart}. Don't forget to vote!`,
      icon: '/election-icon.png',
      tag: `election_${election.id}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { election }
    });
  }

  // Store reminder in localStorage
  storeReminder(reminderId, timeoutId, election, reminderTime) {
    const reminders = this.getStoredReminders();
    reminders[reminderId] = {
      timeoutId,
      election,
      reminderTime: reminderTime.toISOString(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('electionReminders', JSON.stringify(reminders));
  }

  // Get stored reminders
  getStoredReminders() {
    try {
      const stored = localStorage.getItem('electionReminders');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading stored reminders:', error);
      return {};
    }
  }

  // Cancel reminder
  cancelReminder(reminderId) {
    const reminders = this.getStoredReminders();
    const reminder = reminders[reminderId];
    
    if (reminder && reminder.timeoutId) {
      clearTimeout(reminder.timeoutId);
      delete reminders[reminderId];
      localStorage.setItem('electionReminders', JSON.stringify(reminders));
      return true;
    }
    return false;
  }

  // Get time until election starts (human readable)
  getTimeUntilStart(election) {
    const now = new Date();
    const start = new Date(election.startDate);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs <= 0) return 'now';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    return 'in less than a minute';
  }

  // Restore reminders on page load
  restoreReminders() {
    const reminders = this.getStoredReminders();
    const now = new Date();

    Object.entries(reminders).forEach(([reminderId, reminder]) => {
      const reminderTime = new Date(reminder.reminderTime);
      
      // Clean up expired reminders
      if (reminderTime <= now) {
        delete reminders[reminderId];
        return;
      }

      // Reschedule active reminders
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        this.showElectionReminder(reminder.election);
      }, timeUntilReminder);

      // Update the timeout ID
      reminders[reminderId].timeoutId = timeoutId;
    });

    localStorage.setItem('electionReminders', JSON.stringify(reminders));
  }

  // Clear all reminders
  clearAllReminders() {
    const reminders = this.getStoredReminders();
    Object.values(reminders).forEach(reminder => {
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
    });
    localStorage.removeItem('electionReminders');
  }
}

// Calendar Export Service
class CalendarExportService {
  
  // Generate ICS file content
  generateICS(election) {
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text) => {
      return text.replace(/\\/g, '\\\\')
                 .replace(/;/g, '\\;')
                 .replace(/,/g, '\\,')
                 .replace(/\n/g, '\\n');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusVote//Election Calendar//EN',
      'BEGIN:VEVENT',
      `UID:election-${election.id}@campusvote.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${escapeText(election.title)}`,
      `DESCRIPTION:${escapeText(election.description)}\\n\\nOrganizer: ${escapeText(election.organizer)}\\nLocation: ${escapeText(election.location)}`,
      `LOCATION:${escapeText(election.location)}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(election.title)} starts in 1 hour`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  // Download ICS file
  downloadICS(election) {
    const icsContent = this.generateICS(election);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `election-${election.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Generate Google Calendar URL
  generateGoogleCalendarURL(election) {
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: election.title,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: `${election.description}\n\nOrganizer: ${election.organizer}\nLocation: ${election.location}\nPositions: ${election.positions?.join(', ') || 'N/A'}`,
      location: election.location,
      trp: 'false'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // Generate Outlook Calendar URL
  generateOutlookURL(election) {
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    const params = new URLSearchParams({
      subject: election.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: `${election.description}\n\nOrganizer: ${election.organizer}\nLocation: ${election.location}`,
      location: election.location
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  // Export to various calendar services
  exportToCalendar(election, service = 'google') {
    switch (service.toLowerCase()) {
      case 'google':
        window.open(this.generateGoogleCalendarURL(election), '_blank');
        break;
      case 'outlook':
        window.open(this.generateOutlookURL(election), '_blank');
        break;
      case 'ics':
        this.downloadICS(election);
        break;
      default:
        throw new Error(`Unsupported calendar service: ${service}`);
    }
  }

  // Show export options modal
  showExportOptions(election, onSelect) {
    // Available options: google, outlook, ics
    // This would typically be handled by a modal component
    // For now, just show a simple confirm dialog
    const choice = window.confirm(
      `Export "${election.title}" to calendar?\n\n` +
      'This will open your calendar application or download an ICS file.'
    );

    if (choice && onSelect) {
      onSelect('google'); // Default to Google Calendar
    }

    return choice;
  }
}

// Create singleton instances
const notificationService = new NotificationService();
const calendarExportService = new CalendarExportService();

// Initialize notification service on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    notificationService.restoreReminders();
  });

  // Handle notification clicks
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { action, election } = event.data;
        
        if (action === 'view' && election) {
          // Navigate to election details
          window.location.hash = `#election/${election.id}`;
        }
      }
    });
  }
}

export { notificationService, calendarExportService };

const services = { notificationService, calendarExportService };
export default services;
