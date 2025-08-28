
import React, { useState, useEffect } from "react";

export default function VideoToGif() {
  const [videoFile, setVideoFile] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preset, setPreset] = useState('small');
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [ffmpeg, setFfmpeg] = useState(null);
  const [createFFmpeg, setCreateFFmpeg] = useState(null);
  const [fetchFile, setFetchFile] = useState(null);


  // Load ffmpeg.wasm dynamically
  useEffect(() => {
    async function loadFFmpeg() {
      try {
        // Check if we can use SharedArrayBuffer
        const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
        if (!hasSharedArrayBuffer) {
          console.warn('SharedArrayBuffer not available, ffmpeg.wasm may have limited functionality');
        }

        // If UMD is already present on window, use it
        if (!(window && window.FFmpeg && window.FFmpeg.createFFmpeg)) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
            s.async = true;
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error('Failed to load ffmpeg script'));
            document.head.appendChild(s);
          });
        }

        const mod = window.FFmpeg || (window.FFmpeg && window.FFmpeg.default) || null;
        const cf = mod?.createFFmpeg || (mod?.default && mod.default.createFFmpeg);
        const ff = mod?.fetchFile || (mod?.default && mod.default.fetchFile);
        if (!cf || !ff) {
          throw new Error('createFFmpeg/fetchFile not found on ffmpeg module');
        }
        setCreateFFmpeg(() => cf);
        setFetchFile(() => ff);
        // Use CDN corePath compatible with the dist build
        const ffmpegInstance = cf({ 
          log: true, 
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
          // GitHub Pages compatibility
          wasmPath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm',
          workerPath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.worker.js'
        });
        ffmpegInstance.setProgress && ffmpegInstance.setProgress(({ ratio }) => {
          setProgress(Math.round((ratio || 0) * 100));
        });
        setFfmpeg(ffmpegInstance);
      } catch (error) {
        console.error('Failed to load ffmpeg:', error);
      }
    }
    loadFFmpeg();
  }, []);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setGifUrl(null);
  };


  const handleConvert = async () => {
    if (!videoFile || !ffmpeg || !fetchFile) return;
    setLoading(true);
    setGifUrl(null);
    setProgress(0);

    // build filter based on preset/inputs
    const vf = `fps=${fps},scale=${width}:-1:flags=lanczos`;

    try {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));
      await ffmpeg.run(
        "-i",
        "input.mp4",
        "-vf",
        vf,
        "-t",
        preset === 'short' ? '3' : preset === 'long' ? '10' : '5',
        "output.gif"
      );
      const data = ffmpeg.FS("readFile", "output.gif");
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "image/gif" }));
      setGifUrl(url);
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Video to GIF Converter</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preset</label>
            <select 
              value={preset} 
              onChange={(e) => setPreset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Small (5s, 320px)</option>
              <option value="short">Short (3s)</option>
              <option value="long">Long (10s)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FPS</label>
            <input 
              type="number" 
              min="1" 
              max="30" 
              value={fps} 
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input 
              type="number" 
              min="64" 
              max="1280" 
              value={width} 
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button 
            onClick={handleConvert} 
            disabled={!videoFile || loading || !ffmpeg || !fetchFile}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? `Converting (${progress}%)` : 'Convert to GIF'}
          </button>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{width: `${progress}%`}}
            />
          </div>
        )}

        {gifUrl && (
          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-4">GIF Output</h3>
            <div className="inline-block p-2 bg-gray-50 rounded-lg">
              <img 
                src={gifUrl} 
                alt="GIF output" 
                className="max-w-full h-auto rounded border-2 border-gray-200"
                style={{maxWidth: '480px'}}
              />
            </div>
            <div className="mt-4">
              <a 
                href={gifUrl} 
                download="output.gif"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download GIF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}