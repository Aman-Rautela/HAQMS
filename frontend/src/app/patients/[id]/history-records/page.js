'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, User, Phone, Calendar } from 'lucide-react';


export default function PatientHistoryRecords() {
  const { id } = useParams();
  const { token, API_BASE_URL, user } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPatient();
  }, [user]);

  const fetchPatient = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch patient record.');

      const data = await res.json();
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {loading ? (
          <p className="text-center text-black animate-pulse py-12">Loading patient record...</p>
        ) : error ? (
          <p className="text-center text-rose-500 py-12">{error}</p>
        ) : patient ? (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-black">
                    {patient.name}
                  </h1>
                  <p className="text-xs text-black font-semibold uppercase tracking-widest mt-1">
                    {patient.gender} · {patient.age} years old
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-black">
                  <Phone className="h-4 w-4" />
                  {patient.phoneNumber}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-black">
                    {patient.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-black">
                  <Calendar className="h-4 w-4" />
                  Registered: {new Date(patient.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="glass p-6 rounded-2xl border border-black dark:border-slate-800 shadow-md">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-black flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                Clinical History & Diagnostic Records
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-black leading-6">
                {patient.medicalHistory ?? 'No medical history recorded for this patient.'}
              </div>
            </div>

            {/* Appointments */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-black mb-4">
                Appointment History
              </h2>
              {patient.appointments?.length === 0 ? (
                <p className="text-black text-sm">No appointments found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left divide-y divide-slate-200 dark:divide-slate-800">
                    <thead>
                      <tr className="text-black uppercase text-xs font-bold tracking-widest">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patient.appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-500/5">
                          <td className="py-3 font-mono font-bold text-slate-800 dark:text-black">
                            {new Date(app.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-black">{app.reason || 'None provided'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-extrabold uppercase ${
                              app.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' :
                              app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
