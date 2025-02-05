import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, Alert, Spin, Radio, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const LowInventoryChart = ({ data, loading }) => {
  const [chartType, setChartType] = useState('quantity');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <Text strong className="text-lg mb-2 block">
            {item.Description || item.ItemCode}
          </Text>
          <div className="space-y-1">
            <Text className="block">
              <Text type="secondary">Item Code: </Text>
              {item.ItemCode}
            </Text>
            <Text className="block">
              <Text type="secondary">Current Stock: </Text>
              <Text type={item.BalQty <= 5 ? 'danger' : 'warning'}>
                {parseFloat(item.BalQty).toFixed(2)}
              </Text>
            </Text>
            <Text className="block">
              <Text type="secondary">Group: </Text>
              {item.ItemGroup}
            </Text>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full shadow-md">
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <Alert
          message="No Low Inventory Items"
          description="All items are currently above the minimum threshold (10 units)."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  // Prepare and sort data based on selected view
  const chartData = data
    .map(item => ({
      ...item,
      BalQty: parseFloat(item.BalQty),
      Description: item.Description || item.ItemCode,
    }))
    .sort((a, b) => a.BalQty - b.BalQty);

  const getBarColor = (value) => {
    if (value <= 5) return '#ff4d4f';  // Very low - Red
    if (value <= 8) return '#faad14';  // Low - Yellow
    return '#ffa39e';                  // Moderate - Light red
  };

  return (
    <Card
      className="w-full shadow-md"
      title={
        <div className="flex justify-between items-center">
          <Title level={4} style={{ margin: 0 }}>
            Low Inventory Items
          </Title>
          <Radio.Group
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="quantity">Quantity View</Radio.Button>
            <Radio.Button value="group">Group View</Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <div style={{ width: '100%', height: 450 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey={chartType === 'quantity' ? 'ItemCode' : 'ItemGroup'}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
              tickMargin={5}
            />
            <YAxis
              label={{
                value: 'Stock Quantity',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend
              verticalAlign="top"
              height={36}
            />
            <ReferenceLine
              y={5}
              stroke="#ff4d4f"
              strokeDasharray="3 3"
              label={{
                value: "Critical Level",
                position: "right",
                fill: "#ff4d4f"
              }}
            />
            <Bar
              dataKey="BalQty"
              name="Current Stock"
              //fill="#ff4d4f"
              radius={[4, 4, 0, 0]}
              barSize={35}
              animationDuration={1500}
              fill={(entry) => getBarColor(entry.BalQty)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <Space>
          <Text type="secondary">Color Indicators:</Text>
          <Text style={{ color: '#ff4d4f' }}>● Critical (≤5)</Text>
          <Text style={{ color: '#faad14' }}>● Low (≤8)</Text>
          <Text style={{ color: '#ffa39e' }}>● Moderate (≤10)</Text>
        </Space>
      </div>
    </Card>
  );
};

export default LowInventoryChart;
