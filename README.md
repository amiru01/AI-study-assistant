# 🎓 AI Study Assistant - Web Application

A modern, responsive web-based AI Study Assistant that helps students learn smarter by automatically generating summaries, quizzes, flashcards, and voice explanations from their study materials.

## 📋 Features

- ✅ **User Authentication** - Secure login and registration with Firebase
- 📄 **File Upload** - Support for PDFs and images
- ✨ **AI Summaries** - Generate concise summaries from notes
- ❓ **Auto-Generated Quizzes** - Test knowledge with AI-created questions
- 🎴 **Smart Flashcards** - Convert notes into Q&A flashcards
- 🔊 **Voice Explanations** - Text-to-speech for audio learning
- ☁️ **Cloud Storage** - Access materials from anywhere
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Firebase account (free tier is sufficient)
- Text editor (VS Code, Sublime Text, etc.)

### Installation

1. **Clone or Download the Project**
   ```bash
   # Download the project files to your computer
   ```

2. **Set Up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Enable the following services:
      - **Authentication**: Go to Authentication > Sign-in method > Enable Email/Password
      - **Firestore Database**: Go to Firestore Database > Create database (start in test mode)
      - **Storage**: Go to Storage > Get started
   
   d. Get your Firebase configuration:
      - Go to Project Settings > General
      - Scroll to "Your apps" section
      - Click Web icon (</>) to add a web app
      - Copy the configuration object

3. **Configure Firebase in Your Project**

   Open `firebase-config.js` and replace the placeholder values:

   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY_HERE",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

4. **Add Firebase SDK to auth.html**

   Open `auth.html` and add these script tags before the closing `</body>` tag:

   ```html
   <!-- Firebase App (Core) -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>

   <!-- Firebase Authentication -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

   <!-- Firebase Firestore -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

   <!-- Firebase Storage -->
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>

   <!-- Your Firebase Config -->
   <script src="firebase-config.js"></script>
   <script src="auth.js"></script>
   ```

5. **Run the Application**

   Simply open `index.html` in your web browser, or use a local server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

   Then navigate to `http://localhost:8000`

## 📁 Project Structure

```
ai-study-assistant/
├── index.html              # Landing page
├── auth.html               # Login/Register page
├── styles.css              # Landing page styles
├── auth.css                # Authentication page styles
├── script.js               # Landing page scripts
├── auth.js                 # Authentication logic
├── firebase-config.js      # Firebase configuration
└── README.md               # This file
```

## 🎨 Pages Overview

### 1. Landing Page (`index.html`)
- Hero section with call-to-action
- Features showcase
- How it works section
- Footer with links

### 2. Authentication Page (`auth.html`)
- Tab-based interface (Login/Register)
- Form validation
- Password strength indicator
- Show/hide password toggle
- Loading states
- Toast notifications
- Firebase integration ready

## 🔧 Features Implemented

### Authentication System

#### Login Form
- ✅ Email validation
- ✅ Password validation (min 6 characters)
- ✅ Show/hide password toggle
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Loading state during submission
- ✅ Error handling with inline messages
- ✅ Success notifications

#### Register Form
- ✅ Full name validation
- ✅ Email validation
- ✅ Password strength indicator (weak/medium/strong)
- ✅ Confirm password matching
- ✅ Terms & conditions checkbox
- ✅ Show/hide password toggle
- ✅ Loading state during submission
- ✅ Error handling with inline messages
- ✅ Success notifications

#### Additional Features
- ✅ Tab switching without page reload
- ✅ Smooth animations and transitions
- ✅ Toast notification system
- ✅ Mobile responsive design
- ✅ Firebase integration structure
- ✅ Mock authentication for development

## 🔐 Firebase Integration

The authentication system is ready for Firebase integration. The following functions are prepared:

### `registerUser(email, password, name)`
Creates a new user account and stores user data in Firestore.

### `loginUser(email, password)`
Authenticates existing users with email and password.

### Current Status
- Mock authentication is enabled for development
- Uncomment Firebase code in `auth.js` after configuring Firebase
- Error handling for common Firebase auth errors included

## 🎯 Form Validation Rules

### Email
- Must not be empty
- Must be valid email format (user@domain.com)

### Password (Login)
- Must not be empty
- Minimum 6 characters

### Password (Register)
- Must not be empty
- Minimum 6 characters
- Strength indicator shows:
  - **Weak**: Basic password (< 2 criteria)
  - **Medium**: Good password (2-3 criteria)
  - **Strong**: Excellent password (4+ criteria)
  - Criteria: uppercase, lowercase, numbers, special characters

### Confirm Password
- Must match the password field

### Full Name
- Must not be empty
- Minimum 2 characters

### Terms & Conditions
- Must be checked to register

## 🎨 Design Features

- **Modern gradient backgrounds** (purple/blue theme)
- **Smooth animations** (fade in, slide up)
- **Interactive hover effects**
- **Loading spinners** for async operations
- **Toast notifications** for user feedback
- **Password strength visualization**
- **Responsive layout** for all screen sizes
- **Clean, student-friendly UI**

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: 481px - 768px (adjusted spacing)
- **Mobile**: ≤ 480px (stacked layout, simplified navigation)

## 🔄 Next Steps

To complete the AI Study Assistant, you'll need to build:

1. **Dashboard Page** - User's main interface after login
2. **Upload Page** - File upload with drag & drop
3. **Study View** - Display summaries, quizzes, flashcards
4. **Profile Page** - User settings and preferences
5. **AI Integration** - Connect OpenAI API for content generation

## 🐛 Development Mode

The app currently runs in development mode with mock authentication. This allows you to:
- Test the UI without Firebase setup
- Validate forms and see error messages
- Experience the full user flow
- See console logs for debugging

To enable real authentication:
1. Complete Firebase setup
2. Update `firebase-config.js` with your credentials
3. Uncomment Firebase code in `auth.js`
4. Add Firebase SDK scripts to `auth.html`

## 💡 Tips for Beginners

1. **Start Simple**: Test the landing page first, then move to authentication
2. **Use Browser DevTools**: Press F12 to see console logs and debug
3. **Check Firebase Console**: Monitor authentication attempts in Firebase
4. **Test Validation**: Try submitting empty forms to see error messages
5. **Mobile Testing**: Use browser DevTools device mode to test responsive design

## 📝 Code Comments

All JavaScript code is well-commented with:
- Function descriptions
- Parameter explanations
- Return value documentation
- Step-by-step logic explanations

## 🤝 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify Firebase configuration
3. Ensure all files are in the same directory
4. Test with a local server (not just file://)

## 📄 License

This project is created for educational purposes.

---

**Happy Learning! 🎓✨**
