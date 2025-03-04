
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const SaaSFooter = () => {
  const { toast } = useToast();

  const handleExternalLink = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Opening external link",
      description: `Navigating to ${url}`,
      duration: 3000,
    });
  };

  return (
    <footer className="bg-gradient-to-r from-purple-50 to-indigo-50 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="inline-block">
              <h3 className="text-lg font-bold mb-4 text-indigo-600">DISPATCH HELPER</h3>
            </Link>
            <p className="text-sm text-gray-600">
              The intelligent SaaS platform for optimizing your business operations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
              <li><Link to="/ai-dispatch" className="hover:text-indigo-600 transition-colors">API Documentation</Link></li>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Status",
                  description: "All systems operational",
                  duration: 3000,
                });
              }} className="hover:text-indigo-600 transition-colors">Status</a></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#team" className="hover:text-indigo-600 transition-colors">About</a></li>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Blog",
                  description: "Our blog is coming soon!",
                  duration: 3000,
                });
              }} className="hover:text-indigo-600 transition-colors">Blog</a></li>
              <li><Link to="/auth" className="hover:text-indigo-600 transition-colors">Careers</Link></li>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Press",
                  description: "Press inquiries: press@dispatchhelper.com",
                  duration: 3000,
                });
              }} className="hover:text-indigo-600 transition-colors">Press</a></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Partners</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/auth" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
              <li><Link to="/chat" className="hover:text-indigo-600 transition-colors">Community</Link></li>
              <li><Link to="/ai-dispatch" className="hover:text-indigo-600 transition-colors">Developers</Link></li>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Privacy Policy",
                  description: "Our privacy policy is available upon request",
                  duration: 3000,
                });
              }} className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Terms of Service",
                  description: "By using our services, you agree to our terms",
                  duration: 3000,
                });
              }} className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-indigo-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-indigo-600 mb-4 md:mb-0">
            © 2025 DISPATCH HELPER. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a 
              href="#" 
              onClick={(e) => handleExternalLink(e, "https://twitter.com")} 
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Twitter
            </a>
            <a 
              href="#" 
              onClick={(e) => handleExternalLink(e, "https://linkedin.com")} 
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="#" 
              onClick={(e) => handleExternalLink(e, "https://github.com")} 
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
