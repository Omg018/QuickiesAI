import React, { useState } from 'react'
import { Trash2, Globe, Eye, EyeOff, Sparkles, FileText, Image as ImageIcon, Hash, FileEdit } from 'lucide-react'

const CreationItem = ({ id, type, title, createdAt, content, publish, onDelete, onTogglePublish }) => {
    const [expanded, setExpanded] = useState(false);

    // Format content based on type
    const renderContent = () => {
        if (type === 'image' || type === 'remove-background' || type === 'remove-object') {
            const url = content.startsWith('http') ? content : `http://localhost:3001${content}`;
            return (
                <div className="mt-3 flex justify-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <img src={url} alt="Generated AI" className='max-h-96 object-contain rounded-lg shadow-sm' />
                </div>
            );
        } else if (type === 'resume-review') {
            try {
                const feedback = typeof content === 'string' ? JSON.parse(content) : content;
                return (
                    <div className="mt-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-indigo-900">ATS Score:</span>
                            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xs font-bold">{feedback.score}/10</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-green-700 block mb-1">✓ Strengths</span>
                            <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                                {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-orange-700 block mb-1">→ Areas for Improvement</span>
                            <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                                {feedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-indigo-700 block mb-1">• Suggestions</span>
                            <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                                {feedback.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            } catch (e) {
                return <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">{content}</div>;
            }
        } else if (type === 'blog-title') {
            try {
                const titles = typeof content === 'string' ? JSON.parse(content) : content;
                return (
                    <div className="mt-3 space-y-2">
                        {Array.isArray(titles) ? (
                            titles.map((t, i) => (
                                <div key={i} className="p-2.5 bg-purple-50 text-purple-950 text-sm rounded-lg border border-purple-100/50 font-medium">
                                    {t}
                                </div>
                            ))
                        ) : (
                            <div className="p-3 bg-gray-50 text-gray-700 text-sm rounded">{content}</div>
                        )}
                    </div>
                );
            } catch (e) {
                return <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">{content}</div>;
            }
        } else {
            // Article or general text
            return (
                <div className='mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100 max-h-96 overflow-y-auto leading-relaxed font-sans'>
                    {content}
                </div>
            );
        }
    };

    // Icon helper based on creation type
    const getIcon = () => {
        switch (type) {
            case 'image': return <ImageIcon className="w-4 h-4 text-emerald-600" />;
            case 'blog-title': return <Hash className="w-4 h-4 text-purple-600" />;
            case 'article': return <FileEdit className="w-4 h-4 text-blue-600" />;
            case 'resume-review': return <FileText className="w-4 h-4 text-cyan-600" />;
            default: return <Sparkles className="w-4 h-4 text-indigo-600" />;
        }
    };

    const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className='p-5 bg-white rounded-xl shadow-sm border border-gray-200 transition duration-300 hover:shadow-md hover:border-indigo-200 cursor-default w-full flex flex-col'>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg mt-1">
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className='text-xs font-semibold uppercase tracking-wider text-indigo-600'>{type.replace('-', ' ')}</span>
                            {publish && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                                    <Globe className="w-2.5 h-2.5" /> Published
                                </span>
                            )}
                        </div>
                        <p className='text-base font-bold text-gray-900 mt-0.5 line-clamp-1'>{title}</p>
                        <p className='text-xs text-gray-500 mt-1'>Created: {formattedDate}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                    {onTogglePublish && (
                        <button 
                            onClick={() => onTogglePublish(id)} 
                            title={publish ? "Unpublish from community" : "Publish to community"}
                            className={`p-2 rounded-lg border transition ${
                                publish 
                                    ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {publish ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </button>
                    )}
                    
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(id)} 
                            title="Delete creation"
                            className="p-2 rounded-lg border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <button 
                        onClick={() => setExpanded(!expanded)} 
                        className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-semibold shadow-sm hover:shadow'
                    >
                        {expanded ? 'Hide Details' : 'View Details'}
                    </button>
                </div>
            </div>
            
            {expanded && renderContent()}
        </div>
    );
};

export default CreationItem;