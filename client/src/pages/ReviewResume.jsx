import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

const ReviewResume = () => {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setFeedback(null)
    }
  }

  const handleAnalyze = () => {
    if (!file) return
    setIsAnalyzing(true)

    // Mock analysis
    setTimeout(() => {
      setFeedback({
        score: 8.5,
        strengths: [
          'Clear and concise formatting',
          'Strong action verbs in experience section',
          'Relevant skills highlighted',
          'Good use of quantifiable achievements'
        ],
        improvements: [
          'Add more specific metrics to achievements',
          'Include a professional summary at the top',
          'Consider adding relevant certifications',
          'Tailor keywords to match job descriptions'
        ],
        suggestions: [
          'Use consistent date formatting throughout',
          'Ensure contact information is up-to-date',
          'Proofread for any typos or grammatical errors'
        ]
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Review</h1>
        <p className="text-gray-600">Upload your resume and get AI-powered feedback to improve it</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <label
              htmlFor="resume-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only (MAX. 5MB)</p>
              </div>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition ${isAnalyzing
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">{feedback.score}</span>
              <span className="text-2xl mb-2">/10</span>
            </div>
            <p className="text-indigo-100 mt-2">Your resume is looking good! Check the feedback below for improvements.</p>
          </div>

          {/* Strengths */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-500 mt-1">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              <h3 className="text-xl font-semibold text-gray-900">Additional Suggestions</h3>
            </div>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewResume