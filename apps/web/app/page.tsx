'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('/api/health', { method: 'GET' });
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
      setIsLoading(false);
    };

    checkAPI();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">AIGenda SaaS</h1>
        <p className="text-xl text-blue-100 mb-8">Plataforma de Agendamento Profissional</p>
        
        <div className="mb-8">
          {isLoading ? (
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className={`text-lg font-semibold ${apiStatus === 'online' ? 'text-green-300' : 'text-red-300'}`}>
              API: <span>{apiStatus === 'online' ? '✅ Online' : '❌ Offline'}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
          >
            Fazer Login
          </a>
          <br />
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-blue-400 text-white font-bold rounded-lg hover:bg-blue-500 transition"
          >
            Criar Conta
          </a>
        </div>

        <p className="text-blue-200 mt-8 text-sm">
          Desenvolvido com Next.js • Express • PostgreSQL • Redis
        </p>
      </div>
    </div>
  );
}
