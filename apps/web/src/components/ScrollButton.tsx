'use client';

export function ScrollButton() {
  return (
    <button
      onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
      className="border-2 border-amber-500 hover:bg-amber-500/10 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition"
    >
      Conheça Nossos Serviços
    </button>
  );
}
