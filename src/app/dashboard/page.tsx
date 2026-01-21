"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  ShieldAlert,
  Coins,
  Check,
  Loader2
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const personas: Persona[] = [
  {
    id: "vc",
    name: "Gus",
    role: "VC Partner",
    icon: Coins,
    color: "bg-brutal-yellow",
    description: "Evaluates scalability, market size, and investment potential"
  },
  {
    id: "angel",
    name: "Walter",
    role: "Angel Investor",
    icon: Target,
    color: "bg-brutal-purple",
    description: "Evaluates founder-market fit and early-stage viability"
  },
  {
    id: "customer",
    name: "Jesse",
    role: "First Customer",
    icon: Users,
    color: "bg-brutal-blue",
    description: "Assesses if they would actually use and pay for this"
  },
  {
    id: "growth",
    name: "Saul",
    role: "Growth Marketer",
    icon: TrendingUp,
    color: "bg-brutal-green",
    description: "Analyzes go-to-market strategy and growth levers"
  },
  {
    id: "risk",
    name: "Mike",
    role: "Risk Officer",
    icon: ShieldAlert,
    color: "bg-brutal-pink",
    description: "Identifies potential pitfalls, threats, and blind spots"
  },
];

export default function HomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(
    personas.map(p => p.id) // All selected by default
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePersona = (personaId: string) => {
    setSelectedPersonas(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const selectAllPersonas = () => {
    setSelectedPersonas(personas.map(p => p.id));
  };

  const deselectAllPersonas = () => {
    setSelectedPersonas([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (selectedPersonas.length === 0) {
      alert("Please select at least one validator!");
      return;
    }

    setIsSubmitting(true);

    // Navigate to results page with idea and selected personas
    const params = new URLSearchParams({
      idea: inputValue.trim(),
      personas: selectedPersonas.join(","),
    });

    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="flex h-screen bg-brutal-cream">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

        {/* Hero Section */}
        <div className="relative z-10 max-w-4xl w-full text-center mt-8 mb-8">
          <div className="inline-flex items-center gap-3 bg-brutal-yellow border-2 border-black shadow-brutal px-6 py-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Validate Your Idea
            </h1>
          </div>
          <p className="text-lg font-bold text-gray-600">
            Get expert feedback from 5 different perspectives before you build.
          </p>
        </div>

        {/* Persona Selection Grid */}
        <div className="relative z-10 w-full max-w-4xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black uppercase text-lg">Choose Your Validators</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAllPersonas}
                className="px-3 py-1 bg-white border-2 border-black shadow-brutal-sm text-sm font-bold uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                All
              </button>
              <button
                onClick={deselectAllPersonas}
                className="px-3 py-1 bg-white border-2 border-black shadow-brutal-sm text-sm font-bold uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                None
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {personas.map((persona) => {
              const isSelected = selectedPersonas.includes(persona.id);
              const IconComponent = persona.icon;

              return (
                <button
                  key={persona.id}
                  onClick={() => togglePersona(persona.id)}
                  disabled={isSubmitting}
                  className={`
                                        relative p-4 border-2 border-black text-left
                                        transition-all group
                                        ${isSelected
                      ? `${persona.color} shadow-brutal`
                      : "bg-white shadow-brutal-sm opacity-60"
                    }
                                        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                >
                  {/* Selection indicator */}
                  <div className={`
                                        absolute top-2 right-2 w-6 h-6 border-2 border-black
                                        flex items-center justify-center
                                        ${isSelected ? "bg-black" : "bg-white"}
                                    `}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <IconComponent className="w-8 h-8 mb-3" />
                  <h3 className="font-black uppercase text-sm">{persona.name}</h3>
                  <p className="text-xs font-bold text-gray-700 mb-2">{persona.role}</p>
                  <p className="text-xs text-gray-600 leading-tight">{persona.description}</p>
                </button>
              );
            })}
          </div>

          <p className="text-center text-sm font-bold text-gray-500 mt-3">
            {selectedPersonas.length} of {personas.length} validators selected
          </p>
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-4xl">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your startup idea in detail... What problem does it solve? Who is your target audience? How will you make money?"
              rows={5}
              disabled={isSubmitting}
              className="
                                w-full p-5 pr-16 text-lg font-bold
                                bg-white border-4 border-black shadow-brutal-lg
                                resize-none focus:outline-none focus:shadow-brutal-xl
                                transition-shadow placeholder:text-gray-400
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || selectedPersonas.length === 0 || isSubmitting}
              className={`
                                absolute right-4 bottom-4
                                p-3 bg-black text-white
                                border-2 border-black shadow-brutal-sm
                                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm
                            `}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {/* Footer Hint */}
        <p className="relative z-10 mt-6 text-sm font-bold text-gray-400 uppercase">
          Press Enter to validate • Shift+Enter for new line
        </p>
      </main>
    </div>
  );
}
