import React, { useState, useCallback } from 'react';
import { Upload, FileText, File, Image, FileSpreadsheet, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { ScanResult } from '../types';
import { SEVERITY_STYLES } from '../constants';

interface Props {
  onScan: (file: File) => Promise<ScanResult>;
  isLoading: boolean;
  results?: ScanResult[];
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'scanning' | 'complete' | 'error';
  result?: ScanResult;
  error?: string;
}

const FileScanner: React.FC<Props> = ({ onScan, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: QueuedFile[] = files.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending',
    }));
    setQueuedFiles(prev => [...prev, ...newFiles]);
  };

  const scanFile = async (queuedFile: QueuedFile) => {
    setQueuedFiles(prev =>
      prev.map(f => f.id === queuedFile.id ? { ...f, status: 'scanning' } : f)
    );

    try {
      const result = await onScan(queuedFile.file);
      setQueuedFiles(prev =>
        prev.map(f => f.id === queuedFile.id ? { ...f, status: 'complete', result } : f)
      );
    } catch (error) {
      setQueuedFiles(prev =>
        prev.map(f => f.id === queuedFile.id ? { ...f, status: 'error', error: 'Scan failed' } : f)
      );
    }
  };

  const scanAllPending = async () => {
    const pendingFiles = queuedFiles.filter(f => f.status === 'pending');
    for (const file of pendingFiles) {
      await scanFile(file);
    }
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setQueuedFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <FileText className="w-5 h-5 text-red-400" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-400" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) return <Image className="w-5 h-5 text-purple-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = queuedFiles.filter(f => f.status === 'pending').length;
  const scanningCount = queuedFiles.filter(f => f.status === 'scanning').length;
  const completedCount = queuedFiles.filter(f => f.status === 'complete').length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-900/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".txt,.csv,.json,.xml,.pdf,.doc,.docx,.xls,.xlsx,.md,.log,.html"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-slate-400 mt-1">
              Supports: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JSON, XML, MD, LOG
            </p>
          </div>
        </div>
      </div>

      {/* File Queue */}
      {queuedFiles.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">File Queue</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {pendingCount > 0 && (
                  <span className="px-2 py-1 bg-slate-700 rounded text-slate-300">
                    {pendingCount} pending
                  </span>
                )}
                {scanningCount > 0 && (
                  <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-400">
                    {scanningCount} scanning
                  </span>
                )}
                {completedCount > 0 && (
                  <span className="px-2 py-1 bg-green-500/20 rounded text-green-400">
                    {completedCount} complete
                  </span>
                )}
              </div>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Clear completed
                </button>
              )}
              {pendingCount > 0 && (
                <button
                  onClick={scanAllPending}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Scan All ({pendingCount})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {queuedFiles.map((qf) => (
              <div
                key={qf.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  qf.status === 'complete' && qf.result?.riskScore && qf.result.riskScore >= 70
                    ? 'bg-red-500/10 border-red-500/30'
                    : qf.status === 'complete'
                    ? 'bg-green-500/10 border-green-500/30'
                    : qf.status === 'scanning'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : qf.status === 'error'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                {getFileIcon(qf.file.name)}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{qf.file.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(qf.file.size)}</p>
                </div>

                {qf.status === 'pending' && (
                  <button
                    onClick={() => scanFile(qf)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30 disabled:opacity-50"
                  >
                    Scan
                  </button>
                )}

                {qf.status === 'scanning' && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Scanning...</span>
                  </div>
                )}

                {qf.status === 'complete' && qf.result && (
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${SEVERITY_STYLES[qf.result.riskLevel]} border`}>
                      {qf.result.riskScore}/100
                    </div>
                    <span className="text-sm text-slate-400">
                      {qf.result.findings?.length || 0} findings
                    </span>
                  </div>
                )}

                {qf.status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{qf.error}</span>
                  </div>
                )}

                <button
                  onClick={() => removeFile(qf.id)}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Results Detail */}
      {queuedFiles.filter(f => f.status === 'complete' && f.result).length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold mb-4">Scan Results</h3>
          <div className="space-y-4">
            {queuedFiles
              .filter(f => f.status === 'complete' && f.result)
              .map((qf) => (
                <div key={qf.id} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(qf.file.name)}
                      <span className="font-medium">{qf.file.name}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_STYLES[qf.result!.riskLevel]} border`}>
                      Risk: {qf.result!.riskLevel.toUpperCase()}
                    </div>
                  </div>
                  
                  {qf.result!.findings && qf.result!.findings.length > 0 ? (
                    <div className="space-y-2">
                      {qf.result!.findings.map((finding, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-900/50 rounded">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              finding.severity === 'critical' ? 'text-red-400' :
                              finding.severity === 'high' ? 'text-orange-400' :
                              finding.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                            <span>{finding.type}</span>
                          </div>
                          <span className="text-slate-400">{finding.count} found</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      No sensitive data detected
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Supported File Types */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Supported File Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { ext: 'PDF', icon: '📄', desc: 'PDF Documents' },
            { ext: 'DOC/DOCX', icon: '📝', desc: 'Word Documents' },
            { ext: 'XLS/XLSX', icon: '📊', desc: 'Excel Spreadsheets' },
            { ext: 'CSV', icon: '📋', desc: 'CSV Files' },
            { ext: 'TXT', icon: '📃', desc: 'Text Files' },
            { ext: 'JSON', icon: '🔧', desc: 'JSON Files' },
            { ext: 'XML', icon: '📰', desc: 'XML Files' },
            { ext: 'LOG', icon: '📜', desc: 'Log Files' },
          ].map((type) => (
            <div key={type.ext} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <p className="font-medium text-sm">{type.ext}</p>
                <p className="text-xs text-slate-400">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileScanner;
