import { Protect, useAuth, useUser } from '@clerk/clerk-react'
import React, { useState, useEffect } from 'react'
import CreationItem from '../components/CreationItem'
import { Loader2, Sparkles, User, ShieldCheck } from 'lucide-react'

const Dashboard = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("http://localhost:3001/api/ai/creations", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCreations(data.creations);
      }
    } catch (err) {
      console.error("Failed to fetch creations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this creation?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/ai/creations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCreations(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.message || "Failed to delete creation");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/ai/creations/${id}/publish`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCreations(prev => prev.map(c => c.id === id ? data.creation : c));
      } else {
        alert(data.message || "Failed to update publication");
      }
    } catch (err) {
      console.error("Toggle publish failed:", err);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  const totalCreations = creations.length;
  const freeUsage = user?.privateMetadata?.free_usage || 0;

  return (
    <div className='flex flex-col p-6 space-y-6 bg-gray-50 min-h-screen'>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            Welcome back, {user?.firstName || 'User'}! <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </h1>
          <p className="text-indigo-100 text-sm mt-1">Manage your generations, review your history, and share creations with the community.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm self-start md:self-auto">
          <User className="w-5 h-5 text-indigo-200" />
          <div className="text-left">
            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Account Tier</p>
            <div className="text-sm font-bold flex items-center gap-1">
              <Protect plan="premium" fallback={<span>Free Tier ({freeUsage}/100 calls)</span>}>
                <span className="text-yellow-300 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Premium Member</span>
              </Protect>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        <div className='p-6 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between'>
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1'>Total Creations</h3>
            <p className='text-4xl font-extrabold text-indigo-600'>{totalCreations}</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">All generated articles, images, and reviews saved in your cloud library.</p>
        </div>

        <div className='p-6 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between'>
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1'>Storage Location</h3>
            <p className='text-2xl font-bold text-gray-800'>Neon Cloud SQL</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">All data is securely synced and backed up on your cloud database instance.</p>
        </div>
      </div>

      {/* creations List */}
      <div className='flex flex-col space-y-4'>
        <h2 className='text-xl font-extrabold text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2'>
          Recent Creations {loading && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-gray-500 font-medium">Fetching creations history...</p>
          </div>
        ) : creations.length > 0 ? (
          <div className='space-y-4'>
            {creations.map((creation) => (
              <CreationItem
                key={creation.id}
                id={creation.id}
                type={creation.type}
                title={creation.prompt}
                createdAt={creation.created_at}
                content={creation.content}
                publish={creation.publish}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        ) : (
          <div className='p-12 text-center bg-white rounded-xl shadow-sm border border-dashed border-gray-300 text-gray-500'>
            <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <p className='font-bold text-lg text-gray-800'>No creations yet!</p>
            <p className='text-sm text-gray-500 mt-1 max-w-sm mx-auto'>Start generating articles, images, or resume reviews to build up your digital showcase.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard