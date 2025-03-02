
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
        <div className="flex gap-3 items-center mt-6 md:justify-center">
          <Link to="/auth">
            <Button 
              variant="default" 
              className="bg-gray-800 hover:bg-gray-700 active:bg-gray-900 shadow-md hover:shadow-none"
            >
              Get started
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant="outline" 
              className="text-gray-800 border hover:bg-gray-50 active:bg-gray-100"
            >
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
