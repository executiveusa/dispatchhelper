
import { Database, Server, Network, Users, Code, Globe, MessageSquare, Calendar, Car, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24">
        {/* Background Images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="h-full">
              <img
                src="https://images.unsplash.com/photo-1533650936985-1f44973dc248?q=80&w=2070"
                alt="Luxury Limousine with Driver"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-full hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070"
                alt="Luxury Sprinter with Driver"
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
            South Florida's premier AI-powered luxury transportation service.
            Elevating your travel experience in Miami, West Palm Beach, and beyond.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              Book Service
            </Button>
            <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 bg-transparent hover:bg-blue-50">
              Chat with AI Concierge
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-mono font-bold mb-12 text-center text-blue-600">
            /LUXURY SERVICES
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Executive Sedans"
              description="Discreet, premium transportation for business executives and discerning clients. Our fleet includes Mercedes S-Class and BMW 7 Series."
              icon={Car}
            />
            <FeatureCard
              title="Luxury Sprinters"
              description="Spacious, sophisticated group transportation with premium amenities, perfect for corporate events or group excursions."
              icon={Users}
            />
            <FeatureCard
              title="Exclusive SUVs"
              description="Elevated travel experience with Cadillac Escalades and Range Rovers for those seeking both luxury and versatility."
              icon={MapPin}
            />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-mono font-bold text-white mb-12">
            /CLIENT EXPERIENCE
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
              <Users className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Exclusive Clientele</h3>
              <p className="text-blue-100">Serving Palm Beach, Jupiter Island, and Star Island's most discerning residents</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
              <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">24/7 Availability</h3>
              <p className="text-blue-100">On-demand service for Miami, Boca Raton, and Palm Beach year-round</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
              <MessageSquare className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Concierge</h3>
              <p className="text-blue-100">Personalized service that remembers your preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integrate" className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/AI CONCIERGE</h2>
              <p className="text-lg text-blue-600/80 mb-8">
                Our proprietary AI system learns your preferences over time, anticipating your needs before you even have to ask. From preferred routes to temperature settings, we remember every detail.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-blue-600">Personalized scheduling</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-blue-600">Preference learning</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-blue-600">Real-time notifications</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1560438718-eb61ede255eb?q=80&w=1974"
                alt="Luxury chauffeur"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-mono font-bold mb-12 text-white">/OUR FLEET</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6">
              <img
                src="https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=2070"
                alt="Luxury Sedan"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-2 text-white">Executive Sedans</h3>
              <p className="text-blue-100">For discreet, premium travel</p>
            </div>
            <div className="p-6">
              <img
                src="https://images.unsplash.com/photo-1623689033113-5db1d7b6e0c7?q=80&w=1778"
                alt="Luxury SUV"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-2 text-white">Premium SUVs</h3>
              <p className="text-blue-100">Combining luxury and capability</p>
            </div>
            <div className="p-6">
              <img
                src="https://images.unsplash.com/photo-1621253768726-1929765857a7?q=80&w=2069"
                alt="Mercedes Sprinter"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-2 text-white">Luxury Sprinters</h3>
              <p className="text-blue-100">Group travel without compromise</p>
            </div>
            <div className="p-6">
              <img
                src="https://images.unsplash.com/photo-1503751071777-d2918b21bbd9?q=80&w=1770"
                alt="Stretch Limousine"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold mb-2 text-white">Classic Limousines</h3>
              <p className="text-blue-100">Timeless elegance on wheels</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">AI Dispatch Assistant</h3>
                    <p className="text-sm text-gray-500">Always online</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                    Hello, I'm your personal AI dispatch assistant. How may I help you today?
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg rounded-tr-none shadow-sm text-right">
                    I need transportation for 8 people from Palm Beach to Miami tomorrow evening.
                  </div>
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                    I'd recommend our luxury Sprinter for your group. What time should I arrange pickup, and would you like any specific amenities prepared?
                  </div>
                </div>
                <div className="mt-4 flex">
                  <input type="text" placeholder="Ask your AI assistant..." className="flex-1 p-2 border rounded-l-lg" />
                  <button className="bg-blue-600 text-white p-2 rounded-r-lg">Send</button>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/INTELLIGENT BOOKING</h2>
              <p className="text-lg mb-6">
                Our AI assistant remembers your preferences, anticipates your needs, and is available 24/7 to arrange your transportation throughout South Florida's most exclusive locations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <span>Understands natural language requests</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <span>Remembers your preferences</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <span>Suggests optimal vehicles for your needs</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <span>Provides real-time updates and confirmations</span>
                </li>
              </ul>
            </div>
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

export default Index;
