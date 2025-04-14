import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DocumentProvider } from "./context/DocumentContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Gallery from "./pages/Gallery";
import UploadPage from "./pages/UploadPage";
import DocumentDetail from "./pages/DocumentDetail";
import ExportData from "./pages/ExportData";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DocumentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/upload" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/document/:name"
                element={
                  <ProtectedRoute>
                    <DocumentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/export"
                element={
                  <ProtectedRoute>
                    <ExportData />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DocumentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
