
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bower text-slate-900">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
        <div className="p-4 bg-slate-50 rounded-b-lg text-right">
          <button
            onClick={onClose}
            className="bg-blue-700 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;