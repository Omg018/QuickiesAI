import React, { useState } from 'react'
import { Upload, Image as ImageIcon, Wand2, Download, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { removeBackground } from '@imgly/background-removal'

const RemoveBackground = () => {
  const { getToken } = useAuth()
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [processedImage, setProcessedImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setProcessedImage(null)
      setProgressPercent(0)
      setProgressMsg('')

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveBackground = async () => {
    if (!imageFile) return
    setIsProcessing(true)
    setProgressMsg('Loading AI Model...')
    setProgressPercent(10)

    try {
      // Run WASM-based background removal directly in the browser!
      const resultBlob = await removeBackground(imageFile, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100)
          setProgressPercent(percent)
          if (key === 'fetch') {
            setProgressMsg(`Downloading model files... ${percent}%`)
          } else if (key === 'compute') {
            setProgressMsg(`Analyzing pixels & segmenting... ${percent}%`)
          }
        }
      })

      const localUrl = URL.createObjectURL(resultBlob)
      setProcessedImage(localUrl)

      setProgressMsg('Saving creation to cloud...')
      setProgressPercent(95)

      // Upload processed file to our backend server
      const token = await getToken()
      const formData = new FormData()
      formData.append('image', resultBlob, 'background_removed.png')
      formData.append('prompt', `Background Removal for ${imageFile.name}`)
      formData.append('type', 'remove-background')

      const uploadRes = await fetch("http://localhost:3001/api/ai/upload-creation", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) {
        console.warn("Failed to persist background removal to DB:", uploadData.message)
      }

      setProgressPercent(100)
      setProgressMsg('Finished!')
    } catch (error) {
      console.error("Background removal failed:", error)
      alert("Failed to remove background. Please make sure WebAssembly is enabled and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.href = processedImage
    link.download = `cutout_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Remove Background</h1>
        <p className="text-gray-600">Extract subjects and isolate backgrounds instantly in your browser (no API keys required).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Original Image</h2>

          {!imagePreview ? (
            <label
              htmlFor="image-upload-bg"
              className="flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-600 font-semibold">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 10MB)</p>
              </div>
              <input
                id="image-upload-bg"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="relative w-full h-[360px] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex gap-3">
                <label
                  htmlFor="image-upload-change"
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition cursor-pointer text-center font-bold text-sm"
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
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
                    isProcessing
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Isolate Subject
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[460px]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Background Removed</h2>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center w-full h-[360px] bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-sm">{progressMsg}</p>
                <div className="w-48 bg-gray-200 h-1.5 rounded-full mt-2 mx-auto overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          ) : processedImage ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Checked/Transparent Grid Background Pattern */}
              <div 
                className="relative w-full h-[360px] rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-100"
                style={{
                  backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px), radial-gradient(#d1d5db 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px'
                }}
              >
                <img
                  src={processedImage}
                  alt="Processed"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" /> Isolate Complete
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PNG Cutout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-[360px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Processed image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveBackground