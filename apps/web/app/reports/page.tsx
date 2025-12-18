"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type SalesPoint = { date: string; total: number };
type FinancePoint = { type: string; total: number };
type ApptPoint = { status: string; count: number };

export default function ReportsPage() {
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [finance, setFinance] = useState<FinancePoint[]>([]);
  const [appts, setAppts] = useState<ApptPoint[]>([]);

  async function load() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      const [sRes, fRes, aRes] = await Promise.all([
        axios.get(`${base}/api/reports/sales`, { params: { start, end } }),
        axios.get(`${base}/api/reports/finance`, { params: { start, end } }),
        axios.get(`${base}/api/reports/appointments`, { params: { start, end } }),
      ]);
      setSales(sRes.data.data || []);
      setFinance(fRes.data.data || []);
      setAppts(aRes.data.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load reports', err);
    }
  }

  useEffect(() => { load(); }, [start, end]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA46BE'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="flex gap-3 mb-6">
        <label>
          Início:{' '}
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border px-2 py-1" />
        </label>
        <label>
          Fim:{' '}
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border px-2 py-1" />
        </label>
        <button onClick={load} className="bg-blue-600 text-white px-3 py-1 rounded">Atualizar</button>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Vendas (últimos dias)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Financeiro (por tipo)</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={finance} dataKey="total" nameKey="type" outerRadius={80} label>
                  {finance.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Agendamentos (status)</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={appts} dataKey="count" nameKey="status" outerRadius={80} label>
                  {appts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
