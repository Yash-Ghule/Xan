// Service Worker (sw.js)

let timeoutMap = new Map();

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();
  event.waitUntil(clients.openWindow('index.html'));
});

self.addEventListener('message', (event) => {
  const { type, task, taskId } = event.data;

  if (type === 'schedule') {
    scheduleTaskNotifications(task);
  } else if (type === 'cancel') {
    cancelTaskNotifications(taskId);
  }
});

function scheduleTaskNotifications(task) {
  cancelTaskNotifications(task.id);

  const deadline = new Date(`${task.date}T${task.time}`).getTime();
  const now = Date.now();

  const reminders = [
    { id: `${task.id}-0`, time: deadline, title: `DEADLINE: ${task.name}` },
    { id: `${task.id}-5`, time: deadline - 5 * 60 * 1000, title: `5-MIN WARNING: ${task.name}` },
    { id: `${task.id}-30`, time: deadline - 30 * 60 * 1000, title: `30-MIN WARNING: ${task.name}` }
  ];

  reminders.forEach(reminder => {
    const delay = reminder.time - now;
    if (delay > 0) {
      console.log(`SW: Scheduling "${reminder.title}" with a ${delay}ms delay.`);
      
      // ===== UPDATED CODE BLOCK =====
      const timerId = setTimeout(async () => { // Make the callback async
        console.log(`SW: Timer fired for ${reminder.id}. Attempting to show notification...`);
        try {
          // Use await to properly handle the promise
          await self.registration.showNotification(reminder.title, {
            tag: reminder.id,
            body: `Your task is due soon!`,
            icon: 'https://placehold.co/192' 
          });
          console.log(`SW: Notification shown successfully for ${reminder.id}`);
        } catch (error) {
          // This will now log the specific error
          console.error(`SW: Error showing notification for ${reminder.id}:`, error);
        } finally {
            // Clean up the timer from our map
            timeoutMap.delete(reminder.id); 
        }
      }, delay);
      // ============================
      
      timeoutMap.set(reminder.id, timerId); 
    }
  });
}

function cancelTaskNotifications(taskId) {
  console.log(`SW: Cancelling notifications for task ${taskId}`);
  for (const [key, timerId] of timeoutMap.entries()) {
    if (key.toString().startsWith(taskId.toString())) { // Safer comparison
      clearTimeout(timerId);
      timeoutMap.delete(key);
      console.log(`SW: Cancelled timer ${key}`);
    }
  }
}