# Deployment Guide: Freshers Day Club Registration

Follow these steps exactly to deploy the application for production.

## 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Enable Firestore:**
   - Go to Build → Firestore Database.
   - Click "Create database".
   - Start in **Production mode**.
   - Choose a location close to your college (e.g., `asia-south1` for India).
3. **Enable Authentication:**
   - Go to Build → Authentication.
   - Click "Get started".
   - Enable **Email/Password** provider.
4. **Enable Storage:**
   - Go to Build → Storage.
   - Click "Get started".
   - Start in **Production mode**.

## 2. Get Credentials

### Client Credentials
1. Go to Project Settings (gear icon) → General.
2. Scroll down to "Your apps" and click the **Web `</>`** icon.
3. Register the app (e.g., "Freshers Day App").
4. Copy the `firebaseConfig` object values. These go into `.env.local` as `NEXT_PUBLIC_FIREBASE_*`.

### Server Credentials (Admin SDK)
1. Go to Project Settings → Service Accounts.
2. Click **Generate new private key**.
3. Download the JSON file. **NEVER share this file.**
4. Open the JSON file. You need three things for `.env.local`:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (copy the *entire* string exactly, including the `\n` characters).

## 3. Local Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in `.env.local` with your Client and Server credentials.
3. Generate a secure session secret:
   ```bash
   openssl rand -base64 32
   ```
   Paste the output as `SESSION_SECRET` in `.env.local`.
4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

## 4. Deploy Security Rules & Indexes

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Edit `.firebaserc` and change `your-project-id-here` to your actual Firebase project ID.
4. Deploy rules and indexes:
   ```bash
   firebase deploy --only firestore,storage
   ```

## 5. Seed the Database & Create Admins

1. Install local dependencies:
   ```bash
   npm install
   ```
2. Seed the basic event config and placeholder clubs:
   ```bash
   npm run seed
   ```
3. Create your admin and organizer accounts:
   ```bash
   npm run create-admin admin@college.edu your_secure_password admin
   npm run create-admin organizer@college.edu another_password organizer
   ```

## 6. Local Testing

1. Run the app locally:
   ```bash
   npm run dev
   ```
2. Test the following scenarios:
   - Login at `http://localhost:3000/admin/login` using your admin account.
   - Edit the placeholder clubs (change names, upload logos).
   - Test a registration at `http://localhost:3000`.
   - Verify the leaderboard updates instantly at `http://localhost:3000/live` (login with organizer account).

## 7. Vercel Deployment

1. Push your code to a private GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. **CRITICAL:** During setup, add all the environment variables from your `.env.local` to Vercel.
   - For `FIREBASE_ADMIN_PRIVATE_KEY`, copy the string exactly as it is in your `.env.local` (with literal `\n` text).
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel production domain (e.g., `https://freshers-day.vercel.app`).
4. Click Deploy.

## 8. Event Day Checklist

- [ ] All 13 actual clubs are entered and active in the Admin Dashboard.
- [ ] Logos are uploaded and look good on the `/live` leaderboard.
- [ ] Departments and Sections are configured correctly.
- [ ] Dev Reset has been used locally to clear test data (Reset is disabled in production).
- [ ] In the Admin Dashboard, click **Open Registration** just before the event starts.
- [ ] Put the `/live` page on the projector in full screen (F11).

After the event, click **Close Registration** and click **Export CSV** to get the final data.
