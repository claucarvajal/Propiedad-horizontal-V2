import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Payment {
  id: string;
  amount: number;
  date: string;
  concept: string;
  status: 'completed' | 'pending' | 'failed';
}

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Historial de Pagos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold">Concepto</th>
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold">Monto</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                  No se encontraron registros de pagos.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{payment.concept}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(payment.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-700">
                    ${payment.amount.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(payment.status)}
                      <span className={cn(
                        "text-xs font-medium",
                        payment.status === 'completed' ? "text-green-700" : 
                        payment.status === 'pending' ? "text-amber-700" : "text-red-700"
                      )}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
