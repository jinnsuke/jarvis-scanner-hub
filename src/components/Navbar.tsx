
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
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center">
          <h1 
            className="text-xl font-bold cursor-pointer text-bsc-blue"
            onClick={() => navigate("/")}
          >
            JarvisAI
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
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
          
          {location.pathname !== '/upload' && (
            <Button 
              onClick={() => navigate("/upload")}
              className="bg-bsc-blue hover:bg-blue-700"
            >
              Upload
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
