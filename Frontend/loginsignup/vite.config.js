import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
// import pic from "./src/assets/messages.png"

// console.log("vite.config.js section here-------------------------")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
    }),
  ],
  "apiKey": "your_api_key_here",

  // server: {
  //   allowedHosts: ['1416-103-15-253-94.ngrok-free.app'],
  // },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'public/firebase-messaging-sw.js'),
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'sw' ? 'firebase-messaging-sw.js' : 'assets/[name]-[hash].js';
        },
      },
    },
  },
});