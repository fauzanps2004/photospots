import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className={`w-5 h-5 transition-colors ${isLoading ? 'text-pink-200' : 'text-pink-300 group-focus-within:text-pink-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari photobooth..."
        disabled={isLoading}
        className="block w-full pl-11 pr-4 py-4 bg-white border-2 border-white rounded-2xl text-gray-700 placeholder-pink-200 shadow-soft focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-200 transition-all text-base font-medium disabled:bg-pink-50 disabled:text-pink-300"
      />
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-pink-100 border-t-pink-400 rounded-full animate-spin"></div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;