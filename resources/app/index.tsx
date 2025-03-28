import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/styles/index.scss";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = window.ssr?.props?.googleClientId;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={"719518230029-c3pfeirnu93n8e80f0v4seqoe3f3u29a.apps.googleusercontent.com"}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>
);

// console.log(import.meta.env.VITE_APP_URL);