import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag,
  Space, Typography, Tooltip, Skeleton, Select
} from 'antd';
import {
  ShoppingOutlined, CheckCircleOutlined,
  ClockCircleOutlined, DollarOutlined, CalendarOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import styles from './SalesmanDashboard.module.css';

const { Text } = Typography;
const { Option } = Select;
const formatMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const SalesmanDashboard = ({ user, loading }) => {
  const [personalStats, setPersonalStats] = useState({
    totalSold: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    totalRequests: 0
  });
  const [monthlySales, setMonthlySales] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(formatMonthKey(new Date()));
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    // Generate last 12 months for selection
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(formatMonthKey(date));
    }
    setAvailableMonths(months);
  }, []);

  useEffect(() => {
    const fetchSalesmanData = async () => {
      setLoadingData(true);
      try {
        const [year, month] = selectedMonth.split('-');
        // Fetch all requests for this salesperson
        const response = await api.get('/product-requests', {
          params: {
            staff_id: user.staff_id,
            per_page: 100,
            month,
            year
          }
        });

        const requests = response.data.data;
        const filteredRequests = requests.filter(request => {
          const requestDate = formatMonthKey(new Date(request.request_date));
          return requestDate === selectedMonth;
        });

        // Calculate stats
        const approvedRequests = filteredRequests.filter(r => r.request_status === 'APPROVED');
        const pendingRequests = filteredRequests.filter(r => r.request_status === 'PENDING');

        const totalSold = approvedRequests.reduce((sum, req) =>
          sum + parseInt(req.quantity, 10), 0);

        setPersonalStats({
          totalSold,
          approvedRequests: approvedRequests.length,
          pendingRequests: pendingRequests.length,
          totalRequests: filteredRequests.length
        });

        // Process monthly data
        const monthlyData = processMonthlyData(requests, selectedMonth);
        setMonthlySales(monthlyData);

        // Set recent requests
        setRecentRequests(filteredRequests.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch salesman data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchSalesmanData();
  }, [user.staff_id, selectedMonth]);

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  const processMonthlyData = (requests, selectedMonth) => {
    const monthlyMap = new Map();

    requests.forEach(request => {
      if (request.request_status === 'APPROVED') {
        const requestMonthKey = formatMonthKey(new Date(request.request_date));
        if (requestMonthKey === selectedMonth) {
          const existing = monthlyMap.get(requestMonthKey) || {
            month: requestMonthKey,
            quantity: 0,
          };

          existing.quantity += parseInt(request.quantity, 10);
          monthlyMap.set(requestMonthKey, existing);
        }
      }
    });

    return Array.from(monthlyMap.values());
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.label}>{formatMonthYear(label)}</p>
          <p>Quantity Sold: {data.quantity}</p>
          {data.successRate && <p>Success Rate: {data.successRate.toFixed(1)}%</p>}
        </div>
      );
    }
    return null;
  };

  const formatMonthYear = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loadingData || loading) {
    return <Card><Skeleton active /></Card>;
  }

  return (
    <>
      <Card className={styles.analysisCard}>
        {/* Month Selection */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={24}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <CalendarOutlined style={{ marginLeft: 16, padding: 16 }} />
                </Col>
                <Col>
                  <Text strong>Select Month:</Text>
                </Col>
                <Col>
                  <Select style={{ width: 200 }} value={selectedMonth} onChange={handleMonthChange}>
                    {availableMonths.map(monthKey => (
                      <Option key={monthKey} value={monthKey}>
                        {formatMonthYear(monthKey)}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic
                title={`Items Sold (${formatMonthYear(selectedMonth)})`}
                value={personalStats.totalSold}
                prefix={<ShoppingOutlined className={styles.iconPrimary} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Approved Requests"
                value={personalStats.approvedRequests}
                prefix={<CheckCircleOutlined className={styles.iconSuccess} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Pending Requests"
                value={personalStats.pendingRequests}
                prefix={<ClockCircleOutlined className={styles.iconWarning} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="Success Rate"
                value={((personalStats.approvedRequests / personalStats.totalRequests) * 100).toFixed(1)}
                suffix="%"
                prefix={<DollarOutlined className={styles.iconInfo} />}
              />
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className={styles.analysisCard}>
        {/* Monthly Performance Chart */}
        <Card title={`Monthly Sales Performance - ${formatMonthYear(selectedMonth)}`} className={styles.chartCard}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlySales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={formatMonthYear} />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" fill="#4E71CF" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Card>

      <Card className={styles.analysisCard}>
        {/* Recent Requests Table */}
        <Card title={`Recent Requests - ${formatMonthYear(selectedMonth)}`} className={styles.tableCard}>
          <Table
            scroll={({ y: 240 }, { x: 'max-content' })}
            dataSource={recentRequests}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Date',
                dataIndex: 'request_date',
                render: date => new Date(date).toLocaleDateString(),
              },
              {
                title: 'Item',
                dataIndex: 'ItemCode',
                render: (code, record) => (
                  <Tooltip title={record.Description}>
                    <Text>{code}</Text>
                  </Tooltip>
                ),
              },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                render: qty => <Text strong>{qty}</Text>,
              },
              {
                title: 'Status',
                dataIndex: 'request_status',
                render: status => (
                  <Tag color={status === 'APPROVED' ? 'success' : status === 'PENDING' ? 'processing' : 'error'}>{status}</Tag>
                ),
              },
              {
                title: 'Comment',
                dataIndex: 'comment',
                ellipsis: true,
                render: comment =>
                  comment ? (
                    <Tooltip title={comment}>
                      <Text>{comment}</Text>
                    </Tooltip>
                  ) : (
                    '-'
                  ),
              },
            ]}
          />
        </Card>
      </Card>
    </>
  );
};

export default SalesmanDashboard;
