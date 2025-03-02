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
            Choose the right plan for your business needs. All plans include our AI-powered automation and workflow tools.
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
                  What is the AI-Powered Platform with DISPATCH AI?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our AI-powered platform is an advanced automation and optimization solution that helps businesses 
                  eliminate inefficiencies, increase productivity, and enhance workflow management through AI-driven 
                  insights and automated processes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does AI improve our business operations?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  AI automates 80% of manual work, ensuring that tasks are assigned based on real-time data, 
                  improving response time, reducing costs, and eliminating human errors in workflow management.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does this system optimize workflows?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our system integrates with popular business tools and AI-powered predictive analytics to analyze real-time 
                  conditions, suggest optimal workflows, and reduce repetitive tasks & manual intervention.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  Can the system predict demand and adjust resource allocation automatically?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Yes! Using AI-powered demand forecasting, our system analyzes historical and real-time data to predict 
                  demand surges and implements dynamic resource allocation to increase efficiency during peak times and 
                  optimize resource availability during slow periods.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-white rounded-lg shadow-sm px-6">
                <AccordionTrigger className="text-xl font-semibold text-purple-600 py-4">
                  How does the AI Assistant work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4">
                  Our AI assistant automatically assigns the best resources based on expertise & availability,
                  project requirements, user preferences, and real-time data insights. This ensures faster response times, 
                  higher efficiency, and improved customer satisfaction.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-mono font-bold mb-6 text-purple-600">READY TO TRANSFORM YOUR BUSINESS?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-700">
            Our AI-powered platform is ready to help you streamline operations and boost productivity.
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
              <h3 className="text-lg font-bold mb-4 text-purple-600">DISPATCH AI</h3>
              <p className="text-sm text-gray-600">
                The intelligent SaaS platform for optimizing your business operations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Workflow Automation</li>
                <li>Data Analytics</li>
                <li>AI Assistant</li>
                <li>Team Collaboration</li>
                <li>API Integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Support: help@dispatchai.com</li>
                <li>Sales: sales@dispatchai.com</li>
                <li>Phone: (800) 555-1234</li>
                <li>New York Office: 500 Madison Avenue</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-purple-600 mb-4 md:mb-0">
              © 2025 DISPATCH AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-purple-600 hover:text-purple-700">
                Twitter
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700">
                LinkedIn
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
