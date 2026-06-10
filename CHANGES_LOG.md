# Dr.PrinT — Google Backend Setup Guide

## What this does
Every form on your site (Custom Order, Contact, Payment) now sends data to Google Apps Script which:
- ✅ Writes every submission to **Google Sheets** (searchable order log)
- ✅ Saves uploaded STL/STEP files to **Google Drive** (downloadable)
- ✅ Emails you a formatted order summary with Drive file links

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **+ New**
2. Name it **"Dr.PrinT Orders"**
3. Copy the Sheet ID from the URL:
   `docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

---

## Step 2 — Create a Google Drive Folder

1. Go to [drive.google.com](https://drive.google.com) → **+ New → Folder**
2. Name it **"Dr.PrinT Uploads"**
3. Open it and copy the Folder ID from the URL:
   `drive.google.com/drive/folders/**FOLDER_ID**`

---

## Step 3 — Deploy the Apps Script

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Name it **"Dr.PrinT Orders"**
3. Delete everything in the editor
4. Open `GOOGLE_APPS_SCRIPT.js` from this project and **paste the entire contents**
5. In the CONFIG block at the top, fill in:
   ```js
   NOTIFY_EMAIL:   'drprint.3dwork@gmail.com',  // already set
   SHEET_ID:       'paste your Sheet ID here',
   DRIVE_FOLDER_ID:'paste your Drive Folder ID here',
   ```
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** → **Authorize** (grant permissions once)
8. **Copy the Web App URL** — looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`

---

## Step 4 — Add the URL to the website

1. Open `src/config/api.js`
2. Replace `PASTE_YOUR_WEB_APP_URL_HERE` with your Web App URL:
   ```js
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
   ```
3. Save and redeploy to Vercel

---

## That's it ✅

**Every Custom Order submission:**
- Row added to "Custom Orders" tab in your Sheet
- Files saved to "Custom Orders" subfolder in Drive
- Email with all details + clickable Drive links

**Every Contact enquiry:**
- Row added to "Contact Enquiries" tab
- Email with enquiry summary

**Every Payment confirmation:**
- Row added to "Orders" tab
- Email with order total and items

The Sheet has a **Status** column you can update (New → In Progress → Done) to track orders.

---

## If something breaks

Check the Apps Script **Executions** log:
`script.google.com → Your project → Executions (left panel)`

Most common issue: forgot to re-deploy after editing the script. Always do **Deploy → New Deployment** (not Manage) when you make changes.
