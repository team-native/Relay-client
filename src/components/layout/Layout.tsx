import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export interface LayoutContext {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="max-w-5xl mx-auto px-8 py-10">
        <Outlet context={{ searchQuery, setSearchQuery } satisfies LayoutContext} />
      </main>
    </div>
  );
}