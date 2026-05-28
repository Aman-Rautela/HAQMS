'use client';

import { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Bell } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PublicMonitor() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchQueueData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue`);
      if (!res.ok) return;
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const intervalId = setInterval(fetchQueueData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const groupedTokens = tokens.reduce((groups, token) => {
    const docId = token.doctorId;
    if (!groups[docId]) {
      groups[docId] = {
        doctorName: token.doctor.name,
        specialization: token.doctor.specialization,
        calling: null,
        waiting: [],
      };
    }
    if (token.status === 'CALLING') groups[docId].calling = token;
    else if (token.status === 'WAITING') groups[docId].waiting.push(token);
    return groups;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-600 font-extrabold text-2xl">
            <Monitor className="h-6 w-6" />
            HAQMS Live Monitor
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-600 text-xs font-bold uppercase">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Auto Refreshing · {refreshCount} polls
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {loading ? (
          <p className="text-center text-black py-20 animate-pulse">Loading queue...</p>
        ) : Object.keys(groupedTokens).length === 0 ? (
          <div className="text-center py-20">
            <Bell className="h-12 w-12 text-black mx-auto animate-bounce" />
            <p className="mt-4 text-black">No active tokens right now.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedTokens).map(([docId, docInfo]) => (
              <div key={docId} className="glass rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                <div className="bg-slate-500/5 p-5 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-extrabold text-lg text-black dark:text-black">{docInfo.doctorName}</h3>
                  <p className="text-xs text-teal-600 font-bold uppercase tracking-wider mt-0.5">{docInfo.specialization}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Now Calling</h4>
                    {docInfo.calling ? (
                      <div className="bg-teal-500/10 border border-teal-500/30 p-6 rounded-2xl text-center">
                        <span className="block text-5xl font-black text-teal-600 animate-pulse">
                          #{docInfo.calling.tokenNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl text-center">
                        <span className="text-2xl font-extrabold text-black italic">Idle</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Queue</h4>
                    {docInfo.waiting.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {docInfo.waiting.map((token) => (
                          <div key={token.id} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-black dark:text-black">
                            #{token.tokenNumber}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-black italic">No patients waiting</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
