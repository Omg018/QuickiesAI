import React, { useState } from 'react'
import BlogTitlesResult from '../components/BlogTitlesResult'
import { Sparkles, Copy, Check } from 'lucide-react'

const BlogTitles = () => {
  const [topic, setTopic] = useState('')
  const [generatedTitles, setGeneratedTitles] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleGenerate = () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    // Mock API call
    setTimeout(() => {
      const titles = [
        `10 Secrets About ${topic} You Need to Know`,
        `The Ultimate Guide to Mastering ${topic}`,
        `Why ${topic} is the Future of the Industry`,
        `How to Get Started with ${topic} in 2024`,
        `The Pros and Cons of ${topic}: A Deep Dive`,
        `5 Common Mistakes People Make with ${topic}`,
        `${topic} Explained: A Beginner's Tutorial`
      ]
      setGeneratedTitles(titles)
      setIsGenerating(false)
    }, 1500)
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Title Generator</h1>
        <p className="text-gray-600">Enter a topic and let AI generate catchy headlines for your next post.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Digital Marketing, Healthy Eating, React.js"
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className={`px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${isGenerating || !topic.trim()
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Titles
              </>
            )}
          </button>
        </div>
      </div>

      {generatedTitles.length > 0 && (
        <BlogTitlesResult
          titles={generatedTitles}
          copiedIndex={copiedIndex}
          copyToClipboard={copyToClipboard}
        />
      )}
    </div>
  )
}

export default BlogTitles
