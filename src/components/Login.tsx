import React, { useState } from 'react';
import { Building2, User, ArrowRight, Loader2, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Complex {
  id: string;
  name: string;
}

export function Login({ 
  onLogin, 
  complexes, 
  dbStatus 
}: { 
  onLogin: (complexId: string, idNumber: string) => Promise<void>, 
  complexes: Complex[],
  dbStatus: 'connecting' | 'connected' | 'error'
}) {
  const [selectedComplex, setSelectedComplex] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplex || !idNumber) return;

    setIsLoading(true);
    setError('');
    try {
      await onLogin(selectedComplex, idNumber);
    } catch (err: any) {
      setError('No se encontró un residente con esa cédula en este conjunto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 relative"
      >
        {/* DB Status Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5">
          {dbStatus === 'connecting' && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <RefreshCcw size={10} className="animate-spin" />
              <span>Conectando...</span>
            </div>
          )}
          {dbStatus === 'connected' && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-green-500">
              <CheckCircle2 size={10} />
              <span>Base de Datos Online</span>
            </div>
          )}
          {dbStatus === 'error' && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-red-500">
              <XCircle size={10} />
              <span>Error de Conexión</span>
            </div>
          )}
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedad Inteligente</h1>
          <p className="text-gray-500 mt-2">Bienvenido a tu gestión residencial en Bucaramanga</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecciona tu Conjunto</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedComplex}
                onChange={(e) => setSelectedComplex(e.target.value)}
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none text-gray-700"
                required
              >
                <option value="">Seleccionar...</option>
                {complexes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Cédula</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Ej: 1098765432"
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Ingresar <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400">
            © 2026 Propiedad Inteligente Bucaramanga. <br/>
            Gestión y automatización de procesos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
