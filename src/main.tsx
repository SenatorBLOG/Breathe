/// <reference types="vite/client" />
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Дебаг + fallback на случай undefined
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', googleClientId);

if (!googleClientId) {
  console.error('VITE_GOOGLE_CLIENT_ID не найден! Проверь .env и перезапусти dev');
}

createRoot(document.getElementById("root")!).render(
  <>
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <App />
    </GoogleOAuthProvider>
    <Toaster richColors position="top-right" />
  </>
);