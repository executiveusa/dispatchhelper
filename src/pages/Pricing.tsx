
import React from "react";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-mono font-bold mb-6 text-blue-600">
            TRANSPARENT PRICING
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-700">
            Choose the right plan for your luxury transportation needs. All plans include our AI-powered dispatch and concierge service.
          </p>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="py-12">
        <PricingCard />
      </section>
      
      {/* FAQs Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-mono font-bold mb-12 text-center text-blue-600">
            /FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">What vehicles are included in each plan?</h3>
              <p className="text-gray-700">All plans include access to our full fleet of luxury vehicles. The difference is in the number of bookings and additional services included.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Can I change plans later?</h3>
              <p className="text-gray-700">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Are there any hidden fees?</h3>
              <p className="text-gray-700">No hidden fees. The price you see is what you pay. Additional services like catering or extended waiting times may incur extra charges.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">What does "events" mean in the pricing?</h3>
              <p className="text-gray-700">An event refers to a one-way trip. A round trip would count as two events. Special events like weddings or corporate gatherings count as a single event.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">READY TO EXPERIENCE LUXURY?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-700">
            Our AI-powered concierge is ready to assist you with your transportation needs.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 bg-transparent hover:bg-blue-50">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-600">DISPATCH HELPER</h3>
              <p className="text-sm text-gray-600">
                South Florida's premier AI-powered luxury transportation service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Service Areas</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Miami & Miami Beach</li>
                <li>Palm Beach & West Palm</li>
                <li>Boca Raton</li>
                <li>Fort Lauderdale</li>
                <li>Jupiter & Jupiter Island</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Our Fleet</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Executive Sedans</li>
                <li>Premium SUVs</li>
                <li>Luxury Sprinters</li>
                <li>Stretch Limousines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>24/7 Booking: (800) 555-LIMO</li>
                <li>concierge@dispatchhelper.com</li>
                <li>Palm Beach Office: 350 Royal Palm Way</li>
                <li>Miami Office: 1000 Brickell Avenue</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-blue-600 mb-4 md:mb-0">
              © 2025 CHEGGIE MEDIA. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Instagram
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                LinkedIn
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
