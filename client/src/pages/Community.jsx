import React, { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Loader2, Heart, MessageSquare, ExternalLink, Sparkles, Filter, Shield } from 'lucide-react'

const Community = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, image, article, blog-title, resume-review

  const fetchCommunityCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("http://localhost:3001/api/ai/community", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCreations(data.creations);
      }
    } catch (err) {
      console.error("Failed to fetch community creations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/ai/creations/${id}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCreations(prev => prev.map(c => c.id === id ? { ...c, likes: data.likes } : c));
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  useEffect(() => {
    fetchCommunityCreations();
  }, []);

  const filteredCreations = filter === 'all' 
    ? creations 
    : creations.filter(c => c.type === filter);

  const renderContentPreview = (creation) => {
    const { type, content } = creation;
    if (type === 'image' || type === 'remove-background' || type === 'remove-object') {
      const url = content.startsWith('http') ? content : `http://localhost:3001${content}`;
      return (
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-xl group-hover:opacity-95 transition-opacity">
          <img src={url} alt="Community Generation" className="w-full h-full object-cover" />
        </div>
      );
    } else if (type === 'resume-review') {
      try {
        const feedback = typeof content === 'string' ? JSON.parse(content) : content;
        return (
          <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-800">Resume Audit Score</span>
              <span className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px] font-bold">{feedback.score || 'N/A'}/10</span>
            </div>
            <p className="text-xs text-gray-600 font-medium line-clamp-3">
              Top Strength: {feedback.strengths?.[0] || 'Good layout'}
            </p>
          </div>
        );
      } catch (e) {
        return <div className="p-4 bg-gray-50 text-xs text-gray-500 rounded-xl line-clamp-3">{content}</div>;
      }
    } else if (type === 'blog-title') {
      try {
        const titles = typeof content === 'string' ? JSON.parse(content) : content;
        return (
          <div className="space-y-1.5">
            {Array.isArray(titles) ? (
              titles.slice(0, 3).map((t, i) => (
                <div key={i} className="p-2 bg-purple-50 text-purple-950 text-xs font-semibold rounded-lg border border-purple-100/30 truncate">
                  {t}
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-50 text-xs text-gray-600 rounded">{content}</div>
            )}
          </div>
        );
      } catch (e) {
        return <div className="p-4 bg-gray-50 text-xs text-gray-500 rounded-xl line-clamp-3">{content}</div>;
      }
    } else {
      return (
        <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-xl text-xs text-gray-600 line-clamp-5 whitespace-pre-wrap leading-relaxed font-sans">
          {content}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
          Community Showcase <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
        </h1>
        <p className="text-purple-100 text-sm mt-1">Explore and get inspired by masterpieces created by creators around the globe.</p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'image', 'article', 'blog-title', 'resume-review'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* community gallery grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-gray-500 font-medium font-sans">Syncing with community cloud...</p>
        </div>
      ) : filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((creation) => {
            const isLiked = creation.likes?.includes(user?.id);
            return (
              <div 
                key={creation.id} 
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                      {creation.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(creation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {creation.prompt}
                  </p>

                  {renderContentPreview(creation)}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
                  <span className="text-xs text-gray-400 truncate max-w-[120px]">
                    User: {creation.user_id.substring(0, 12)}...
                  </span>

                  <button 
                    onClick={() => handleLike(creation.id)} 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isLiked 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{creation.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-lg text-gray-800">Showcase is empty</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Be the first to publish a creation from your Dashboard to make it visible to the community!</p>
        </div>
      )}

    </div>
  )
}

export default Community
