import * as React from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, MoreHorizontal, TrendingUp, TrendingDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TYPE DEFINITIONS ---
export type StockHolding = {
  ticker: string;
  name: string;
  shares: number;
  lastPrice: number;
  changeValue: number;
  changePercent: number;
};

export type NewsArticle = {
  category: string;
  time: string;
  title: string;
  source: string;
};

export type StockPortfolioCardProps = {
  totalGain: number;
  returnPercentage: number;
  asOfDate: string;
  holdings: StockHolding[];
  news: NewsArticle[];
  className?: string;
};

// --- HELPER TO FORMAT CURRENCY ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// --- SUB-COMPONENTS ---
const StockHoldingItem: React.FC<{ holding: StockHolding }> = ({ holding }) => {
  const isPositive = holding.changeValue >= 0;
  return (
    <div className="flex items-center justify-between py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-sm">{holding.ticker.substring(0, 3)}</span>
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white font-serif">{holding.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{holding.shares} shares</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-slate-900 dark:text-white font-mono text-lg">{formatCurrency(holding.lastPrice)}</p>
        <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold font-mono mt-0.5", isPositive ? "text-emerald-500 dark:text-[#00ff9d]" : "text-rose-500 dark:text-[#ff3366]")}>
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{isPositive ? "+" : ""}{formatCurrency(holding.changeValue)}</span>
          <span className="opacity-80">({isPositive ? "+" : ""}{holding.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
};

const NewsItem: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="flex-shrink-0 w-[260px] p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#273449] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all cursor-pointer group">
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
      <span className="text-blue-600 dark:text-blue-400">{article.category}</span>
      <span>•</span>
      <span>{article.time}</span>
    </div>
    <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">{article.title}</p>
    <a href="#" className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
      {article.source} <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
    </a>
  </div>
);


// --- MAIN COMPONENT ---
export default function StockPortfolioCard({
  totalGain,
  returnPercentage,
  asOfDate,
  holdings,
  news,
  className,
}: StockPortfolioCardProps) {
  const isPositiveReturn = returnPercentage >= 0;

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full rounded-3xl border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] p-8 space-y-8 backdrop-blur-xl relative overflow-hidden", className)}
    >
      {/* Background glow effect for electric themes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total gain</p>
          <h2 className="text-5xl font-serif font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">{formatCurrency(totalGain)}</h2>
          <div className={cn("mt-3 flex items-center gap-2 text-sm font-bold font-mono px-3 py-1.5 rounded-lg w-fit", isPositiveReturn ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-[#00ff9d] border border-emerald-100 dark:border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(0,255,157,0.15)]" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-[#ff3366] border border-rose-100 dark:border-rose-900/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:shadow-[0_0_15px_rgba(255,51,102,0.15)]")}>
            {isPositiveReturn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isPositiveReturn ? "+" : ""}{returnPercentage.toFixed(2)}% Return
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-4 sm:mt-0">As of {asOfDate}</p>
      </motion.div>

      {/* Holdings Section */}
      <motion.div variants={itemVariants} className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> Active Holdings
          </h3>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {holdings.map((holding) => (
            <StockHoldingItem key={holding.ticker} holding={holding} />
          ))}
        </div>
      </motion.div>

      {/* Related News Section */}
      <motion.div variants={itemVariants} className="pt-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> Market Signals
          </h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-xs"><ChevronLeft className="h-4 w-4" /></button>
            <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-xs"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {news.map((article, index) => (
                <NewsItem key={index} article={article} />
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
