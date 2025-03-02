
import { Users, Calendar, MessageSquare } from "lucide-react";

export const ClientSection = () => {
  return (
    <section id="community" className="py-24 bg-blue-600">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-mono font-bold text-white mb-12">
          /CLIENT EXPERIENCE
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
            <Users className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise Ready</h3>
            <p className="text-blue-100">Trusted by Fortune 500 companies for mission-critical operations</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
            <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Support</h3>
            <p className="text-blue-100">Round-the-clock expert support with 15-minute response time SLA</p>
          </div>
          <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
            <MessageSquare className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Assistance</h3>
            <p className="text-blue-100">Intelligent suggestions and automations powered by machine learning</p>
          </div>
        </div>
      </div>
    </section>
  );
};
