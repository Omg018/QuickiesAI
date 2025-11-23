import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

const WriteArticle = () => {
  const [topic, setTopic] = useState('');
  const [article, setArticle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    // Mock generation
    setTimeout(() => {
      const mock = `# ${topic}\n\nThis is a mock article about ${topic}. It includes an introduction, several sections, and a conclusion.\n\n## Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n## Main Content\n\n- Point one about ${topic}\n- Point two about ${topic}\n- Point three about ${topic}\n\n## Conclusion\n\nIn summary, ${topic} is important because ...`;
      setArticle(mock);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Write an Article</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Enter article topic"
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className={`px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition ${isGenerating || !topic.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} `}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>
      {article && (
        <div className="mt-6 space-y-4">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
            {article}
          </pre>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {copied ? <Check className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WriteArticle;