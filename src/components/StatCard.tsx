import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  icon?: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  status, 
  statusColor, 
  icon,
  isEmpty,
  emptyTitle,
  emptySubtitle 
}: StatCardProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-slate-800/60 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-white text-xl font-medium">{title}</h3>
        </div>
        {status && (
          <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white/10 ${statusColor}`}>
            {status}
          </span>
        )}
      </div>
      
      <div className="text-center">
        {isEmpty ? (
          <div className="py-12">
            <div className="text-white/40 text-lg mb-2">{emptyTitle || "No data yet"}</div>
            <div className="text-white/30 text-sm">{emptySubtitle || "Add your first reading"}</div>
          </div>
        ) : (
          <>
            <div className="text-6xl font-light text-white mb-2">{value}</div>
            {subtitle && (
              <div className="text-white/60 text-sm mb-4">{subtitle}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatCard;