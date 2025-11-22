import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, buttonText, onButtonClick }) => {
  return (
    <div className="text-center py-16 px-6 bg-secondary rounded-lg">
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      <p className="text-text-secondary mt-2 mb-6">{message}</p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center space-x-2 bg-highlight hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          <PlusIcon />
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
