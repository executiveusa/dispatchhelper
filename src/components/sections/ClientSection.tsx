
import React from "react";

export const ClientSection = () => {
  const testimonials = [
    {
      avatar: "/photos/agents/agent-profile.svg",
      name: "Agent S. Johnson",
      title: "Operations Commander // ALPHA UNIT",
      code: "SIERRA-07",
      quote:
        "Mission response time reduced from 180 to 18 minutes. Intelligence system processes 90% of field requests autonomously. Operational efficiency: exceptional.",
    },
    {
      avatar: "/photos/agents/agent-profile.svg",
      name: "Agent D. Chen",
      title: "Field Coordinator // METRO SECTOR",
      code: "DELTA-46",
      quote:
        "Agent satisfaction improved 43% post-deployment. Command now focuses on high-priority operations while routine protocols execute automatically.",
    },
    {
      avatar: "/photos/agents/agent-profile.svg",
      name: "Agent M. Rodriguez",
      title: "Fleet Operations // GREEN MILE",
      code: "MIKE-33",
      quote:
        "ROI confirmed within 30 days. Intelligence system saves 35 operational hours weekly. Mission capacity increased 28% without additional personnel.",
    },
  ];

  return (
    <section id="community" className="relative py-20 bg-slate-900">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="max-w-xl sm:text-center md:mx-auto mb-8">
          <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-4">
            <span className="text-blue-300 font-mono text-sm tracking-widest">[ FIELD REPORTS ]</span>
          </div>
          <h3 className="text-blue-400 text-4xl font-bold font-mono sm:text-4xl tracking-wider">
            ACTIVE OPERATIVES
          </h3>
          <p className="mt-3 text-gray-300">
            Mission debriefs from field commanders deploying our intelligence dispatch protocol across sectors.
          </p>
        </div>
        <div className="mt-12">
          <ul className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, idx) => (
              <li key={idx} className="bg-slate-950/80 rounded-lg border border-blue-500/30 shadow-lg backdrop-blur-sm hover:border-blue-400 transition-all">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-mono text-xs tracking-wider">CLASSIFIED REPORT</span>
                    <span className="text-green-400 font-mono text-xs">● ACTIVE</span>
                  </div>
                </div>
                <figure>
                  <blockquote>
                    <p className="text-gray-300 text-base px-4 py-1 leading-relaxed">
                      {item.quote}
                    </p>
                  </blockquote>
                  <div className="flex items-center gap-x-4 p-4 mt-6 bg-blue-950/30 border-t border-blue-500/30">
                    <img
                      src={item.avatar}
                      className="w-16 h-16 rounded border-2 border-blue-500"
                      alt={item.name}
                    />
                    <div>
                      <span className="block text-white font-semibold font-mono">
                        {item.name}
                      </span>
                      <span className="block text-blue-400 text-xs mt-0.5 font-mono">
                        {item.title}
                      </span>
                      <span className="block text-gray-500 text-xs mt-1 font-mono">
                        CODE: {item.code}
                      </span>
                    </div>
                  </div>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Tech accent overlay */}
      <div className="absolute top-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
    </section>
  );
};
