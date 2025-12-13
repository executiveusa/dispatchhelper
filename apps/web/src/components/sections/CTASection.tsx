
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
        <div className="max-w-xl md:mx-auto">
          <h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
            Ready to revolutionize your dispatch?
          </h3>
          <p className="mt-3 text-gray-600">
            Join the 200+ companies that have cut response times by 75% and increased customer satisfaction by 40% with our AI-powered platform.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-8">
          <Link to="/auth">
            <Button 
              size="lg"
              className="w-full md:w-auto bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              Start Free 14-Day Trial
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              size="lg"
              variant="outline" 
              className="w-full md:w-auto text-purple-600 border-purple-600 bg-transparent hover:bg-purple-50"
            >
              View Pricing Plans
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">No credit card required. Cancel anytime.</p>
      </div>
    </section>
  );
};
