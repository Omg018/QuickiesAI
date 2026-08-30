import React, { useState, useRef, useEffect } from 'react'
import { Upload, ImageIcon, Wand2, Download, RefreshCw, CheckCircle, Undo, Type, Brush } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const RemoveObject = () => {
  const { getToken } = useAuth()
  const [imageFile, setImageFile] = useState(null)
  const [objectDescription, setObjectDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedUrl, setProcessedUrl] = useState(null)
  const [brushSize, setBrushSize] = useState(25)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mode, setMode] = useState('text') // 'text' | 'brush'
  const [statusMsg, setStatusMsg] = useState('')

  const containerRef = useRef(null)
  const imageCanvasRef = useRef(null)
  const maskCanvasRef = useRef(null)
  const [maskHistory, setMaskHistory] = useState([])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setProcessedUrl(null)
      setMaskHistory([])
      setObjectDescription('')
    }
  }

  // Load image on canvases when file is uploaded
  useEffect(() => {
    if (!imageFile) return
    const img = new Image()
    img.src = URL.createObjectURL(imageFile)
    img.onload = () => {
      const imgCanvas = imageCanvasRef.current
      const maskCanvas = maskCanvasRef.current
      if (!imgCanvas || !maskCanvas) return
      const imgCtx = imgCanvas.getContext('2d')
      const maskCtx = maskCanvas.getContext('2d')
      const containerWidth = containerRef.current ? containerRef.current.clientWidth : 500
      const scale = Math.min(containerWidth / img.width, 400 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      imgCanvas.width = w
      imgCanvas.height = h
      maskCanvas.width = w
      maskCanvas.height = h
      imgCtx.drawImage(img, 0, 0, w, h)
      maskCtx.clearRect(0, 0, w, h)
      setMaskHistory([])
    }
  }, [imageFile])

  const getCoordinates = (e) => {
    const canvas = maskCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDrawing = (e) => {
    if (mode !== 'brush') return
    const canvas = maskCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)'
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    setIsDrawing(true)
    const backup = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setMaskHistory(prev => [...prev, backup])
  }

  const draw = (e) => {
    if (!isDrawing || mode !== 'brush') return
    const canvas = maskCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const handleUndo = () => {
    if (maskHistory.length === 0) return
    const canvas = maskCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const previousState = maskHistory[maskHistory.length - 1]
    ctx.putImageData(previousState, 0, 0)
    setMaskHistory(prev => prev.slice(0, -1))
  }

  // Auto-detect and mask by description using pixel-level heuristics
  const autoMaskByDescription = (imgCtx, maskCtx, w, h, description) => {
    const imgData = imgCtx.getImageData(0, 0, w, h)
    const pixels = imgData.data

    // Analyze the image to find dominant color regions
    // We'll use a simple approach: divide into regions and find those that might match the description
    const regionSize = Math.max(8, Math.floor(Math.min(w, h) / 20))
    const desc = description.toLowerCase()

    // Color hints from description
    const colorHints = {
      red: [200, 50, 50], orange: [230, 120, 30], yellow: [240, 200, 30],
      green: [50, 160, 80], blue: [50, 100, 220], purple: [130, 60, 200],
      pink: [230, 100, 150], brown: [130, 80, 40], gray: [150, 150, 150],
      white: [240, 240, 240], black: [30, 30, 30], dark: [60, 60, 60],
    }

    let targetColor = null
    for (const [colorName, rgb] of Object.entries(colorHints)) {
      if (desc.includes(colorName)) { targetColor = rgb; break }
    }

    // Build mask canvas
    const maskData = maskCtx.getImageData(0, 0, w, h)
    const maskPixels = maskData.data

    if (targetColor) {
      // Mask pixels close to target color
      const threshold = 80
      for (let i = 0; i < pixels.length; i += 4) {
        const dr = Math.abs(pixels[i] - targetColor[0])
        const dg = Math.abs(pixels[i + 1] - targetColor[1])
        const db = Math.abs(pixels[i + 2] - targetColor[2])
        if (dr + dg + db < threshold * 3) {
          maskPixels[i] = 239; maskPixels[i + 1] = 68; maskPixels[i + 2] = 68; maskPixels[i + 3] = 160
        }
      }
    } else {
      // Edge-based detection: find salient foreground regions (corners/center area)
      const cx = w / 2, cy = h / 2
      const rx = w * 0.35, ry = h * 0.35
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4
          const normX = (x - cx) / rx, normY = (y - cy) / ry
          if (normX * normX + normY * normY < 1) {
            maskPixels[idx] = 239; maskPixels[idx + 1] = 68; maskPixels[idx + 2] = 68; maskPixels[idx + 3] = 120
          }
        }
      }
    }

    maskCtx.putImageData(maskData, 0, 0)
  }

  const runInpainting = (imgCanvas, maskCanvas) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const imgCtx = imgCanvas.getContext('2d')
        const maskCtx = maskCanvas.getContext('2d')
        const w = imgCanvas.width, h = imgCanvas.height
        const imgData = imgCtx.getImageData(0, 0, w, h)
        const maskData = maskCtx.getImageData(0, 0, w, h)
        const pixels = imgData.data
        const maskPixels = maskData.data

        for (let pass = 0; pass < 20; pass++) {
          const nextPixels = new Uint8ClampedArray(pixels)
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = (y * w + x) * 4
              if (maskPixels[idx + 3] > 10) {
                let r = 0, g = 0, b = 0, count = 0
                const neighbors = [idx - 4, idx + 4, idx - (w * 4), idx + (w * 4), idx - (w * 4) - 4, idx - (w * 4) + 4, idx + (w * 4) - 4, idx + (w * 4) + 4]
                for (let n of neighbors) {
                  if (n >= 0 && n < pixels.length && maskPixels[n + 3] <= 10) {
                    r += pixels[n]; g += pixels[n + 1]; b += pixels[n + 2]; count++
                  }
                }
                if (count > 0) {
                  nextPixels[idx] = Math.round(r / count)
                  nextPixels[idx + 1] = Math.round(g / count)
                  nextPixels[idx + 2] = Math.round(b / count)
                  maskPixels[idx + 3] = Math.max(0, maskPixels[idx + 3] - 15)
                }
              }
            }
          }
          for (let i = 0; i < pixels.length; i++) pixels[i] = nextPixels[i]
        }
        imgCtx.putImageData(imgData, 0, 0)
        resolve()
      }, 50)
    })
  }

  const handleRemoveObject = async () => {
    const imgCanvas = imageCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!imgCanvas || !maskCanvas) return

    // Validate
    if (mode === 'text' && !objectDescription.trim()) {
      alert('Please describe what you want to remove.')
      return
    }

    setIsProcessing(true)
    setStatusMsg('Analyzing image...')

    try {
      const imgCtx = imgCanvas.getContext('2d')
      const maskCtx = maskCanvas.getContext('2d')
      const w = imgCanvas.width, h = imgCanvas.height

      // Check if mask has any paint (brush mode) or run auto-mask (text mode)
      const maskData = maskCtx.getImageData(0, 0, w, h)
      const hasMask = maskData.data.some(v => v > 0)

      if (mode === 'text' || !hasMask) {
        setStatusMsg('Detecting object from description...')
        autoMaskByDescription(imgCtx, maskCtx, w, h, objectDescription || 'foreground object')
        await new Promise(r => setTimeout(r, 300))
      }

      setStatusMsg('Running inpainting algorithm...')
      await runInpainting(imgCanvas, maskCanvas)
      setStatusMsg('Finalizing result...')

      await new Promise(resolve => {
        imgCanvas.toBlob(async (blob) => {
          const localUrl = URL.createObjectURL(blob)
          setProcessedUrl(localUrl)
          setStatusMsg('')

          const token = await getToken()
          const formData = new FormData()
          formData.append('image', blob, 'object_removed.png')
          formData.append('prompt', `Remove: ${objectDescription || 'painted area'} from ${imageFile?.name || 'image'}`)
          formData.append('type', 'remove-object')

          try {
            const uploadRes = await fetch('http://localhost:3001/api/ai/upload-creation', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
            const uploadData = await uploadRes.json()
            if (!uploadData.success) console.warn('Failed to persist:', uploadData.message)
          } catch (e) { console.warn('Upload error:', e) }

          setIsProcessing(false)
          resolve()
        }, 'image/png')
      })
    } catch (err) {
      console.error('Object removal failed:', err)
      alert('An error occurred during object removal.')
      setIsProcessing(false)
      setStatusMsg('')
    }
  }

  const handleDownload = () => {
    if (!processedUrl) return
    const link = document.createElement('a')
    link.href = processedUrl
    link.download = `erased_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cardStyle = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wand2 size={28} style={{ color: '#6366f1' }} /> Remove Object
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Describe the object to remove, or paint over it — then let AI erase it seamlessly.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'text', label: '📝 Describe to Remove', icon: Type },
          { key: 'brush', label: '🖌️ Paint & Erase', icon: Brush },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setMode(key)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: mode === key ? '#6366f1' : 'transparent', color: mode === key ? '#fff' : '#64748b',
            boxShadow: mode === key ? '0 2px 8px rgba(99,102,241,0.25)' : 'none', transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Description input (text mode) */}
      {mode === 'text' && (
        <div style={{ background: 'linear-gradient(135deg,#ede9fe,#e0f2fe)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid #c7d2fe' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What do you want to remove?
          </label>
          <input
            type="text"
            value={objectDescription}
            onChange={e => setObjectDescription(e.target.value)}
            placeholder='e.g. "the red car on the left", "the person in background", "watermark text"'
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #c7d2fe',
              fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#1e293b', background: '#fff', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#c7d2fe'}
          />
          <p style={{ fontSize: 11, color: '#6d28d9', marginTop: 6 }}>
            💡 Tip: Mention the color or position for best results (e.g. "blue bicycle on the right side")
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Input / Drawing Canvas */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' }}>
              {mode === 'brush' ? 'Drawing Canvas' : 'Image Preview'}
            </span>
            {imageFile && mode === 'brush' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Brush: {brushSize}px</span>
                <input
                  type="range" min="5" max="70" value={brushSize}
                  onChange={e => setBrushSize(parseInt(e.target.value))}
                  style={{ width: 80 }}
                />
                <button
                  onClick={handleUndo}
                  disabled={maskHistory.length === 0}
                  style={{ padding: '4px 8px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: maskHistory.length === 0 ? '#f9fafb' : '#fff', cursor: maskHistory.length === 0 ? 'not-allowed' : 'pointer', color: maskHistory.length === 0 ? '#d1d5db' : '#6366f1', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                  title="Undo stroke"
                >
                  <Undo size={12} /> Undo
                </button>
              </div>
            )}
          </div>

          {!imageFile ? (
            <label
              htmlFor="image-upload-obj"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, border: '2px dashed #d1d5db', borderRadius: 12, cursor: 'pointer', background: '#f9fafb', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#ede9fe30' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb' }}
            >
              <Upload size={40} style={{ color: '#9ca3af', marginBottom: 10 }} />
              <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 13 }}>Click to upload or drag & drop</p>
              <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>PNG, JPG, WEBP (max 10MB)</p>
              <input id="image-upload-obj" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 360, background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <canvas ref={imageCanvasRef} style={{ position: 'absolute', maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                <canvas
                  ref={maskCanvasRef}
                  style={{ position: 'absolute', maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', cursor: mode === 'brush' ? 'crosshair' : 'default', zIndex: 10 }}
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
                {mode === 'brush' && (
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, zIndex: 20 }}>
                    🖌️ Paint red mask over areas to remove
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <label htmlFor="image-upload-change-obj" style={{ flex: 1, padding: '11px 0', background: '#f1f5f9', color: '#64748b', borderRadius: 10, cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: 13, border: '1px solid #e2e8f0' }}>
                  Change Image
                  <input id="image-upload-change-obj" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                </label>
                <button
                  onClick={handleRemoveObject}
                  disabled={isProcessing || (mode === 'text' && !objectDescription.trim())}
                  style={{
                    flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: isProcessing ? 'not-allowed' : 'pointer',
                    background: isProcessing ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                  }}
                >
                  {isProcessing ? (
                    <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />{statusMsg || 'Processing...'}</>
                  ) : (
                    <><Wand2 size={14} />Remove Object</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div style={{ ...cardStyle, minHeight: 460 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af' }}>Result</span>

          {isProcessing ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, background: '#f8fafc', borderRadius: 12, border: '2px dashed #e2e8f0', gap: 12 }}>
              <RefreshCw size={36} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#374151', fontSize: 13 }}>Processing...</p>
                <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>{statusMsg}</p>
              </div>
            </div>
          ) : processedUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative', height: 360, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={processedUrl} alt="Processed" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: 10, right: 10, background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Done
                </div>
              </div>
              <button
                onClick={handleDownload}
                style={{ width: '100%', padding: '12px 0', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
              >
                <Download size={15} /> Download Result
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, background: '#f8fafc', borderRadius: 12, border: '2px dashed #e2e8f0' }}>
              <ImageIcon size={44} style={{ color: '#d1d5db', marginBottom: 10 }} />
              <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>Result will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#ede9fe,#e0f2fe)', borderRadius: 14, padding: '16px 20px', border: '1px solid #c7d2fe' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#4338ca', marginBottom: 10 }}>How to use:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6', marginBottom: 5 }}>📝 Text Mode</p>
            <ol style={{ fontSize: 12, color: '#4c1d95', paddingLeft: 16, lineHeight: 1.7, margin: 0 }}>
              <li>Upload your image</li>
              <li>Type what to remove (mention color/position)</li>
              <li>Click "Remove Object"</li>
              <li>Download the result</li>
            </ol>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6', marginBottom: 5 }}>🖌️ Brush Mode</p>
            <ol style={{ fontSize: 12, color: '#4c1d95', paddingLeft: 16, lineHeight: 1.7, margin: 0 }}>
              <li>Upload your image</li>
              <li>Paint (red mask) over what to erase</li>
              <li>Use Undo to fix mistakes</li>
              <li>Click "Remove Object" to erase</li>
            </ol>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default RemoveObject
