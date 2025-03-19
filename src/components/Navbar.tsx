
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavbarProps {
  onSearch?: (searchTerm: string) => void;
  showSearch?: boolean;
}

const Navbar = ({ onSearch, showSearch = true }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-14 px-4 mx-auto sm:h-16 sm:px-6">
        <div className="flex items-center">
          <h1 
            className="text-lg font-bold cursor-pointer text-bsc-blue sm:text-xl"
            onClick={() => navigate("/")}
          >
            JarvisAI
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="relative hidden w-full max-w-xs sm:block">
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </form>
          )}
          
          {location.pathname === '/' && (
            <Button 
              onClick={() => navigate("/gallery")}
              className="px-3 py-1 text-sm bg-bsc-blue hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-base"
              variant="outline"
            >
              View Gallery
            </Button>
          )}
          
          {location.pathname === '/gallery' && (
            <Button 
              onClick={() => navigate("/")}
              className="px-3 py-1 text-sm bg-bsc-blue hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-base"
            >
              Upload New
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
