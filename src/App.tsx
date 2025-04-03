
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./pages/Gallery";
import UploadPage from "./pages/UploadPage";
import DocumentDetail from "./pages/DocumentDetail";
import NotFound from "./pages/NotFound";
import { DocumentProvider } from "./context/DocumentContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DocumentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/document/:name" element={<DocumentDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DocumentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
