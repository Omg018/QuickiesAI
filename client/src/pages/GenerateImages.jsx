import React, { useState } from 'react'
import { Sparkles, Download, Globe, RefreshCw, Wand2, Monitor, Smartphone, Square } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const GenerateImages = () => {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [creationId, setCreationId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedUrl(null);
    setCreationId(null);
    setIsPublished(false);

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:3001/api/ai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, style, aspectRatio })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedUrl(data.imageUrl);
        setCreationId(data.creation.id);
      } else {
        alert(data.message || "Failed to generate image.");
      }
    } catch (err) {
      console.error("Image generation failed:", err);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const url = generatedUrl.startsWith('http') ? generatedUrl : `http://localhost:3001${generatedUrl}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublish = async () => {
    if (!creationId) return;
    setPublishing(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/ai/creations/${creationId}/publish`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setIsPublished(true);
        alert("Image published to Community Showcase!");
      }
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setPublishing(false);
    }
  };

  const styles = [
    { name: 'Cinematic', label: '🎬 Cinematic' },
    { name: 'Anime', label: '🌸 Anime Style' },
    { name: 'Realistic', label: '📷 Photographic' },
    { name: 'Cyberpunk', label: '⚡ Cyberpunk' },
    { name: '3D Render', label: '🎮 3D Render' },
    { name: 'Fantasy', label: '🧙 Fantasy Art' }
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)', icon: <Square className="w-4 h-4" /> },
    { value: '16:9', label: 'Landscape (16:9)', icon: <Monitor className="w-4 h-4" /> },
    { value: '9:16', label: 'Portrait (9:16)', icon: <Smartphone className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">AI Image Generator</h1>
        <p className="text-gray-600">Turn your ideas into breathtaking graphics instantly using AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Controls */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">1. Image Prompt</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate (e.g. 'A cozy cabin in the woods at sunset, digital painting'...)"
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-gray-400"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">2. Choose Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setStyle(s.name)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                    style === s.name
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">3. Aspect Ratio</h2>
            <div className="space-y-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition ${
                    aspectRatio === ratio.value
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {ratio.icon}
                  <span>{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
              isGenerating || !prompt.trim()
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Masterpiece...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Right Side: Showcase */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center min-h-[500px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="relative w-64 h-64 border-4 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50">
                <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent animate-pulse" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">Our AI is dreaming up your image...</p>
            </div>
          ) : generatedUrl ? (
            <div className="space-y-4">
              <div className="relative flex justify-center bg-gray-50 rounded-2xl p-3 border border-gray-100 overflow-hidden">
                <img
                  src={generatedUrl.startsWith('http') ? generatedUrl : `http://localhost:3001${generatedUrl}`}
                  alt="Generated Image"
                  className="max-h-[450px] object-contain rounded-xl shadow-sm hover:scale-[1.01] transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Image
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublished || publishing}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition ${
                    isPublished
                      ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-4 h-4" /> 
                  {publishing ? 'Publishing...' : isPublished ? '✓ Published to Community' : 'Publish to Community'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="p-4 bg-indigo-50 rounded-2xl mb-4">
                <Sparkles className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Your generation will appear here</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">Fill in the prompt on the left and choose a style to create custom graphics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateImages