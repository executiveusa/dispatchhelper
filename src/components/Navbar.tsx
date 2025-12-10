
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Zap, MessageSquare, Settings, BarChart3 } from "lucide-react";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element?.scrollIntoView({ behavior: "smooth" });
    } else if (window.location.pathname !== '/') {
      // If we're not on the home page, navigate to home and then scroll
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/spatchy-icon.svg" alt="Spatchy AI" className="w-8 h-8" />
          <span className="font-mono text-xl font-bold text-spatchy-coral">
            Spatchy AI
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
          {user && (
            <>
              <Link to="/booking" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link to="/dispatch" className="text-sm font-medium hover:text-primary">
                Management
              </Link>
              <Link to="/chat" className="text-sm font-medium hover:text-primary">
                Chat
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/pricing">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Pricing</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/dispatch">
                  <Button variant="outline" size="sm" className="text-blue-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-blue-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-primary">
                  Sign In
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
