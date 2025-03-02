
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";

export const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { title: "Features", path: "/features" },
    { title: "Integrations", path: "/integrations" },
    { title: "Customers", path: "/customers" },
    { title: "Pricing", path: "/pricing" },
  ];

  useEffect(() => {
    document.onclick = (e) => {
      const target = e.target;
      if (!target.closest(".menu-btn")) setMenuOpen(false);
    };
  }, []);

  const Brand = () => (
    <div className="flex items-center justify-between py-5 md:block">
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-2xl font-mono font-bold text-blue-600">SPATCHY AI</span>
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
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900">
      <header>
        <div className={`md:hidden ${menuOpen ? "mx-2 pb-5" : "hidden"}`}>
          <Brand />
        </div>
        <nav
          className={`pb-5 md:text-sm ${menuOpen ? "absolute z-20 top-0 inset-x-0 bg-white rounded-xl mx-2 mt-2 md:mx-0 md:mt-0 md:relative md:bg-transparent" : ""}`}
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
                      <Link to={item.path} className="block">
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    to="/auth"
                    className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 duration-150 rounded-full md:inline-flex"
                  >
                    Get Started
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
      <section className="relative">
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-20 md:px-8">
          <div className="space-y-5 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl text-white font-mono font-bold mx-auto md:text-6xl">
              AI-POWERED DISPATCH
            </h1>
            <p className="max-w-2xl mx-auto text-gray-200 text-xl">
              Streamline email handling, automate quote responses, and optimize your 
              dispatch process with our cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/ai-dispatch">
                <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-blue-800 w-full sm:w-auto">
                  Try AI Dispatch
                </Button>
              </Link>
            </div>
            <div className="flex justify-center items-center gap-x-4 text-white text-sm pt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                  </svg>
                ))}
              </div>
              <p>
                <span className="text-white font-bold">5.0</span> by over 200 users
              </p>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 m-auto max-w-xs h-[357px] blur-[118px] sm:max-w-md md:max-w-lg"
          style={{
            background:
              "linear-gradient(106.89deg, rgba(59, 130, 246, 0.3) 15.73%, rgba(14, 165, 233, 0.41) 15.74%, rgba(79, 70, 229, 0.4) 56.49%, rgba(99, 102, 241, 0.4) 115.91%)",
          }}
        ></div>
      </section>
    </div>
  );
};
