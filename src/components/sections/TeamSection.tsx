
export const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-blue-600">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-mono font-bold mb-12 text-white">/OUR SOLUTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="Developer API"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Developer API</h3>
            <p className="text-blue-100">Seamlessly integrate with your existing tech stack through our comprehensive API</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              alt="Data Analytics"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Data Analytics</h3>
            <p className="text-blue-100">Gain actionable insights with real-time performance metrics and custom dashboards</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
              alt="Team Collaboration"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Collaboration Tools</h3>
            <p className="text-blue-100">Unify your team with real-time messaging, shared inboxes, and task delegation</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1563453392212-326f5e854473"
              alt="Security"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Enterprise Security</h3>
            <p className="text-blue-100">Protect sensitive data with SOC 2 compliant infrastructure and end-to-end encryption</p>
          </div>
        </div>
      </div>
    </section>
  );
};
