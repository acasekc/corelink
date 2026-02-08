import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Displays per-file upload progress bars.
 *
 * @param {{ files: File[], fileProgress: Map<number, number>, isUploading: boolean, onCancel: () => void }} props
 */
export default function FileUploadProgress({ files, fileProgress, isUploading, onCancel }) {
    if (!files || files.length === 0 || fileProgress.size === 0) {
        return null;
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    Uploading {files.length} file{files.length !== 1 ? 's' : ''}…
                </span>
                {isUploading && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs text-red-400 hover:text-red-300"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {files.map((file, index) => {
                const percent = fileProgress.get(index) ?? 0;
                const isError = percent === -1;
                const isDone = percent === 100;
                const isActive = !isError && !isDone && percent >= 0;

                return (
                    <div key={`${file.name}-${index}`} className="flex items-center gap-2">
                        {/* Status icon */}
                        <div className="shrink-0 w-4">
                            {isDone && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {isError && <AlertCircle className="w-4 h-4 text-red-400" />}
                            {isActive && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        </div>

                        {/* File info + progress bar */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-slate-300 truncate mr-2">
                                    {file.name}
                                </span>
                                <span className="text-xs text-slate-500 shrink-0">
                                    {isError ? 'Failed' : isDone ? formatFileSize(file.size) : `${percent}%`}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        isError ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${isError ? 100 : Math.max(0, percent)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
