# Farmit-ZM - Mobile Export Guide

This project is configured to run as a native mobile app using Capacitor.

## How to Export to Android Studio

1. **Download the Project**: Download the entire project as a ZIP file from Firebase Studio and extract it on your local machine.
2. **Install Dependencies**: Open your terminal in the project folder and run:
   ```bash
   npm install
   ```
3. **Build the Web App**: Generate the static export that Capacitor will use:
   ```bash
   npm run build
   ```
   *Note: This creates/updates the `out/` directory.*
4. **Add Android Platform**:
   ```bash
   npx cap add android
   ```
5. **Sync Assets**: Copy the `out/` folder into the Android project:
   ```bash
   npx cap sync
   ```
6. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

## Key Files for Mobile
- `out/`: The bundled web code that runs on the phone.
- `capacitor.config.ts`: Capacitor's main configuration.
- `next.config.js`: Configured for static export (`output: 'export'`).
