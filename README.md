# Planner Web App Walkthrough

## What was Accomplished
The Daily Routine Planner web app has been successfully constructed! 
Due to Node.js not being present on your system, we pivoted to a robust **Vanilla HTML/CSS/JS (zero-build)** architecture. This approach means the application is incredibly lightweight and requires zero complex installation—it works natively right in your browser!

## Core Features
1. **Premium Aesthetic Design**: A striking dark mode UI with glassmorphism, responsive layouts, and smooth micro-animations. Checkboxes turn a satisfying green upon completion.
2. **Interactive Checklist**: Tasks and categories are mapped directly from your Google Sheets template.
3. **Weekly Ribbon Navigation**: Quickly jump between days of the week, with Saturdays highlighted in blue and Sundays in red.
4. **Resilient Data Storage**: 
   - **Immediate Use**: Data saves locally to your browser instantly out-of-the-box (`localStorage`).
   - **Database Ready**: Contains a built-in interface ready to connect to Firebase.

## How to use the App
Simply navigate to your project directory and open the HTML file:
1. Open the folder: `C:\Users\sang8\sujPlanner`
2. Double-click the `index.html` file to open it in Chrome, Edge, or Safari.
3. Start checking off your daily habits!

## How to Set Up Firebase (For Device Sync)
To synchronize your data seamlessly across your PC and smartphone, follow these steps to plug your Firebase credentials into the app:

1. Visit the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Once the project is created, click the **Web (`</>`)** icon to register a new Web App.
3. Copy the `firebaseConfig` object provided by Firebase.
4. Open your code file `js/firebase-config.js` in any text editor.
5. Replace the placeholder values with your actual Firebase keys.
6. In your Firebase Console sidebar, select **Firestore Database** -> **Create database**.
7. Choose **Start in test mode** for immediate access.

As soon as the keys are saved into `firebase-config.js`, your planner will automatically sync to the cloud!
