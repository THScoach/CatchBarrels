'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProgressChartProps {
  chartData: Array<{
    date: string;
    'Anchor (Lower Body)': number;
    'Engine (Trunk/Core)': number;
    'Whip (Arms & Bat)': number;
    Overall: number;
  }>;
}

export function ProgressPageChart({ chartData }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
    >
      <h2 className="text-white font-semibold mb-4">Body Metrics Score Trends</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="Anchor (Lower Body)"
              stroke="#F5A623"
              strokeWidth={3}
              dot={{ r: 5, fill: '#F5A623' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Engine (Trunk/Core)"
              stroke="#4CAF50"
              strokeWidth={3}
              dot={{ r: 5, fill: '#4CAF50' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Whip (Arms & Bat)"
              stroke="#9C27B0"
              strokeWidth={3}
              dot={{ r: 5, fill: '#9C27B0' }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Overall"
              stroke="#FF9800"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 5, fill: '#FF9800' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
