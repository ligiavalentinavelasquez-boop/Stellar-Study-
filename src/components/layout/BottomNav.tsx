import { BookOpen, Stethoscope, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'ingles', icon: BookOpen, label: 'Inglés' },
    { id: 'medicina', icon: Stethoscope, label: 'Medicina' },
    { id: 'calendario', icon: Home, label: 'Inicio' },
    { id: 'perfil', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1f1f27]/95 backdrop-blur-xl border-t border-[#27272a] pb-safe pt-3 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative",
                isActive ? "text-[#bb86fc]" : "text-[#a1a1aa] hover:text-[#e4e4e7]"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-[#bb86fc]/10 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9px] font-black uppercase tracking-widest mt-1"
                >
                  {tab.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
