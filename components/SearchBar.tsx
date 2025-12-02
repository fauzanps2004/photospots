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
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
        <svg className={`w-6 h-6 transition-colors ${isLoading ? 'text-pink-300' : 'text-pink-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari photobooth..."
        disabled={isLoading}
        className="block w-full pl-14 pr-4 py-4 bg-white border-2 border-pink-200 rounded-3xl text-gray-700 placeholder-pink-300 shadow-3d focus:outline-none focus:border-pink-400 focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(251,113,133,0.25)] transition-all text-lg font-bold disabled:bg-pink-50"
      />
      {isLoading && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;