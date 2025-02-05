import React, { useState, useEffect } from 'react';
import {
  Card, Radio, Skeleton, Space, Typography, Tag,
  Table, Statistic, Row, Col, Select,
  Alert
} from 'antd';
import {
  ShoppingOutlined, TrophyOutlined,
  UserOutlined, BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import styles from './SalesAnalysis.module.css';
import api from '../../services/api';

const { Text } = Typography;
const { Option } = Select;

const SalesAnalysis = ({ loading }) => {
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'salespersons'
  const [viewType, setViewType] = useState('quantity');
  const [productData, setProductData] = useState([]);
  const [salespersonData, setSalespersonData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalSalespersons: 0
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch approved requests with user details
        const response = await api.get('/product-requests', {
          params: {
            status: 'APPROVED',
            per_page: 100,
            include: 'user',
            year: selectedYear
          }
        });

        // Filter data for selected year
        const yearData = response.data.data.filter(request => {
          const requestYear = new Date(request.request_date).getFullYear();
          return requestYear === selectedYear;
        })

        // Process product data
        const productMap = processProductData(yearData);
        setProductData(Array.from(productMap.values()));

        // Process salesperson data
        const salespersonMap = processSalespersonData(yearData);
        setSalespersonData(Array.from(salespersonMap.values()));

        // Set statistics
        setStatistics({
          totalSales: yearData.reduce((sum, req) => sum + parseInt(req.quantity, 10), 0),
          totalProducts: productMap.size,
          totalSalespersons: salespersonMap.size
        });

      } catch (error) {
        console.error('Failed to fetch sales data:', error);
      }
    };

    fetchData();
  }, [selectedYear]);

  const processProductData = (requests) => {
    const productMap = new Map();

    requests.forEach(request => {
      const key = request.ItemCode;
      const existing = productMap.get(key) || {
        ItemCode: key,
        Description: request.ItemDescription || key,
        totalQuantity: 0,
        frequency: 0,
      };

      existing.totalQuantity += parseInt(request.quantity, 10);
      existing.frequency += 1;
      productMap.set(key, existing);
    });

    return productMap;
  };

  const processSalespersonData = (requests) => {
    const salespersonMap = new Map();

    requests.forEach(request => {
      const key = request.staff_id;
      const existing = salespersonMap.get(key) || {
        staff_id: key,
        username: request.user?.username || key,
        totalQuantity: 0,
        totalRequests: 0,
        successRate: 0,
        products: new Set()
      };

      existing.totalQuantity += parseInt(request.quantity, 10);
      existing.totalRequests += 1;
      existing.products.add(request.ItemCode);
      salespersonMap.set(key, existing);
    });

    // Convert Sets to sizes and calculate success rates
    return new Map(Array.from(salespersonMap.entries()).map(([key, data]) => [
      key,
      {
        ...data,
        uniqueProducts: data.products.size,
        products: undefined // Remove the Set
      }
    ]));
  };

  const renderChart = () => {
    const data = viewMode === 'products' ? productData : salespersonData;
    const sortedData = [...data].sort((a, b) =>
      viewType === 'quantity'
        ? b.totalQuantity - a.totalQuantity
        : b.frequency - a.frequency
    ).slice(0, 8);

    return (
      <div style={{ height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={viewMode === 'products' ? 'ItemCode' : 'username'}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <RechartsTooltip content={<CustomTooltip viewMode={viewMode} />} />
            <Bar
              dataKey={viewType === 'quantity' ? 'totalQuantity' : viewMode === 'products' ? 'frequency' : 'totalRequests'}
              fill="#4E71CF"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label, viewMode }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipTitle}>
            {viewMode === 'products' ? data.Description : data.username}
          </p>
          <div className={styles.tooltipContent}>
            <p>Total Quantity: {data.totalQuantity}</p>
            {viewMode === 'products' ? (
              <p>Request Frequency: {data.frequency}</p>
            ) : (
              <>
                <p>Total Requests: {data.totalRequests}</p>
                <p>Unique Products: {data.uniqueProducts}</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getColumns = () => {
    if (viewMode === 'products') {
      return [
        {
          title: 'Rank',
          key: 'rank',
          width: '10%',
          render: (_, __, index) => (
            <Tag color={index < 3 ? 'gold' : 'default'}>
              #{index + 1}
            </Tag>
          ),
        },
        {
          title: 'Item Code',
          dataIndex: 'ItemCode',
          width: '15%',
        },
        {
          title: 'Description',
          dataIndex: 'Description',
          width: '25%',
          ellipsis: true,
        },
        {
          title: 'Total Sold',
          dataIndex: 'totalQuantity',
          width: '15%',
          sorter: (a, b) => a.totalQuantity - b.totalQuantity,
          render: (value) => (
            <Text strong>{value.toLocaleString()}</Text>
          ),
        },
        {
          title: 'Frequency',
          dataIndex: 'frequency',
          width: '15%',
          sorter: (a, b) => a.frequency - b.frequency,
          render: (value) => (
            <Tag color="blue">{value} orders</Tag>
          ),
        }
      ];
    } else {
      return [
        {
          title: 'Rank',
          key: 'rank',
          width: '10%',
          render: (_, __, index) => (
            <Tag color={index < 3 ? 'gold' : 'default'}>
              #{index + 1}
            </Tag>
          ),
        },
        {
          title: 'Salesperson',
          dataIndex: 'username',
          width: '20%',
          ellipsis: true,
        },
        {
          title: 'Total Sales',
          dataIndex: 'totalQuantity',
          width: '20%',
          sorter: (a, b) => a.totalQuantity - b.totalQuantity,
          render: (value) => (
            <Text strong>{value.toLocaleString()}</Text>
          ),
        },
        {
          title: 'Requests',
          dataIndex: 'totalRequests',
          width: '15%',
          sorter: (a, b) => a.totalRequests - b.totalRequests,
          render: (value) => (
            <Tag color="blue">{value}</Tag>
          ),
        },
        {
          title: 'Unique Products',
          dataIndex: 'uniqueProducts',
          width: '15%',
          sorter: (a, b) => a.uniqueProducts - b.uniqueProducts,
          render: (value) => (
            <Tag color="purple">{value}</Tag>
          ),
        }
      ];
    }
  };

  if (loading) {
    return <Card><Skeleton active /></Card>;
  }

  return (
    <Card className={styles.analysisCard}>
      {/* Statistics Row */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={24}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginLeft: 16, padding: 16 }}/>
            <Text strong>Select Year:</Text>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 120 }}
              className={styles.yearSelect}
            >
              {availableYears.map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Statistic
            title="Total Sales Volume"
            value={statistics.totalSales}
            prefix={<ShoppingOutlined />}
            className={styles.statistic}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Active Products"
            value={statistics.totalProducts}
            prefix={<BarChartOutlined />}
            className={styles.statistic}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Active Salespersons"
            value={statistics.totalSalespersons}
            prefix={<UserOutlined />}
            className={styles.statistic}
          />
        </Col>
      </Row>

      {/* Chart Section */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Top Performance Analysis {selectedYear}</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              className={styles.viewSelect}
            >
              <Option value="products">Products</Option>
              <Option value="salespersons">Salespersons</Option>
            </Select>
            <Radio.Group
              value={viewType}
              onChange={e => setViewType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="quantity">Quantity</Radio.Button>
              <Radio.Button value="frequency">Frequency</Radio.Button>
            </Radio.Group>
          </Space>
        }
      >
        {renderChart()}
      </Card>

      {/* Rankings Table */}
      <Card
        title={viewMode === 'products' ? 'Product Rankings' : 'Salesperson Rankings'}
        className={styles.tableCard}
      >
        <Table
          scroll={({ y: 240 }, { x: 'max-content' })}
          columns={getColumns()}
          dataSource={viewMode === 'products' ? productData : salespersonData}
          rowKey={viewMode === 'products' ? 'ItemCode' : 'staff_id'}
          pagination={{ pageSize: 5 }}
          className={styles.rankingTable}
        />
      </Card>
      {productData.length === 0 && (
        <Alert
          message="No data available"
          description={`No sales data available for the year ${selectedYear}`}
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default SalesAnalysis;
