
import React from 'react';
import VideoToGif from './VideoToGif';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Video Tools</h1>
          <p className="text-gray-600">A set of handy tools for creators</p>
        </header>
        <main className="max-w-4xl mx-auto">
          <VideoToGif />
        </main>
      </div>
    </div>
  );
}

export default App;
