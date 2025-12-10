
export const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Diagonal accent lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #3b82f6 35px, #3b82f6 37px)`
        }} />
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-400 rounded-md backdrop-blur-sm mb-4">
          <span className="text-blue-300 font-mono text-sm tracking-widest">[ TACTICAL SYSTEMS ]</span>
        </div>
        <h2 className="text-4xl font-mono font-bold mb-12 text-blue-400 tracking-wider">MISSION INFRASTRUCTURE</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-slate-900/50 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all backdrop-blur-sm">
            <img
              src="/photos/gadgets/communication-device.svg"
              alt="Secure API Interface"
              className="w-full h-48 object-contain rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white font-mono">SECURE API</h3>
            <p className="text-gray-400 text-sm">Integrate with existing infrastructure through encrypted API protocols</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all backdrop-blur-sm">
            <img
              src="/photos/gadgets/intelligence-hub.svg"
              alt="Intelligence Analytics"
              className="w-full h-48 object-contain rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white font-mono">INTEL ANALYTICS</h3>
            <p className="text-gray-400 text-sm">Real-time operational metrics with classified data visualization</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all backdrop-blur-sm">
            <img
              src="/photos/gadgets/tracking-system.svg"
              alt="Network Coordination"
              className="w-full h-48 object-contain rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white font-mono">AGENT NETWORK</h3>
            <p className="text-gray-400 text-sm">Unified command with secure messaging and mission delegation</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all backdrop-blur-sm">
            <div className="w-full h-48 flex items-center justify-center rounded-lg mb-4 bg-slate-950/50 border border-blue-500/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded border-2 border-blue-400 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white font-mono">CLASSIFIED SECURITY</h3>
            <p className="text-gray-400 text-sm">Military-grade encryption with compartmentalized data access</p>
          </div>
        </div>
      </div>
    </section>
  );
};
