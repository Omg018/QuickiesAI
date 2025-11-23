import React from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Props:
 * - titles: array of strings
 * - copiedIndex: index of the title that was recently copied (or null)
 * - copyToClipboard: function(title: string, index: number) => void
 */
const BlogTitlesResult = ({ titles, copiedIndex, copyToClipboard }) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Titles</h2>
            <div className="grid gap-3">
                {titles.map((title, index) => (
                    <div
                        key={index}
                        className="group bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between"
                    >
                        <p className="text-gray-800 font-medium">{title}</p>
                        <button
                            onClick={() => copyToClipboard(title, index)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Copy to clipboard"
                        >
                            {copiedIndex === index ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogTitlesResult;
