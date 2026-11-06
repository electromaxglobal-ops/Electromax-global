import React, { useState } from 'react';
import { Camera, Trash2, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal.tsx';

interface PhotoCaptureFieldProps {
  label: string;
  value?: string | null;
  onChange: (base64OrEmpty: string) => void;
  required?: boolean;
  helpText?: string;
  helperText?: string;
}

export const PhotoCaptureField: React.FC<PhotoCaptureFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  helpText,
  helperText,
}) => {
  const displayHelp = helpText || helperText;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="block text-slate-500 font-semibold">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Attached
          </span>
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <div
            onClick={() => setIsPreviewOpen(true)}
            className="w-12 h-12 rounded-lg bg-black/10 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700 cursor-pointer relative group"
          >
            <img src={value} alt="Attachment" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block truncate">
              Photo Captured
            </span>
            <span className="text-[10px] text-slate-400">Hardware Camera / Gallery Attached</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Retake Photo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Remove Photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-orange-500/5 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 text-orange-500" />
          <span>Capture Photo with Camera / Gallery</span>
        </button>
      )}

      {displayHelp && <p className="text-[10px] text-slate-400">{displayHelp}</p>}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCapture={(base64) => onChange(base64)}
        title={`Take Photo for ${label}`}
      />

      {/* Image Preview Modal */}
      {isPreviewOpen && value && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-xl max-h-[85vh] p-2 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            <img src={value} alt="Preview" className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
            <div className="text-center pt-2 text-xs text-slate-400 font-semibold">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
