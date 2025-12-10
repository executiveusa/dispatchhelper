
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";

export const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { title: "Mission Capabilities", path: "#features" },
    { title: "Intelligence Network", path: "#integrate" },
    { title: "Field Agents", path: "#community" },
    { title: "Clearance Levels", path: "/pricing" },
  ];

  useEffect(() => {
    document.onclick = (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-btn")) setMenuOpen(false);
    };
  }, []);

  const Brand = () => (
    <div className="flex items-center justify-between py-5 md:block">
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-mono font-bold text-blue-400 tracking-wider">DISPATCH//ZERO-SEVEN</span>
      </Link>
      <div className="md:hidden">
        <button
          className="menu-btn text-gray-700 hover:text-gray-900"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: "url('/photos/hero/hero-background.svg')",
        }}
      />
      
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      <header className="relative z-20">
        <div className={`md:hidden ${menuOpen ? "mx-2 pb-5" : "hidden"}`}>
          <Brand />
        </div>
        <nav
          className={`pb-5 md:text-sm ${menuOpen ? "absolute z-20 top-0 inset-x-0 bg-slate-900 rounded-xl mx-2 mt-2 md:mx-0 md:mt-0 md:relative md:bg-transparent border border-blue-500/30" : ""}`}
        >
          <div className="gap-x-14 items-center max-w-screen-xl mx-auto px-4 md:flex md:px-8">
            <Brand />
            <div
              className={`flex-1 items-center mt-8 md:mt-0 md:flex ${menuOpen ? "block" : "hidden"} `}
            >
              <ul className="flex-1 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0">
                {navigation.map((item, idx) => {
                  return (
                    <li key={idx} className="text-white hover:text-blue-200">
                      <a href={item.path} className="block">
                        {item.title}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <Link
                    to="/auth"
                    className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-mono font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 duration-150 rounded md:inline-flex border border-blue-400"
                  >
                    REQUEST ACCESS
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-screen-xl mx-auto px-4 py-32 md:px-8">
          <div className="space-y-8 max-w-4xl mx-auto text-center">
            {/* Classification badge */}
            <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm">
              <span className="text-blue-300 font-mono text-sm tracking-widest">[ CLASSIFIED: LEVEL 7 ACCESS ]</span>
            </div>
            
            <h1 className="text-5xl text-white font-mono font-bold mx-auto md:text-7xl leading-tight tracking-tight">
              MISSION CONTROL
              <br />
              <span className="text-blue-400">DISPATCH PROTOCOL</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-gray-300 text-xl leading-relaxed">
              Deploy AI-powered intelligence operations to coordinate field agents, track mission assets in real-time, and execute flawless dispatch protocols with 75% faster response time.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto font-mono tracking-wide border border-blue-400">
                  INITIATE PROTOCOL
                </Button>
              </Link>
              <Link to="/ai-dispatch">
                <Button size="lg" variant="outline" className="text-blue-300 border-blue-400 bg-transparent hover:bg-blue-950/50 w-full sm:w-auto font-mono tracking-wide backdrop-blur-sm">
                  VIEW OPERATIONS
                </Button>
              </Link>
            </div>
            
            {/* Stats bar - spy style */}
            <div className="flex justify-center items-center gap-x-8 text-blue-300 text-sm pt-8 flex-wrap">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white font-mono">200+</span>
                <span className="text-gray-400 font-mono text-xs tracking-wider">ACTIVE UNITS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white font-mono">75%</span>
                <span className="text-gray-400 font-mono text-xs tracking-wider">FASTER RESPONSE</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white font-mono">24/7</span>
                <span className="text-gray-400 font-mono text-xs tracking-wider">OPERATIONS</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated scan line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"
            style={{
              animation: "scan 3s linear infinite",
            }}
          />
        </div>
      </section>
      
      {/* CSS Animation for scan line */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
