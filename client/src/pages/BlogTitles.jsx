import React, { useState } from 'react'
import { Sparkles, Copy, Check, BookOpen, Tag, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

// Simple markdown-to-HTML renderer
const renderMarkdown = (text) => {
  if (!text) return ''
  return text
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="md-ul">$1</ul>')
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/^(?!<[hul])/gm, '<p class="md-p">')
    .replace(/<\/p>\s*<p class="md-p"><\/p>/g, '</p>')
}

const TONES = ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational']
const LENGTHS = [
  { label: 'Short (~400 words)', value: 400 },
  { label: 'Medium (~800 words)', value: 800 },
  { label: 'Long (~1500 words)', value: 1500 },
]

const BlogGenerator = () => {
  const { getToken } = useAuth()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Professional')
  const [length, setLength] = useState(800)
  const [keywords, setKeywords] = useState('')
  const [mode, setMode] = useState('blog') // 'blog' | 'titles'
  const [result, setResult] = useState(null) // { type: 'blog'|'titles', content, titles }
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [copiedTitleIdx, setCopiedTitleIdx] = useState(null)

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    setResult(null)
    try {
      const token = await getToken()
      if (mode === 'blog') {
        const res = await fetch('http://localhost:3001/api/ai/generate-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ topic, tone, length, keywords }),
        })
        const data = await res.json()
        if (data.success) {
          setResult({ type: 'blog', content: data.content })
        } else {
          alert(data.message || 'Failed to generate blog post.')
        }
      } else {
        const res = await fetch('http://localhost:3001/api/ai/generate-titles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ topic }),
        })
        const data = await res.json()
        if (data.success) {
          setResult({ type: 'titles', titles: data.titles })
        } else {
          alert(data.message || 'Failed to generate titles.')
        }
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyBlog = () => {
    navigator.clipboard.writeText(result?.content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyTitle = (title, idx) => {
    navigator.clipboard.writeText(title)
    setCopiedTitleIdx(idx)
    setTimeout(() => setCopiedTitleIdx(null), 2000)
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={28} style={{ color: '#6366f1' }} />
          AI Blog Generator
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Generate full AI-written blog posts or catchy headline ideas — powered by Gemini.
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'blog', label: '✍️ Full Blog Post', icon: Wand2 },
          { key: 'titles', label: '💡 Title Ideas', icon: Tag },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setResult(null) }}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600,
              fontSize: 13, transition: 'all 0.2s',
              background: mode === key ? '#6366f1' : 'transparent',
              color: mode === key ? '#fff' : '#64748b',
              boxShadow: mode === key ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: mode === 'blog' ? 14 : 0 }}>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder={mode === 'blog' ? 'Blog topic, e.g. "The Future of AI in Healthcare"' : 'e.g. Digital Marketing, React.js, Healthy Eating'}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#1e293b',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            style={{
              padding: '12px 22px', borderRadius: 10, border: 'none', cursor: isGenerating || !topic.trim() ? 'not-allowed' : 'pointer',
              background: isGenerating || !topic.trim() ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: isGenerating || !topic.trim() ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {isGenerating ? (
              <><div style={{ width: 16, height: 16, border: '2.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating...</>
            ) : (
              <><Sparkles size={16} />{mode === 'blog' ? 'Generate Blog' : 'Generate Titles'}</>
            )}
          </button>
        </div>

        {/* Advanced options for blog mode */}
        {mode === 'blog' && (
          <>
            <button
              onClick={() => setShowOptions(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: showOptions ? 14 : 0 }}
            >
              {showOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              Advanced Options
            </button>
            {showOptions && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>TONE</label>
                  <select
                    value={tone} onChange={e => setTone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc' }}
                  >
                    {TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>LENGTH</label>
                  <select
                    value={length} onChange={e => setLength(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc' }}
                  >
                    {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>KEYWORDS (optional)</label>
                  <input
                    type="text" value={keywords} onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. SEO, trends, 2025"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loading shimmer */}
      {isGenerating && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', borderRadius: 8, animation: 'shimmer 1.4s infinite' }} />
            <div style={{ height: 18, width: 220, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', borderRadius: 6, animation: 'shimmer 1.4s infinite' }} />
          </div>
          {[100, 85, 90, 70, 95, 60].map((w, i) => (
            <div key={i} style={{ height: 13, width: `${w}%`, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', borderRadius: 4, marginBottom: 10, animation: 'shimmer 1.4s infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
          <p style={{ textAlign: 'center', color: '#6366f1', fontWeight: 600, fontSize: 13, marginTop: 16 }}>✨ Gemini is crafting your content...</p>
        </div>
      )}

      {/* Results */}
      {!isGenerating && result && (
        <>
          {result.type === 'blog' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fafafa,#f8f0ff)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4b5563' }}>Generated Blog Post</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', background: '#ede9fe', color: '#7c3aed', borderRadius: 20, fontWeight: 600 }}>Gemini AI</span>
                </div>
                <button
                  onClick={copyBlog}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? '#16a34a' : '#4b5563', transition: 'all 0.2s' }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div
                style={{ padding: '28px 32px', lineHeight: 1.8, color: '#374151', fontSize: 15 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(result.content) }}
              />
            </div>
          )}

          {result.type === 'titles' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fafafa,#f0f9ff)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4b5563' }}>{result.titles.length} Blog Title Ideas</span>
                <span style={{ fontSize: 11, padding: '2px 8px', background: '#ede9fe', color: '#7c3aed', borderRadius: 20, fontWeight: 600 }}>Gemini AI</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.titles.map((title, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', gap: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ minWidth: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                      <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{title}</span>
                    </div>
                    <button
                      onClick={() => copyTitle(title, idx)}
                      style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copiedTitleIdx === idx ? '#16a34a' : '#6366f1', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      {copiedTitleIdx === idx ? <Check size={11} /> : <Copy size={11} />}
                      {copiedTitleIdx === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .md-h1 { font-size:24px; font-weight:800; color:#1e1b4b; margin:20px 0 10px; }
        .md-h2 { font-size:20px; font-weight:700; color:#1e1b4b; margin:18px 0 8px; border-bottom:2px solid #ede9fe; padding-bottom:6px; }
        .md-h3 { font-size:17px; font-weight:700; color:#4b5563; margin:14px 0 6px; }
        .md-p { margin:0 0 12px; }
        .md-ul { padding-left:20px; margin:8px 0; }
        .md-li { margin-bottom:6px; }
        .md-code { background:#ede9fe; color:#7c3aed; padding:1px 5px; border-radius:4px; font-size:13px; font-family:monospace; }
      `}</style>
    </div>
  )
}

export default BlogGenerator
