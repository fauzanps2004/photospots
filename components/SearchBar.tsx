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
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari lokasi..."
        disabled={isLoading}
        className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 text-gray-900 placeholder-gray-400 focus:ring-0 focus:bg-gray-100 transition-all text-lg"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 disabled:opacity-0 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;