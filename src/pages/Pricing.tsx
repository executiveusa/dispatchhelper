
import React from "react";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-mono font-bold mb-6 text-purple-600">
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
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-mono font-bold mb-12 text-center text-purple-600">
            /FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  What is the AI-Powered Dispatch System with SPATCHY AI?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our AI-powered dispatch system is an advanced automation and optimization platform that helps transportation, 
                  logistics, and service-based companies eliminate inefficiencies, increase profits, and enhance customer 
                  experience through AI-driven dispatching and fleet management.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does AI improve our dispatch operations?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  AI automates 80% of manual dispatch work, ensuring that drivers are assigned based on real-time data, 
                  improving response time, reducing costs, and eliminating human errors in fleet management.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does this system optimize route planning?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our system integrates with Google Maps API and AI-powered predictive routing to analyze real-time traffic 
                  conditions, suggest fastest & most fuel-efficient routes, and reduce travel time & fuel consumption.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Can the system predict demand and adjust pricing automatically?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Yes! Using AI-powered demand forecasting, our system analyzes historical and real-time data to predict 
                  demand surges and implements dynamic pricing models to increase profitability during peak hours and 
                  optimize ride availability during slow periods.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does the AI Dispatch Assistant work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our AI dispatch assistant automatically assigns the best driver based on experience & ratings, proximity & availability,
                  customer preferences, and real-time data insights. This ensures faster response times, higher efficiency, and happier customers.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does the review management system work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our system automatically posts 4 & 5-star reviews to enhance brand trust, redirects 1-3 star reviews to a 
                  private form allowing customers to vent, and triggers an automated callback within 48 hours to resolve issues 
                  before they escalate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  What kind of reporting and analytics does this system offer?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our real-time reporting dashboard (built with Streamlit) provides live fleet performance tracking, 
                  driver earnings & ride completion analytics, and customer sentiment analysis & trend forecasting.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Can this system handle multi-language support?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Yes! Our AI uses FastText AI translation to provide real-time, multi-language support, ensuring that 
                  dispatchers, drivers, and customers can communicate seamlessly in any language.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does the payment and billing system work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our system features seamless Stripe & PayPal integration to ensure quick and secure payments, automated driver 
                  payouts to reduce human errors in salary distribution, and instant invoicing & billing to improve corporate client management.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Is this system scalable for enterprise growth?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Absolutely! Our system is designed for scalability and high performance, featuring Redis caching for faster load times, 
                  automated database optimizations to prevent slowdowns, and cloud-based infrastructure to handle rapid business growth.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Does this system include mobile and PWA support?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Yes! We offer a fully optimized mobile app & Progressive Web App (PWA) with offline support for uninterrupted 
                  service in low-network areas, push notifications for instant ride assignments and updates, and admin & driver 
                  dashboards for full operational control.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Who is this system designed for?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our AI-powered dispatch solution is perfect for rideshare & transport companies to automate dispatch & fleet management, 
                  logistics & delivery services to optimize routes & reduce delivery times, corporate fleet operators to gain real-time 
                  control over large vehicle fleets, event transportation providers to streamline event-based transport logistics, and 
                  luxury & black car services to improve customer experience & driver efficiency.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-13" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  What vehicles are included in each plan?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  All plans include access to our full fleet of luxury vehicles. The difference is in the number of bookings and additional services included.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-14" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Can I change plans later?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-15" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Are there any hidden fees?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  No hidden fees. The price you see is what you pay. Additional services like catering or extended waiting times may incur extra charges.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-16" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  What does "events" mean in the pricing?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  An event refers to a one-way trip. A round trip would count as two events. Special events like weddings or corporate gatherings count as a single event.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-mono font-bold mb-6 text-purple-600">READY TO EXPERIENCE LUXURY?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-700">
            Our AI-powered concierge is ready to assist you with your transportation needs.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-purple-600 border-purple-600 bg-transparent hover:bg-purple-50">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-purple-600">SPATCHY AI</h3>
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
                <li>concierge@spatchyai.com</li>
                <li>Palm Beach Office: 350 Royal Palm Way</li>
                <li>Miami Office: 1000 Brickell Avenue</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-purple-600 mb-4 md:mb-0">
              © 2025 SPATCHY AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-purple-600 hover:text-purple-700">
                Instagram
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700">
                LinkedIn
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700">
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
