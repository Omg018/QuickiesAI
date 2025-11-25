import React, { useState } from 'react'
import { Upload, Image as ImageIcon, Wand2, Download } from 'lucide-react'

const RemoveObject = () => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setProcessedImage(null)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveObject = () => {
    if (!image) return
    setIsProcessing(true)

    // Mock processing - in reality this would call an AI API
    setTimeout(() => {
      // For demo purposes, we'll just use the same image
      setProcessedImage(imagePreview)
      setIsProcessing(false)
    }, 2000)
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'removed-object.png'
    link.click()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Remove Object</h1>
        <p className="text-gray-600">Upload an image and remove unwanted objects with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Image</h2>

          {!imagePreview ? (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2">
                <label
                  htmlFor="image-upload-change"
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer text-center font-medium"
                >
                  Change Image
                  <input
                    id="image-upload-change"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <button
                  onClick={handleRemoveObject}
                  disabled={isProcessing}
                  className={`flex - 1 px - 4 py - 2 rounded - lg font - medium text - white flex items - center justify - center gap - 2 transition ${isProcessing
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                    } `}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Remove Object
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Processed Image</h2>

          {!processedImage ? (
            <div className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Processed image will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  ✓ Processed
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">How to use:</h3>
        <ol className="space-y-2 text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Upload an image containing objects you want to remove</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Click "Remove Object" to process the image with AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Download the processed image with objects removed</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default RemoveObject
