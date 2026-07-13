import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Use Tailwind classes to match theme automatically
export interface MarketIndex {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  ytdReturn: number;
  pltmEps: number | null;
  divYield: number;
  marketCap: number;
  volume: number;
  chartData: number[];
  price: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface FinancialTableProps {
  title?: string;
  indices?: MarketIndex[];
  onIndexSelect?: (indexId: string) => void;
  className?: string;
}

const defaultIndices: MarketIndex[] = [
  {
    id: "1",
    name: "Dow Jones USA",
    country: "USA",
    countryCode: "US",
    ytdReturn: 0.40,
    pltmEps: 18.74,
    divYield: 2.00,
    marketCap: 28.04,
    volume: 1.7,
    chartData: [330.5, 331.2, 330.8, 331.5, 332.1, 331.8, 332.4, 333.2, 333.9, 333.7],
    price: 333.90,
    dailyChange: -0.20,
    dailyChangePercent: -0.06
  },
  {
    id: "2",
    name: "S&P 500 USA",
    country: "USA",
    countryCode: "US",
    ytdReturn: 11.72,
    pltmEps: 7.42,
    divYield: 1.44,
    marketCap: 399.6,
    volume: 24.6,
    chartData: [425.1, 426.3, 427.8, 428.1, 429.2, 428.9, 429.5, 429.1, 428.7, 428.9],
    price: 428.72,
    dailyChange: -0.82,
    dailyChangePercent: -0.19
  },
  {
    id: "3",
    name: "Nasdaq USA",
    country: "USA",
    countryCode: "US",
    ytdReturn: 36.59,
    pltmEps: null,
    divYield: 0.54,
    marketCap: 199.9,
    volume: 18.9,
    chartData: [360.2, 361.8, 362.4, 363.1, 364.3, 363.8, 364.1, 363.5, 363.2, 362.97],
    price: 362.97,
    dailyChange: -1.73,
    dailyChangePercent: -0.47
  },
  {
    id: "4",
    name: "TSX Canada",
    country: "Canada",
    countryCode: "CA",
    ytdReturn: -0.78,
    pltmEps: 6.06,
    divYield: 2.56,
    marketCap: 3.67,
    volume: 771.5,
    chartData: [32.1, 32.3, 32.5, 32.4, 32.7, 32.8, 32.9, 33.0, 32.9, 32.96],
    price: 32.96,
    dailyChange: 0.19,
    dailyChangePercent: 0.58
  },
  {
    id: "5",
    name: "Grupo BMV Mexico",
    country: "Mexico",
    countryCode: "MX",
    ytdReturn: 4.15,
    pltmEps: 8.19,
    divYield: 2.34,
    marketCap: 1.22,
    volume: 1.1,
    chartData: [52.1, 52.8, 53.2, 53.5, 53.9, 54.1, 54.3, 54.0, 53.8, 53.7],
    price: 53.70,
    dailyChange: -1.01,
    dailyChangePercent: -1.85
  },
  {
    id: "6",
    name: "Ibovespa Brazil",
    country: "Brazil",
    countryCode: "BR",
    ytdReturn: 11.19,
    pltmEps: 6.23,
    divYield: 9.46,
    marketCap: 4.87,
    volume: 6.8,
    chartData: [28.5, 28.8, 29.1, 29.3, 29.5, 29.4, 29.6, 29.5, 29.3, 29.28],
    price: 29.28,
    dailyChange: -0.06,
    dailyChangePercent: -0.22
  }
];

export default function FinancialTable({
  title = "Index",
  indices: initialIndices = defaultIndices,
  onIndexSelect,
  className = ""
}: FinancialTableProps = {}) {
  const indices = initialIndices;
  const [selectedIndex, setSelectedIndex] = useState<string | null>("1");
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleIndexSelect = (indexId: string) => {
    setSelectedIndex(indexId);
    if (onIndexSelect) {
      onIndexSelect(indexId);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatLargeNumber = (amount: number, unit: string) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}${unit}`;
    }
    return `${amount.toFixed(1)}${unit}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    const isPositive = value >= 0;
    // Using Veriscope theme tailwind classes
    const bgColor = isPositive 
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : "bg-rose-50 dark:bg-rose-950/30";
    const borderColor = isPositive 
      ? "border-emerald-200 dark:border-emerald-900/50"
      : "border-rose-200 dark:border-rose-900/50";
    const textColor = isPositive 
      ? "text-emerald-600 dark:text-[#00ff9d]"
      : "text-rose-600 dark:text-[#ff3366]";
    const shadowColor = isPositive
      ? "shadow-[0_0_12px_rgba(16,185,129,0.15)] dark:shadow-[0_0_12px_rgba(0,255,157,0.15)]"
      : "shadow-[0_0_12px_rgba(244,63,94,0.15)] dark:shadow-[0_0_12px_rgba(255,51,102,0.15)]";
    
    return { bgColor, borderColor, textColor, shadowColor };
  };

  const getCountryFlag = (countryCode: string) => {
    switch (countryCode) {
      case "US":
        return (
          <svg width="32" height="32" viewBox="0 0 130 120" fill="none" className="scale-125">
            <rect y="0" fill="#DC4437" width="130" height="13.3"/>
            <rect y="26.7" fill="#DC4437" width="130" height="13.3"/>
            <rect y="80" fill="#DC4437" width="130" height="13.3"/>
            <rect y="106.7" fill="#DC4437" width="130" height="13.3"/>
            <rect y="53.3" fill="#DC4437" width="130" height="13.3"/>
            <rect y="13.3" fill="#FFFFFF" width="130" height="13.3"/>
            <rect y="40" fill="#FFFFFF" width="130" height="13.3"/>
            <rect y="93.3" fill="#FFFFFF" width="130" height="13.3"/>
            <rect y="66.7" fill="#FFFFFF" width="130" height="13.3"/>
            <rect y="0" fill="#2A66B7" width="70" height="66.7"/>
            <polygon fill="#FFFFFF" points="13.5,4 15.8,8.9 21,9.7 17.2,13.6 18.1,19 13.5,16.4 8.9,19 9.8,13.6 6,9.7 11.2,8.9"/>
            <polygon fill="#FFFFFF" points="34,4 36.3,8.9 41.5,9.7 37.8,13.6 38.6,19 34,16.4 29.4,19 30.2,13.6 26.5,9.7 31.7,8.9"/>
            <polygon fill="#FFFFFF" points="54.5,4 56.8,8.9 62,9.7 58.2,13.6 59.1,19 54.5,16.4 49.9,19 50.8,13.6 47,9.7 52.2,8.9"/>
            <polygon fill="#FFFFFF" points="24,24 26.3,28.9 31.5,29.7 27.8,33.6 28.6,39 24,36.4 19.4,39 20.2,33.6 16.5,29.7 21.7,28.9"/>
            <polygon fill="#FFFFFF" points="44.5,24 46.8,28.9 52,29.7 48.2,33.6 49.1,39 44.5,36.4 39.9,39 40.8,33.6 37,29.7 42.2,28.9"/>
            <polygon fill="#FFFFFF" points="13.5,45.2 15.8,50.1 21,50.9 17.2,54.7 18.1,60.2 13.5,57.6 8.9,60.2 9.8,54.7 6,50.9 11.2,50.1"/>
            <polygon fill="#FFFFFF" points="34,45.2 36.3,50.1 41.5,50.9 37.8,54.7 38.6,60.2 34,57.6 29.4,60.2 30.2,54.7 26.5,50.9 31.7,50.1"/>
            <polygon fill="#FFFFFF" points="54.5,45.2 56.8,50.1 62,50.9 58.2,54.7 59.1,60.2 54.5,57.6 49.9,60.2 50.8,54.7 47,50.9 52.2,50.1"/>
          </svg>
        );
      case "CA":
        return (
          <svg width="32" height="32" viewBox="0 0 90 60" fill="none" className="scale-150">
            <rect width="90" height="60" fill="#FF0000"/>
            <rect x="30" width="30" height="60" fill="#FFFFFF"/>
            <polygon fill="#FF0000" points="45,15 50,20 45,25 40,20"/>
            <polygon fill="#FF0000" points="45,35 50,40 45,45 40,40"/>
          </svg>
        );
      case "MX":
        return (
          <svg width="32" height="32" viewBox="0 0 90 60" fill="none" className="scale-150">
            <rect width="30" height="60" fill="#006847"/>
            <rect x="30" width="30" height="60" fill="#FFFFFF"/>
            <rect x="60" width="30" height="60" fill="#CE1126"/>
          </svg>
        );
      case "BR":
        return (
          <svg width="32" height="32" viewBox="0 0 90 60" fill="none" className="scale-150">
            <rect width="90" height="60" fill="#009639"/>
            <polygon fill="#FEDD00" points="45,30 20,15 20,45"/>
            <circle cx="45" cy="30" r="8" fill="#002776"/>
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="scale-125">
            <rect width="32" height="32" fill="#E5E7EB" rx="4"/>
            <text x="16" y="20" textAnchor="middle" fontSize="12" fill="#6B7280">?</text>
          </svg>
        );
    }
  };

  const renderSparkline = (data: number[], valueChange: number) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const createPath = (dataPoints: number[]) => {
      return dataPoints.map((value, index) => {
        const x = (index / (dataPoints.length - 1)) * 60;
        const y = 20 - ((value - min) / range) * 15;
        return `${x},${y}`;
      }).join(' ');
    };

    const fullPath = createPath(data);
    const isPositive = valueChange >= 0;

    return (
      <div className="w-16 h-6">
        <motion.svg 
          width="60" 
          height="20" 
          viewBox="0 0 60 20" 
          className="overflow-visible"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            duration: shouldReduceMotion ? 0.2 : 0.5
          }}
        >
          {/* Full line (white) */}
          {fullPath && (
            <motion.polyline
              points={fullPath}
              fill="none"
              stroke={isPositive ? "#10b981" : "#f43f5e"}
              strokeWidth="2"
              className={isPositive ? "drop-shadow-[0_0_3px_rgba(16,185,129,0.5)] dark:drop-shadow-[0_0_5px_rgba(0,255,157,0.8)]" : "drop-shadow-[0_0_3px_rgba(244,63,94,0.5)] dark:drop-shadow-[0_0_5px_rgba(255,51,102,0.8)]"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: shouldReduceMotion ? 0.3 : 0.8,
                ease: "easeOut",
                delay: 0.2
              }}
            />
          )}
        </motion.svg>
      </div>
    );
  };

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    }
  };

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
  };

  return (
    <div className={`w-full max-w-7xl mx-auto shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] rounded-2xl ${className}`}>
      {/* Table Container with horizontal scroll */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#273449] rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table Headers */}
            <div 
              className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-[#273449] text-left"
              style={{
                display: 'grid',
                gridTemplateColumns: '250px 100px minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(80px, 1fr) minmax(60px, 1fr) minmax(100px, 1fr)',
                columnGap: '6px'
              }}
            >
              <div style={{ textAlign: 'left' }}>{title}</div>
              <div style={{ textAlign: 'left' }}>YTD Return</div>
              <div style={{ textAlign: 'left' }}>P/LTM EPS</div>
              <div style={{ textAlign: 'left' }}>Div yield</div>
              <div style={{ textAlign: 'left' }}>Mkt cap</div>
              <div style={{ textAlign: 'left' }}>Volume</div>
              <div style={{ textAlign: 'left' }}>2-day chart</div>
              <div style={{ textAlign: 'left' }}>Price</div>
              <div style={{ textAlign: 'left' }} className="pr-4">Daily performance</div>
            </div>

            {/* Table Rows */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-slate-100 dark:divide-slate-800"
            >
              {indices.map((index, indexNum) => (
                <motion.div key={index.id} variants={rowVariants}>
                  <div
                    className={`px-8 py-4 cursor-pointer group relative transition-all duration-200 ${
                      selectedIndex === index.id 
                        ? "bg-slate-50 dark:bg-slate-800/80" 
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    }`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '250px 100px minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(80px, 1fr) minmax(60px, 1fr) minmax(100px, 1fr)',
                      columnGap: '6px'
                    }}
                    onClick={() => handleIndexSelect(index.id)}
                  >
                {/* Market Info */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <div className="w-full h-full">
                      {getCountryFlag(index.countryCode)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white font-serif truncate text-sm">{index.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{index.country}</div>
                  </div>
                </div>

                {/* YTD Return */}
                <div className="flex items-center">
                  {(() => {
                    const { bgColor, borderColor, textColor, shadowColor } = getPerformanceColor(index.ytdReturn);
                    return (
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${bgColor} ${borderColor} ${textColor} ${shadowColor}`}>
                        {formatPercentage(index.ytdReturn)}
                      </div>
                    );
                  })()}
                </div>

                {/* P/LTM EPS */}
                <div className="flex items-center">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {index.pltmEps ? index.pltmEps.toFixed(2) : "N/A"}
                  </span>
                </div>

                {/* Dividend Yield */}
                <div className="flex items-center">
                  <span className="font-bold font-mono text-amber-500 dark:text-amber-400 text-sm">
                    {formatPercentage(index.divYield)}
                  </span>
                </div>

                {/* Market Cap */}
                <div className="flex items-center">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {formatLargeNumber(index.marketCap, "B")}
                  </span>
                </div>

                {/* Volume */}
                <div className="flex items-center">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {index.volume >= 1 ? formatLargeNumber(index.volume, "M") : `${(index.volume * 1000).toFixed(1)}k`}
                  </span>
                </div>

                {/* 2-day Chart */}
                <div className="flex items-center">
                  <div className="px-2">
                    {renderSparkline(index.chartData, index.dailyChange)}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-md">
                    {formatCurrency(index.price)}
                  </span>
                </div>

                {/* Daily Performance */}
                <div className="flex items-center gap-2 pr-4">
                  <span className={`font-bold font-mono text-sm ${getPerformanceColor(index.dailyChange).textColor}`}>
                    {index.dailyChange >= 0 ? "+" : ""}{index.dailyChange.toFixed(2)}
                  </span>
                  {(() => {
                    const { bgColor, borderColor, textColor, shadowColor } = getPerformanceColor(index.dailyChangePercent);
                    return (
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${bgColor} ${borderColor} ${textColor} ${shadowColor}`}>
                        {formatPercentage(index.dailyChangePercent)}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
