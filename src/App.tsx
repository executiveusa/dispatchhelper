
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Dispatch from "./pages/Dispatch";
import Pricing from "./pages/Pricing";
import ChatPage from "./pages/ChatPage";
import AiDispatch from "./pages/AiDispatch";
import CommandCenter from "./pages/CommandCenter";\nimport SpatchyDesk from "./pages/SpatchyDesk";

const queryClient = new QueryClient();\n\nconst ProtectedDesk = () => {\n  const { user, loading, isAdmin } = useAuth();\n  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;\n  if (!user) return <Navigate to="/auth" replace />;\n  if (!isAdmin) return <div className="min-h-screen grid place-items-center p-6 text-sm">Admin access required.</div>;\n  return <SpatchyDesk />;\n};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/ai-dispatch" element={<AiDispatch />} />\n            <Route path="/desk" element={<ProtectedDesk />} />\n            <Route path="/desk.html" element={<ProtectedDesk />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
