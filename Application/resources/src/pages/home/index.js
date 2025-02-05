import React, { useState, useEffect } from 'react';
import {
  Col,
  Row,
  Card,
  Breadcrumb,
  theme,
  Alert,
  Statistic,
  Space,
  Timeline,
  Skeleton,
  Badge,
  Tag,
  Typography,
  Progress,
  Table,
} from 'antd';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import ProfilePicture from '../../assets/hutaowave.png';
import style from './home.module.css';
import { useAuthContext } from '../../contexts/AuthProvider';
import api from '../../services/api';
import SalesAnalysis from '../../components/Dashboard/SalesAnalysis';
import SalesmanDashboard from '../../components/SalesmanDashboard';

const { Text } = Typography;

const Home = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { user } = useAuthContext();
//   const [setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [stockSettings, setStockSettings] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user.reg_status === 'APPROVED') {
        setLoading(true);
        try {
          // Fetch stock settings first
          const stockSettingsResponse = await api.get('/stock-settings');
          if (!stockSettingsResponse.data) {
            throw new Error('Failed to fetch stock settings');
          }
          setStockSettings(stockSettingsResponse.data);

          // Rest of data fetching
          const [requestsResponse, itemsResponse] = await Promise.all([
            api.get('/product-requests', { params: { per_page: 100 } }),
            api.get('/items', { params: { per_page: 100 } })
          ]);

          if (requestsResponse.data?.data) {
            const allRequests = requestsResponse.data.data;
            setStatistics({
              totalRequests: allRequests.length,
              approvedRequests: allRequests.filter(r => r.request_status === 'APPROVED').length,
              pendingRequests: allRequests.filter(r => r.request_status === 'PENDING').length,
            });

            // const approvedRequests = allRequests.filter(
            //   request => request.request_status === 'APPROVED'
            // );
            // const processedData = processRequestData(approvedRequests);
            // setRequestData(processedData);
          }

          if (stockSettingsResponse.data && itemsResponse.data?.data) {
            const settings = stockSettingsResponse.data;
            const lowStockItems = itemsResponse.data.data
              .filter(item => {
                const qty = parseFloat(item.BalQty);
                return !isNaN(qty) && qty <= settings.critical_threshold;
              })
              .map(item => ({
                ...item,
                BalQty: parseFloat(item.BalQty)
              }))
              .sort((a, b) => a.BalQty - b.BalQty);

            setLowInventory(lowStockItems);
          }

          // Fetch activity based on role
          if (user.role === 'ADMIN') {
            const activityResponse = await api.get('/activity-logs', {
              params: { limit: 5 }
            });
            setRecentActivity(activityResponse.data?.data || []);
          } else {
            const userRequestsResponse = await api.get('/product-requests', {
              params: {
                staff_id: user.staff_id,
                limit: 10,
                sort: 'created_at',
                order: 'desc'
              }
            });
            setUserRequests(userRequestsResponse.data?.data || []);
          }

        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user.reg_status, user.role, user.staff_id]);

  const getStockLevel = qty => {
    const quantity = parseFloat(qty);
    if (quantity <= stockSettings.critical_threshold) return { color: '#ff4d4f', text: 'Critical', status: 'exception' };
    if (quantity <= stockSettings.low_threshold) return { color: '#faad14', text: 'Low', status: 'warning' };
    return { color: '#ffd666', text: 'Healthy', status: 'success' };
  };

  const lowInventoryColumns = [
    {
      title: 'Item Code',
      dataIndex: 'ItemCode',
      key: 'ItemCode',
      width: '15%',
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      width: '25%',
    },
    {
      title: 'Current Stock',
      dataIndex: 'BalQty',
      key: 'BalQty',
      width: '20%',
      render: qty => {
        const stockLevel = getStockLevel(qty);
        return (
          <Space size="middle" align="center">
            <Text strong>{qty}</Text>
            <Tag color={stockLevel.color}>{stockLevel.text}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      width: '25%',
      render: (_, record) => {
        const qty = parseFloat(record.BalQty);
        const percentage = Math.min((qty / stockSettings.healthy_threshold) * 100, 100);
        const stockLevel = getStockLevel(qty);

        return <Progress percent={percentage} size="small" status={stockLevel.status} strokeColor={stockLevel.color} />;
      },
    },
    {
      title: 'Item Group',
      dataIndex: 'ItemGroup',
      key: 'ItemGroup',
      width: '15%',
    },
  ];

//   const processRequestData = requests => {
//     const itemMap = new Map();
//     requests.forEach(request => {
//       const key = request.ItemCode;
//       const current = itemMap.get(key) || {
//         ItemCode: key,
//         Description: request.ItemDescription || key,
//         totalQuantity: 0,
//         frequency: 0,
//       };
//       current.totalQuantity += parseInt(request.quantity, 10);
//       current.frequency += 1;
//       itemMap.set(key, current);
//     });

//     return Array.from(itemMap.values())
//       .sort((a, b) => b.totalQuantity - a.totalQuantity)
//       .slice(0, 8);
//   };

const renderUserActivity = () => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    // Sort requests to show pending first, then by date
    const sortedRequests = [...userRequests].sort((a, b) => {
      // First prioritize pending status
      if (a.request_status === 'PENDING' && b.request_status !== 'PENDING') return -1;
      if (a.request_status !== 'PENDING' && b.request_status === 'PENDING') return 1;

      // Then sort by date (most recent first)
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return (
      <Timeline
      style={{ padding: 10 }}
        items={sortedRequests.map(request => ({
          color: request.request_status === 'APPROVED' ? 'green' : request.request_status === 'PENDING' ? 'blue' : 'red',
          children: (
            <div className={style.timelineItem}>
              <p className={style.timelineTitle}>
                Request for {request.ItemCode}
                <Tag
                  color={request.request_status === 'APPROVED' ? 'success' : request.request_status === 'PENDING' ? 'processing' : 'error'}
                  style={{ marginLeft: 8 }}
                >
                  {request.request_status}
                </Tag>
              </p>
              <p className={style.timelineMeta}>
                Quantity: {request.quantity} • {new Date(request.created_at).toLocaleString()}
              </p>
              {request.comment && <p className={style.timelineComment}>Comment: {request.comment}</p>}
            </div>
          ),
        }))}
      />
    );
  };

  const renderAdminActivity = () => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    return (
      <Timeline
        style={{ padding: 10 }}
        items={recentActivity.map(activity => ({
          color: activity.action === 'CREATE' ? 'green' : activity.action === 'UPDATE' ? 'blue' : 'red',
          children: (
            <div className={style.timelineItem}>
              <p className={style.timelineTitle}>{activity.actionDesc}</p>
              <p className={style.timelineMeta}>
                by {activity.username} • {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          ),
        }))}
      />
    );
  };

  return (
    <div
      style={{
        padding: 24,
        background: '#f5f5f5',
        borderRadius: borderRadiusLG,
        minHeight: '100vh',
      }}
      className={style.fadeIn}
    >
        <Breadcrumb
        style={{marginBottom: '16px'}}
          items={[
            {
              title: (
                <>
                  <HomeOutlined /> Home
                </>
              ),
            },
          ]}
        />

      {/* Welcome Section */}
      <Card className={style.welcomeCard}>
        <img src={ProfilePicture} alt="profile" className={style.profileImage} />
        <div>
          <h1 className={style.welcomeTitle}>Welcome back, {user.username}!</h1>
          <p className={style.welcomeSubtitle}>Here's your inventory management overview</p>
        </div>
      </Card>

      {/* Status Alerts */}
      {user.reg_status === 'PENDING' && (
        <Alert
          message="Account Pending Approval"
          description="Your account is currently pending approval. Some features may be limited until your account is approved."
          type="warning"
          showIcon
          className={style.statusAlert}
        />
      )}

      {user.reg_status === 'APPROVED' && (
        <>
          {/* Statistics Section */}
          <Row gutter={[16, 16]} className={style.statsSection}>
            <Col xs={24} sm={8}>
              <Card className={style.statCard}>
                <Statistic
                  title={<span style={{ fontSize: '20px' }}>Total Requests</span>}
                  value={statistics?.totalRequests || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '25px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={style.statCard}>
                <Statistic
                  title={<span style={{ fontSize: '20px' }}>Approved Requests</span>}
                  value={statistics?.approvedRequests || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '25px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={style.statCard}>
                <Badge.Ribbon text="Active" color="blue">
                  <Statistic
                    title={<span style={{ fontSize: '20px' }}>Pending Requests</span>}
                    value={statistics?.pendingRequests || 0}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: '25px' }}
                  />
                </Badge.Ribbon>
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              {/* New Low Inventory Section */}
              <Card
                title={
                  <div>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                    <span> Low Inventory Alert </span>
                    {lowInventory.length > 0 && (
                      <Badge count={lowInventory.length} style={{ backgroundColor: '#ff4d4f' }} overflowCount={99} />
                    )}
                  </div>
                }
                className={`${style.lowInventoryCard} ${style.fadeIn}`}
                style={{ marginBottom: '1vh' }}
              >
                {loading ? (
                  <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                  <>
                    {lowInventory.length > 0 ? (
                      <>
                        <div style={{ padding: '1%' }}>
                          <Alert
                            message={`${lowInventory.length} ${lowInventory.length === 1 ? 'item requires' : 'items require'} attention`}
                            description={`The following items are below the recommended stock level ${stockSettings.critical_threshold} units.`}
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                          <Table
                            columns={lowInventoryColumns}
                            dataSource={lowInventory}
                            rowKey="ItemCode"
                            pagination={false}
                            size="middle"
                            scroll={({ y: 240 }, { x: 'max-content' })}
                            className={style.lowInventoryTable}
                          />
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '1%' }}>
                        <Alert
                          message="No Low Inventory Items"
                          description={`All items are currently above the minimum threshold ${stockSettings.critical_threshold} units.`}
                          type="success"
                          showIcon
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
              {(() => {
                switch (user.role) {
                  case 'ADMIN':
                  case 'OFFICE_STAFF':
                    return <SalesAnalysis loading={loading} />;
                  case 'SALESPERSON':
                    return <SalesmanDashboard loading={loading} user={user} />;
                  default:
                    return null;
                }
              })()}
            </Col>
            <Col xs={24} lg={8}>
              <Card title={user.role === 'ADMIN' ? 'Recent System Activity' : 'Your Recent Requests'} className={style.activityCard}>
                {user.role === 'ADMIN' ? renderAdminActivity() : renderUserActivity()}
              </Card>
            </Col>
          </Row>
        </>
      )}

      {user.reg_status === 'PENDING' && (
        <Card title="Dashboard">
          <p>Dashboard analytics will be available once your account is approved.</p>
        </Card>
      )}
    </div>
  );
};

export default Home;
