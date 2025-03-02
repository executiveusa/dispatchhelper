
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24">
      {/* Background Images */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="h-full">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
              alt="Person using modern software"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-full hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
              alt="Collaboration with software"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/80"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-mono font-bold mb-6 text-blue-600">
          DISPATCH HELPER
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-700">
          The intelligent SaaS platform for optimizing your business operations.
          Streamline workflows, automate tasks, and drive efficiency.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 bg-transparent hover:bg-blue-50">
            Book a Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
