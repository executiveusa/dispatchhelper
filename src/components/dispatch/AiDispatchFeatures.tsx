
import React from 'react';

export function Features() {
  return (
    <div className='features bg-white p-6 rounded-lg shadow-md'>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Key Features</h2>
      <ul className="space-y-2">
        <li className="flex items-center">
          <span className="mr-2 text-xl">📩</span>
          <span>AI-Powered Email & Quote Handling</span>
        </li>
        <li className="flex items-center">
          <span className="mr-2 text-xl">💬</span>
          <span>Smart AI Chatbot with Multilingual Support</span>
        </li>
        <li className="flex items-center">
          <span className="mr-2 text-xl">🎙️</span>
          <span>Voice-Enabled Assistant</span>
        </li>
        <li className="flex items-center">
          <span className="mr-2 text-xl">📊</span>
          <span>Real-Time Monitoring & Analytics</span>
        </li>
        <li className="flex items-center">
          <span className="mr-2 text-xl">📁</span>
          <span>AI Model Training via File Uploads</span>
        </li>
      </ul>
    </div>
  );
}

export default Features;
