import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, Radio, Spin, Empty, Alert } from 'antd';
import api from '../../services/api';

const InventoryDemandChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('quantity'); // 'quantity' or 'frequency'

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/product-requests', {
        params: {
          status: 'APPROVED',
          per_page: 100 // Adjust based on your needs
        }
      });

      // Process and aggregate the data
      const aggregatedData = processRequestData(response.data.data);
      setData(aggregatedData);
    } catch (err) {
      console.error('Failed to fetch request data:', err);
      setError('Failed to load inventory demand data');
    } finally {
      setLoading(false);
    }
  };

  const processRequestData = (requests) => {
    // Create a map to aggregate data
    const itemMap = new Map();

    requests.forEach(request => {
      const existingItem = itemMap.get(request.ItemCode) || {
        ItemCode: request.ItemCode,
        Description: request.ItemDescription || request.ItemCode,
        totalQuantity: 0,
        frequency: 0
      };

      existingItem.totalQuantity += parseInt(request.quantity, 10);
      existingItem.frequency += 1;
      itemMap.set(request.ItemCode, existingItem);
    });

    // Convert map to array and sort by quantity
    return Array.from(itemMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Show top 10 items
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded shadow-lg border">
          <p className="font-semibold">{data.Description}</p>
          <p>Item Code: {data.ItemCode}</p>
          <p>Total Quantity: {data.totalQuantity} units</p>
          <p>Request Frequency: {data.frequency} times</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <Empty description="No approved requests found" />
      </Card>
    );
  }

  return (
    <Card
      title="Top Requested Items"
      extra={
        <Radio.Group
          value={viewType}
          onChange={e => setViewType(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="quantity">By Quantity</Radio.Button>
          <Radio.Button value="frequency">By Frequency</Radio.Button>
        </Radio.Group>
      }
    >
      <div style={{ height: 400, width: '100%' }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ItemCode"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: viewType === 'quantity' ? 'Total Quantity Requested' : 'Number of Requests',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={viewType === 'quantity' ? 'totalQuantity' : 'frequency'}
              name={viewType === 'quantity' ? 'Quantity Requested' : 'Request Frequency'}
              fill="#4E71CF"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default InventoryDemandChart;
