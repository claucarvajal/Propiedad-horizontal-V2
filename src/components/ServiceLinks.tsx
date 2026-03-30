import React from 'react';
import { CreditCard, Droplets, Zap, Flame, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface Service {
  name: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

export function ServiceLinks({ complex }: { complex: any }) {
  const services: Service[] = [
    { name: 'Administración', icon: <CreditCard size={20} />, color: 'bg-blue-50 text-blue-600', link: complex?.adminLink || '#' },
    { name: 'Agua', icon: <Droplets size={20} />, color: 'bg-cyan-50 text-cyan-600', link: complex?.waterLink || '#' },
    { name: 'Luz', icon: <Zap size={20} />, color: 'bg-yellow-50 text-yellow-600', link: complex?.lightLink || '#' },
    { name: 'Gas', icon: <Flame size={20} />, color: 'bg-orange-50 text-orange-600', link: complex?.gasLink || '#' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {services.map((service) => (
        <a
          key={service.name}
          href={service.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", service.color)}>
            {service.icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{service.name}</span>
          <ExternalLink size={12} className="mt-2 text-gray-300 group-hover:text-gray-500" />
        </a>
      ))}
    </div>
  );
}
