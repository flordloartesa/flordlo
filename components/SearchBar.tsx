"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Exemplo de lógica: Redirecionar ao carregar Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar"
          className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-[#2DD4BF] transition-all"
        />
        <Search className="absolute left-3 top-2.5 text-white/40 group-focus-within:text-[#2DD4BF]" size={18} />
        
        {query && (
          <button 
            type="button" 
            onClick={() => setQuery("")}
            className="absolute right-3 top-2.5 text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </form>
    </div>
  );
}