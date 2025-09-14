'use client';

import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 max-w-lg mx-auto text-center shadow-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">You Are Banned</h1>
          
          <div className="space-y-4 text-gray-300">
            <p className="text-lg">Your account has been restricted from using this service.</p>
            <p className="text-base">If you believe this is an error or would like to appeal this decision, please contact the developer.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>Contact Developer:</strong><br />
              If you believe this is an error or would like to appeal this decision, please contact the developer using one of the methods below:
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-blue-300">
                <i className="fas fa-envelope"></i>
                <span className="text-sm">Email: support@whatsapp-dashboard.dev</span>
              </div>
            </div>
            
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-300">
                <i className="fab fa-whatsapp"></i>
                <span className="text-sm">WhatsApp: +1 (555) 123-4567</span>
              </div>
            </div>
            
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-purple-300">
                <i className="fab fa-github"></i>
                <span className="text-sm">GitHub: @whatsapp-dashboard-dev</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}