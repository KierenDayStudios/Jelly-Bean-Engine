import React from 'react';

interface GlobalVariablesModalProps {
  variables: Record<string, any>;
  onUpdate: (variables: Record<string, any>) => void;
  onClose: () => void;
}

const GlobalVariablesModal: React.FC<GlobalVariablesModalProps> = ({
  variables,
  onUpdate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center bg-gray-800 p-4">
          <h2 className="text-lg font-bold">Global Variables</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <pre className="bg-gray-800 p-2 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(variables, null, 2)}
          </pre>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalVariablesModal;
