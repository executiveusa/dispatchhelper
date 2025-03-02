
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
            <p className="text-blue-100">Powerful, flexible integration</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
              alt="Data Analytics"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Data Analytics</h3>
            <p className="text-blue-100">Insights from your business data</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
              alt="Team Collaboration"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Collaboration Tools</h3>
            <p className="text-blue-100">Work together seamlessly</p>
          </div>
          <div className="p-6">
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              alt="Security"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 text-white">Enterprise Security</h3>
            <p className="text-blue-100">Bank-grade data protection</p>
          </div>
        </div>
      </div>
    </section>
  );
};
