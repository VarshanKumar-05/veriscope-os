import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function IntelligenceRadar({ data }: { data: any }) {
  // Map company risks and fundamentals into radar shape
  const chartData = [
    { subject: 'Financial Health', A: data.financialHealth || 85, fullMark: 100 },
    { subject: 'Market Position', A: data.marketPosition || 90, fullMark: 100 },
    { subject: 'Growth Potential', A: data.growthPotential || 75, fullMark: 100 },
    { subject: 'Innovation', A: data.innovation || 80, fullMark: 100 },
    { subject: 'Risk Mitigation', A: data.riskMitigation || 70, fullMark: 100 },
    { subject: 'ESG Metrics', A: data.esg || 65, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full min-h-[250px] bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] rounded-2xl p-5 shadow-xs flex flex-col">
      <h3 className="font-serif font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 text-slate-900 dark:text-white">
        Intelligence Radar
      </h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="var(--border-custom)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-custom)', borderRadius: '12px', fontSize: '11px', boxShadow: 'var(--shadow)' }}
              itemStyle={{ color: 'var(--primary-custom)', fontWeight: 'bold' }}
            />
            <Radar name="Company Metrics" dataKey="A" stroke="var(--primary-custom)" fill="var(--primary-custom)" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
