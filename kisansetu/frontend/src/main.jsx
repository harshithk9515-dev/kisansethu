import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";

// Global error boundary for production resilience
class RootErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("Root error:", err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f9f6] flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md">
            <h1 className="font-bold text-gray-900">KisanSetu — Recovery Mode</h1>
            <p className="text-xs text-gray-600 mt-2">An unexpected error occurred. Please refresh. Your farm data is safely cached locally.</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-[#22592d] text-white px-4 py-2 rounded-lg text-xs font-bold">Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
