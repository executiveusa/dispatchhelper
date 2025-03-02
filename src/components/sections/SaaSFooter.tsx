
import { Link } from "react-router-dom";

export const SaaSFooter = () => {
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
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
              <li><Link to="/ai-dispatch" className="hover:text-indigo-600 transition-colors">API Documentation</Link></li>
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Status</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">About</Link></li>
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
              <li><Link to="/auth" className="hover:text-indigo-600 transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Press</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Partners</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/auth" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
              <li><Link to="/chat" className="hover:text-indigo-600 transition-colors">Community</Link></li>
              <li><Link to="/ai-dispatch" className="hover:text-indigo-600 transition-colors">Developers</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-indigo-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-indigo-600 mb-4 md:mb-0">
            © 2025 DISPATCH HELPER. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              Twitter
            </Link>
            <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              LinkedIn
            </Link>
            <Link to="https://github.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
