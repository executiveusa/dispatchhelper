
import { Code } from "lucide-react";

export const AISection = () => {
  return (
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
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-gray-500">Always online</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                  Hello, I'm your personal AI assistant. How may I help you today?
                </div>
                <div className="bg-blue-100 p-3 rounded-lg rounded-tr-none shadow-sm text-right">
                  I need to automate our team's weekly reporting process. Can you help?
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                  Absolutely! I can help set up an automated workflow that collects data, generates reports, and distributes them to your team. Would you like to schedule this on a specific day of the week?
                </div>
              </div>
              <div className="mt-4 flex">
                <input type="text" placeholder="Ask your AI assistant..." className="flex-1 p-2 border rounded-l-lg" />
                <button className="bg-blue-600 text-white p-2 rounded-r-lg">Send</button>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-mono font-bold mb-6 text-blue-600">/INTELLIGENT WORKFLOW</h2>
            <p className="text-lg mb-6">
              Our AI assistant understands your business context, learns from your team's patterns, and helps automate complex workflows with natural language commands.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Natural language processing</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Learns your business context</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Creates automated workflows</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>Provides insights and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
