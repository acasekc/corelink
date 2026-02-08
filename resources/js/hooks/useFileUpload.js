import { useState, useCallback, useRef } from 'react';

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 30;

/**
 * Validates files against allowed types, size limits, and max count.
 *
 * @param {File[]} files
 * @param {number} existingCount - Number of files already selected
 * @returns {{ validFiles: File[], errors: string[] }}
 */
export function validateFiles(files, existingCount = 0) {
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            errors.push(`${file.name}: Only images and documents are allowed`);
        } else if (file.size > MAX_FILE_SIZE) {
            errors.push(`${file.name}: File size must not exceed 10MB`);
        } else if (existingCount + validFiles.length >= MAX_FILES) {
            errors.push(`Maximum ${MAX_FILES} files allowed`);
        } else {
            validFiles.push(file);
        }
    });

    return { validFiles, errors };
}

/**
 * Uploads files to a URL with per-file progress tracking.
 * Files are uploaded together in a single FormData request, but
 * we track overall progress.
 *
 * Returns a promise that resolves with the response data.
 */
function uploadWithProgress(url, files, csrfToken, onProgress, abortController) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        abortController.current = xhr;

        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent, e.loaded, e.total);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    resolve(null);
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
        xhr.withCredentials = true;
        xhr.send(formData);
    });
}

/**
 * Upload files individually with per-file progress tracking.
 *
 * @param {string} url - The upload endpoint
 * @param {File[]} files - Array of files to upload
 * @param {string} csrfToken - CSRF token
 * @param {Function} onFileProgress - Callback: (fileIndex, percent) => void
 * @param {React.MutableRefObject} abortRef - Ref to store current XHR for cancellation
 * @returns {Promise<{ data: any[], errors: { file: string, error: string }[] }>}
 */
async function uploadFilesIndividually(url, files, csrfToken, onFileProgress, abortRef) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
        try {
            const result = await uploadWithProgress(
                url,
                [files[i]],
                csrfToken,
                (percent) => onFileProgress(i, percent),
                abortRef,
            );
            if (result?.data) {
                results.push(...(Array.isArray(result.data) ? result.data : [result.data]));
            }
            onFileProgress(i, 100);
        } catch (err) {
            if (err.message === 'Upload cancelled') {
                break;
            }
            errors.push({ file: files[i].name, error: err.message });
            onFileProgress(i, -1); // -1 signals error
        }
    }

    return { data: results, errors };
}

/**
 * Hook for uploading files with per-file progress tracking.
 *
 * @returns {{
 *   fileProgress: Map<number, number>,
 *   isUploading: boolean,
 *   overallPercent: number,
 *   upload: (url: string, files: File[]) => Promise<{ data: any[], errors: any[] }>,
 *   cancel: () => void,
 *   reset: () => void,
 * }}
 */
export default function useFileUpload() {
    const [fileProgress, setFileProgress] = useState(new Map());
    const [isUploading, setIsUploading] = useState(false);
    const [overallPercent, setOverallPercent] = useState(0);
    const abortRef = useRef(null);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const upload = useCallback(async (url, files) => {
        if (files.length === 0) {
            return { data: [], errors: [] };
        }

        setIsUploading(true);
        setOverallPercent(0);

        // Initialize progress for each file at 0%
        const initialProgress = new Map();
        files.forEach((_, i) => initialProgress.set(i, 0));
        setFileProgress(new Map(initialProgress));

        const csrfToken = getCsrfToken();

        const onFileProgress = (fileIndex, percent) => {
            setFileProgress(prev => {
                const updated = new Map(prev);
                updated.set(fileIndex, percent);

                // Calculate overall progress
                let total = 0;
                let completed = 0;
                updated.forEach((p) => {
                    total += 100;
                    completed += Math.max(0, p); // ignore -1 (error) in overall calc
                });
                setOverallPercent(total > 0 ? Math.round((completed / total) * 100) : 0);

                return updated;
            });
        };

        try {
            const result = await uploadFilesIndividually(url, files, csrfToken, onFileProgress, abortRef);
            setOverallPercent(100);
            return result;
        } catch (err) {
            return { data: [], errors: [{ file: 'upload', error: err.message }] };
        } finally {
            setIsUploading(false);
            abortRef.current = null;
        }
    }, []);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        setIsUploading(false);
    }, []);

    const reset = useCallback(() => {
        setFileProgress(new Map());
        setOverallPercent(0);
        setIsUploading(false);
    }, []);

    return { fileProgress, isUploading, overallPercent, upload, cancel, reset };
}

export { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES };
