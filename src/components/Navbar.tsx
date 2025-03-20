
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarProps {
  onSearch?: (searchTerm: string) => void;
  showSearch?: boolean;
}

const Navbar = ({ onSearch, showSearch = true }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  // Call onSearch when searchTerm changes to implement real-time filtering
  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleMobileSearch = () => {
    setIsSearchOpen(prev => !prev);
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
          {/* Desktop search */}
          {showSearch && !isMobile && (
            <div className="relative w-full max-w-xs">
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          )}
          
          {/* Mobile search icon button */}
          {showSearch && isMobile && !isSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSearch}
              className="mr-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {location.pathname === '/' && (
            <Button 
              onClick={() => navigate("/gallery")}
              className="px-3 py-1 text-sm text-white bg-bsc-blue hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-base"
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
              Upload
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile search expanded view */}
      {showSearch && isMobile && isSearchOpen && (
        <div className="py-2 bg-white border-b border-gray-200">
          <div className="container flex items-center px-4 mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
              />
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileSearch}
              className="ml-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
