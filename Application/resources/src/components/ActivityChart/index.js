import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Typography } from 'antd';

const { Title } = Typography;

export default function ActivityChart({ dailyActivity }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Convert the dailyActivity object to an array format for Recharts
    const data = Object.entries(dailyActivity || {})
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        count: count,
      }))
      .reverse(); // Reverse to show oldest to newest

    setChartData(data);
  }, [dailyActivity]);

  return (
    <Card style={{ marginTop: 16, marginBottom: 16, padding: '2%' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        Activity Trend (Last 7 Days)
      </Title>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: '#666' }} />
            <YAxis tick={{ fill: '#666' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4E71CF"
              strokeWidth={2}
              dot={{ fill: '#4E71CF', r: 4 }}
              activeDot={{ r: 6 }}
              name="Activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
