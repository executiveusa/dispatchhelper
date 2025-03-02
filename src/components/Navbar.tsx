
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Zap } from "lucide-react";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-600 text-white">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-mono text-xl font-bold text-purple-600">
            DISPATCH AI
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-sm font-medium hover:text-primary"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('integrate')} 
            className="text-sm font-medium hover:text-primary"
          >
            AI Platform
          </button>
          <button 
            onClick={() => scrollToSection('community')} 
            className="text-sm font-medium hover:text-primary"
          >
            Clients
          </button>
          <button 
            onClick={() => scrollToSection('team')} 
            className="text-sm font-medium hover:text-primary"
          >
            Solutions
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/pricing">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Pricing</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-purple-600">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="text-purple-600">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-purple-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-purple-600">
                  Sign In
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
