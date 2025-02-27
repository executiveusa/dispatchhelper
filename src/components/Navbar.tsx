
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="font-mono text-xl font-bold text-blue-600">
          DISPATCH HELPER
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-sm font-medium hover:text-primary"
          >
            Services
          </button>
          <button 
            onClick={() => scrollToSection('integrate')} 
            className="text-sm font-medium hover:text-primary"
          >
            AI Concierge
          </button>
          <button 
            onClick={() => scrollToSection('community')} 
            className="text-sm font-medium hover:text-primary"
          >
            Experience
          </button>
          <button 
            onClick={() => scrollToSection('team')} 
            className="text-sm font-medium hover:text-primary"
          >
            Our Fleet
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-blue-600">
            Sign In
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Book Now</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
