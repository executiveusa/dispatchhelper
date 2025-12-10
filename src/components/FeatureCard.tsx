import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-blue-500/30 bg-slate-900/50 p-6 hover:bg-slate-900/80 hover:border-blue-400 transition-all backdrop-blur-sm">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded bg-blue-600/20 border border-blue-400/50 p-3">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="font-semibold text-white font-mono tracking-wide">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/20" />
    </div>
  );
};

export default FeatureCard;