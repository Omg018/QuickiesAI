import React, { useState } from 'react';
import { Sparkles, Copy, Check, FileText, AlignLeft, Hash } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

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

const LENGTHS = [
  { label: 'Short (~400 words)', value: 400 },
  { label: 'Medium (~700 words)', value: 700 },
  { label: 'Long (~1200 words)', value: 1200 },
]

const WriteArticle = () => {
  const { getToken } = useAuth();
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState(700);
  const [article, setArticle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setArticle('');
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: topic, length }),
      });
      const data = await res.json();
      if (data.success) {
        setArticle(data.content);
        setWordCount(data.content.trim().split(/\s+/).length);
      } else {
        alert(data.message || 'Failed to generate article.');
      }
    } catch (err) {
      console.error('Generate article failed:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={28} style={{ color: '#6366f1' }} />
          AI Article Writer
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Enter any topic and let Gemini AI write a comprehensive, structured article for you.
        </p>
      </div>

      {/* Input Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder='Article topic, e.g. "The Impact of Machine Learning on Modern Finance"'
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#1e293b',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            style={{
              padding: '12px 22px', borderRadius: 10, border: 'none',
              cursor: isGenerating || !topic.trim() ? 'not-allowed' : 'pointer',
              background: isGenerating || !topic.trim() ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: isGenerating || !topic.trim() ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            {isGenerating ? (
              <><div style={{ width: 16, height: 16, border: '2.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Writing...</>
            ) : (
              <><Sparkles size={16} />Write Article</>
            )}
          </button>
        </div>

        {/* Length selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlignLeft size={14} style={{ color: '#9ca3af' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Length:</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {LENGTHS.map(l => (
              <button
                key={l.value}
                onClick={() => setLength(l.value)}
                style={{
                  padding: '5px 12px', borderRadius: 7, border: '1.5px solid',
                  borderColor: length === l.value ? '#6366f1' : '#e2e8f0',
                  background: length === l.value ? '#ede9fe' : '#fff',
                  color: length === l.value ? '#6366f1' : '#64748b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading shimmer */}
      {isGenerating && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 18, width: 200, background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
          {[100, 88, 95, 70, 80, 92, 65, 75].map((w, i) => (
            <div key={i} style={{ height: 13, width: `${w}%`, background: '#e2e8f0', borderRadius: 4, marginBottom: 10, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
          ))}
          <p style={{ textAlign: 'center', color: '#6366f1', fontWeight: 600, fontSize: 13, marginTop: 16 }}>
            ✨ Gemini is writing your article...
          </p>
        </div>
      )}

      {/* Article Result */}
      {!isGenerating && article && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fafafa,#f8f0ff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4b5563' }}>Generated Article</span>
              <span style={{ fontSize: 11, padding: '2px 8px', background: '#ede9fe', color: '#7c3aed', borderRadius: 20, fontWeight: 600 }}>Gemini AI</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, color: '#9ca3af' }}>
                <Hash size={12} />
                <span style={{ fontSize: 12 }}>{wordCount.toLocaleString()} words</span>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? '#16a34a' : '#4b5563' }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Article content with markdown rendering */}
          <div
            style={{ padding: '28px 36px', lineHeight: 1.85, color: '#374151', fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article) }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .md-h1 { font-size:24px; font-weight:800; color:#1e1b4b; margin:20px 0 10px; }
        .md-h2 { font-size:20px; font-weight:700; color:#1e1b4b; margin:18px 0 8px; border-bottom:2px solid #ede9fe; padding-bottom:6px; }
        .md-h3 { font-size:17px; font-weight:700; color:#4b5563; margin:14px 0 6px; }
        .md-p { margin:0 0 12px; }
        .md-ul { padding-left:20px; margin:8px 0; }
        .md-li { margin-bottom:6px; }
        .md-code { background:#ede9fe; color:#7c3aed; padding:1px 5px; border-radius:4px; font-size:13px; font-family:monospace; }
      `}</style>
    </div>
  );
};

export default WriteArticle;