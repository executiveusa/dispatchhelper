
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
        <div className="max-w-xl md:mx-auto">
          <h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
            Build the future with us
          </h3>
          <p className="mt-3 text-gray-600">
            Streamline your dispatch operations with our AI-powered platform. 
            Join hundreds of businesses that have transformed their workflows.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <Link to="/auth">
            <Button 
              size="lg"
              className="w-full md:w-auto bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-none"
            >
              Get started
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              size="lg"
              variant="outline" 
              className="w-full md:w-auto text-purple-600 border-purple-600 bg-transparent hover:bg-purple-50"
            >
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
