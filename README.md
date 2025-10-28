# Xan - Accountability App ⚔️

A simple, personal Progressive Web App (PWA) designed for aggressive task management and productivity tracking. Built to combat forgetfulness and provide unfiltered feedback on daily accomplishments.

---

## Features ✨

* **Task Management:** Add, edit, and delete daily tasks. Assign specific deadlines (date & time) or leave them as day-long goals.
* **Aggressive Reminders:** Get notifications 30 minutes before, 5 minutes before, and exactly at the deadline for timed tasks. (Note: Relies on PWA `setTimeout` via Service Worker, reliability may vary based on device/OS battery optimization).
* **Daily Productivity Score:** Automatically calculates the percentage of tasks completed each day.
* **"Unfiltered Truth" Feedback:** Displays motivational (or brutally honest!) messages based on the daily score.
* **"Yesterday First" Report:** When opening the app for the first time each day, it displays the previous day's final score and lists any incomplete tasks.
* **History Tracking:** The "Track" page shows a chronological list of past daily scores. Click on a past score to view the report details for that day.
* **PWA Installable:** Can be added to your phone's home screen for an app-like experience.
* **Dark Mode Toggle:** Simple theme switching.
* **Data Persistence:** Uses browser `localStorage` to save all tasks and history locally on your device.

---

## Tech Stack 🛠️

* **Frontend:** Vanilla HTML, CSS, and JavaScript (ES6+)
* **Storage:** Browser `localStorage`
* **Notifications:** Service Worker with `postMessage` and `setTimeout`
* **App Type:** Progressive Web App (PWA) using `manifest.json` and `Service Worker`

---

## Motivation 🤔

This app was built to solve the personal problem of frequently forgetting tasks and deadlines, especially when focused on other work. Standard to-do lists and notifications were too easily ignored. This app aims to provide more persistent reminders and direct, data-driven feedback on daily productivity.

---

## Setup & Installation 🚀

1.  **Clone/Download:** Get the code from this repository.
2.  **Host:** Deploy the files (`index.html`, `style.css`, `script.js`, `sw.js`, `manifest.json`, and any icon files) to a web server that supports HTTPS (required for Service Workers). A simple free option is [GitHub Pages](https://pages.github.com/).
3.  **Access:** Open the hosted URL in a compatible browser on your desktop or mobile device (Chrome, Edge, Safari recommended).
4.  **Install (Mobile):** Use the browser's "Add to Home Screen" or "Install App" option to add the PWA to your device for easy access.
5.  **Enable Notifications:** Open the app and navigate to the "Task" page. Tap the bell icon (🔔) in the header to request and grant notification permissions.
   
