import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatWidget } from "@/components/chat/ChatWidget";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Conversations from "./pages/Conversations";
import LiveChat from "./pages/LiveChat";
import Analytics from "./pages/Analytics";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Shipping from "./pages/Shipping";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Shop Routes */}
            <Route path="/" element={<Shop />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/shipping" element={<Shipping />} />
            
            {/* Auth */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Customer Account - requires login */}
            <Route path="/account" element={<Account />} />
            
            {/* Protected Dashboard Routes - Staff only (admin/agent) */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRoles={['admin', 'agent']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute requiredRoles={['admin', 'agent']}>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/conversations" element={
              <ProtectedRoute requiredRoles={['admin', 'agent']}>
                <Conversations />
              </ProtectedRoute>
            } />
            <Route path="/live-chat" element={
              <ProtectedRoute requiredRoles={['admin', 'agent']}>
                <LiveChat />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRoles={['admin', 'agent']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
