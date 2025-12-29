# Firebase Setup Guide for WiseAcademy

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps (name it `wise-academy` or similar).

## 2. Enable Authentication
1. In the left sidebar, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Select **Google** from the Sign-in method list.
4. Click **Enable**.
5. Set the **Project support email**.
6. Click **Save**.

## 3. Frontend Configuration
1. In `Project Overview` (top left gear icon > Project settings), scroll down to **Your apps**.
2. Click the **Web** icon (`</>`).
3. Register the app (e.g., "WiseAcademy Web").
4. You will see a `firebaseConfig` object. You need these values.
5. Create a file `frontend/.env.local`.
6. Copy the values from `frontend/env-example.txt` and fill them in with your keys:

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaKy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 4. Backend Configuration (Service Account)
1. In **Project settings**, go to the **Service accounts** tab.
2. Click **Generate new private key**.
3. Click **Generate key** to download the JSON file.
4. Rename this file to `service-account.json`.
5. Move this file to your `backend/` folder (ensure it is in `.gitignore` so you don't commit it!).
6. Create or update `backend/.env`:

```ini
# Add this line
GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
```

## 5. Restart Servers
After creating the `.env` files, you must restart your terminals:
- **Frontend**: `Ctrl+C` -> `npm run dev`
- **Backend**: `Ctrl+C` -> `npm run start:dev`
