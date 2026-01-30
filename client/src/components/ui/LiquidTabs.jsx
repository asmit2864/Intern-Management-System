import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LiquidTabs = ({ tabs, activeId }) => {
    const navigate = useNavigate();

    return (
        <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-xl shadow-inner border border-white/20 relative">
            {tabs.map((tab) => {
                const isActive = activeId === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors z-10
                            ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="liquid-pill"
                                className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-lg shadow-[0_2px_8px_rgba(31,41,55,0.06)] border border-white/50 -z-10 bg-gradient-to-br from-white/80 to-white/40"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30
                                }}
                            />
                        )}
                        <div className="relative flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            {tab.label}
                            {tab.badge && (
                                <span className="flex h-2 w-2 relative">
                                    {tab.badge}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default LiquidTabs;
