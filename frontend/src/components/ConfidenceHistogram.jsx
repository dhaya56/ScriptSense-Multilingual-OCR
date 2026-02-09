import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const ConfidenceHistogram = ({ wordConfidenceScores = [] }) => {
  // Bin definitions
  const bins = {
    '0-20%': 0,
    '20-40%': 0,
    '40-60%': 0,
    '60-80%': 0,
    '80-100%': 0,
  };

  // Binning logic
  wordConfidenceScores.forEach((score) => {
    const percent = score * 100;
    if (percent < 20) bins['0-20%']++;
    else if (percent < 40) bins['20-40%']++;
    else if (percent < 60) bins['40-60%']++;
    else if (percent < 80) bins['60-80%']++;
    else bins['80-100%']++;
  });

  // Transform bin data to chart format
  const data = Object.entries(bins).map(([range, count]) => ({
    range,
    count,
  }));

  // Custom color palette
  const colors = {
    '0-20%': '#ef4444',    // red
    '20-40%': '#f97316',   // orange
    '40-60%': '#facc15',   // yellow
    '60-80%': '#60a5fa',   // blue
    '80-100%': '#22c55e',  // green
  };

  // Custom tooltip for better clarity
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 text-white text-xs px-3 py-2 rounded shadow-md">
          <strong>{label}</strong>
          <div>Word Confidence Levels: {payload[0].value}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md px-6 py-5 mt-10 h-[330px]">
      <h2 className="text-lg font-semibold text-indigo-700 flex items-center mb-3">
        <BarChart2 className="w-5 h-5 mr-2" />
        Confidence Histogram
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barCategoryGap={0}>
          <XAxis dataKey="range" fontSize={12} label={{ value: 'Word Confidence Levels', angle: 360, position: 'center', dy: 13}} />
          <YAxis fontSize={12} allowDecimals={false} label={{ value: 'Number of Words', angle: -90, position: 'center', dx: -10}} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.range]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConfidenceHistogram;
