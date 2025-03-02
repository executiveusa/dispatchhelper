
export const SaaSFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-50 to-indigo-50 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-600">DISPATCH HELPER</h3>
            <p className="text-sm text-gray-600">
              The intelligent SaaS platform for optimizing your business operations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Features</li>
              <li>Pricing</li>
              <li>API Documentation</li>
              <li>Status</li>
              <li>Roadmap</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Partners</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Center</li>
              <li>Community</li>
              <li>Developers</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-indigo-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-indigo-600 mb-4 md:mb-0">
            © 2025 DISPATCH HELPER. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              Twitter
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              LinkedIn
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
