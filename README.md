# Stock Portfolio Tracker

A personal investment portfolio tracking web application built with vanilla HTML, CSS, and JavaScript, powered by Firebase and Finnhub API.

## Features

✅ **Real-time Stock Prices** - Live quotes from Finnhub API  
✅ **Multi-Portfolio Management** - Organize holdings by portfolio type  
✅ **Multi-Currency Support** - USD, HKD, EUR  
✅ **Cloud Storage** - All data stored securely in Firebase Firestore  
✅ **User Authentication** - Secure email/password login  
✅ **Performance Analytics** - Track gains, losses, and daily changes  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **CSV Compatible** - Import from existing portfolio exports  

## Portfolio Types Supported

- Sofi Stock
- LB ETF
- OSL Crypto
- Duka Crypto
- Cash
- Time Deposit

## Setup Instructions

### 1. Firebase Configuration

Your Firebase project is pre-configured. Ensure Firestore is enabled:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `view-of-fortune` project
3. Enable Firestore Database
4. Set security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
    }
  }
}
```

### 2. Enable Authentication

1. Go to Authentication section
2. Enable Email/Password provider

### 3. Deployment

1. Upload all files to your web server (stock.ckinwai.com)
2. Ensure HTTPS is enabled
3. Access via your domain

## File Structure

```
.
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Application logic
├── auth.js                 # Authentication
├── firebase-config.js      # Firebase configuration
├── README.md               # Documentation
└── .gitignore              # Git ignore rules
```

## Usage

1. **Sign Up/Sign In** - Create account with email and password
2. **Add Transaction** - Click `+` to add new stock purchase
3. **View Portfolio** - Switch between tabs to see overview, portfolios, and holdings
4. **Refresh Prices** - Click refresh icon to update live prices

## API Keys

- **Finnhub**: `d7tgc8hr01qugn0ah1b0d7tgc8hr01qugn0ah1bg`
- **Firebase**: Pre-configured in `firebase-config.js`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## CSV Import

The app is compatible with CSV exports from "My Stocks Portfolio" app. To import:

1. Export your portfolio as CSV
2. Manually add each transaction via the app UI
3. Or request CSV import feature

## Troubleshooting

**Prices not updating?**
- Check Finnhub API quota (limited to ~60 requests/minute)
- Verify symbol names are correct
- Try refreshing manually

**Firebase errors?**
- Ensure Firestore is enabled
- Check security rules are correct
- Verify email/password length

**Authentication issues?**
- Clear browser cache
- Check email is valid
- Verify password is at least 6 characters

## Future Enhancements

- [ ] CSV import functionality
- [ ] Transaction editing/deletion
- [ ] Portfolio charts and analytics
- [ ] Dividend tracking
- [ ] Tax report generation
- [ ] Watchlist
- [ ] Push notifications

## License

MIT License
