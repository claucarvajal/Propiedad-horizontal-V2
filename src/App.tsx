/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Chatbot } from './components/Chatbot';
import { ServiceLinks } from './components/ServiceLinks';
import { PaymentHistory } from './components/PaymentHistory';
import { LogOut, Building2, User as UserIcon, LayoutDashboard, MessageSquare, CreditCard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [complex, setComplex] = useState<any>(null);
  const [complexes, setComplexes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [isConfigured, setIsConfigured] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const checkConfig = () => {
      const url = (import.meta as any).env.VITE_SUPABASE_URL;
      const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key || url === "" || key === "") {
        setIsConfigured(false);
      }
    };
    checkConfig();
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      setDbStatus('connecting');
      const { data, error } = await supabase.from('complexes').select('*');
      if (error) throw error;
      
      // If we get here, connection is successful
      setDbStatus('connected');
      
      if (data) {
        setComplexes(data);
      }
    } catch (err) {
      console.error("Error fetching complexes:", err);
      setDbStatus('error');
    }
  };

  const fetchPayments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      if (data) setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const handleLogin = async (complexId: string, idNumber: string) => {
    console.log(`[Login] Intentando ingresar - Conjunto ID: ${complexId}, Cédula: ${idNumber}`);
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('idNumber', idNumber.trim())
      .eq('complexId', complexId)
      .limit(1);

    if (userError) {
      console.error("[Login] Error en búsqueda de usuario:", userError.message);
      throw new Error('User not found');
    }

    const userData = users && users.length > 0 ? users[0] : null;

    if (!userData) {
      console.warn("[Login] No se encontró el usuario en la base de datos.");
      throw new Error('User not found');
    }

    console.log("[Login] Usuario encontrado:", userData.name);

    const { data: complexData, error: complexError } = await supabase
      .from('complexes')
      .select('*')
      .eq('id', complexId)
      .single();

    if (complexError || !complexData) {
      throw new Error('Complex not found');
    }

    setUser(userData);
    setComplex(complexData);
    fetchPayments(userData.id);
  };

  const handleLogout = () => {
    setUser(null);
    setComplex(null);
    setPayments([]);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Configuración Requerida</h1>
          <p className="text-gray-600 mb-6">
            Para que la aplicación funcione con datos reales, debes configurar tus credenciales de Supabase en el panel de <b>Secrets</b>.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-xl text-xs font-mono space-y-2">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="mt-6 text-sm text-gray-400 italic">
            Una vez configuradas, reinicia la aplicación para conectar con tu base de datos.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} complexes={complexes} dbStatus={dbStatus} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">Propiedad Inteligente</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{complex.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Servicios y Pagos</h2>
                  <p className="text-sm text-gray-500">Accede rápidamente a tus facturas</p>
                </div>
                <ServiceLinks complex={complex} />
              </section>

              <section>
                <PaymentHistory payments={payments} />
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Asistente Virtual</h2>
                <p className="text-sm text-gray-500">Resuelve tus dudas al instante</p>
              </div>
              <Chatbot complexId={complex.id} complexName={complex.name} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 sm:py-4">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              activeTab === 'dashboard' ? "text-blue-600 bg-blue-50" : "text-gray-400"
            )}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              activeTab === 'chat' ? "text-blue-600 bg-blue-50" : "text-gray-400"
            )}
          >
            <MessageSquare size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chatbot</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
