import { useState } from "react";

const CodeBlock = () => {
  const [activeTab, setActiveTab] = useState("javascript");

  const code = {
    javascript: `// Query on embedded documents
const cursor = db.collection('orders').find({
  'customer.name': 'Cameron Williamson'
});

// Process multiple documents and return
// computed results with aggregation operations
db.customers.aggregate([
  {$match: {
    'customer.name': 'Cameron Williamson'
  }}
]);`,
    python: `# Query on embedded documents
cursor = db.collection('orders').find({
    'customer.name': 'Cameron Williamson'
})

# Process multiple documents and return
# computed results with aggregation operations
db.customers.aggregate([
    {'$match': {
        'customer.name': 'Cameron Williamson'
    }}
])`,
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => setActiveTab("javascript")}
          className={`px-4 py-2 rounded-t-lg text-sm font-mono ${
            activeTab === "javascript"
              ? "bg-black/90 text-white"
              : "bg-black/20 text-gray-400"
          }`}
        >
          JavaScript
        </button>
        <button
          onClick={() => setActiveTab("python")}
          className={`px-4 py-2 rounded-t-lg text-sm font-mono ${
            activeTab === "python"
              ? "bg-black/90 text-white"
              : "bg-black/20 text-gray-400"
          }`}
        >
          Python
        </button>
      </div>
      <pre className="code-block">
        <code>{code[activeTab as keyof typeof code]}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;