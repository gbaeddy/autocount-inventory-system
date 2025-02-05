import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  Typography,
  Card,
  Space,
  Button,
  Badge,
  Empty,
  Skeleton,
  Tag,
  Layout,
  Row,
  Col,
  message,
  Menu,
  Breadcrumb,
} from 'antd';
import {
  BellOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CommentOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import styles from './NotificationPage.module.css';
import Globalstyle from '../../App.module.css';
import { useAuthContext } from '../../contexts/AuthProvider';

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
  });
  const [activitySummary, setActivitySummary] = useState({
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  });

  const prevNotificationsRef = useRef([]);

  // Function to categorize notifications by time period
  const categorizeNotifications = notifications => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    return notifications.reduce(
      (acc, notification) => {
        const notifDate = new Date(notification.created_at);
        notifDate.setHours(0, 0, 0, 0);

        if (notifDate.getTime() === today.getTime()) {
          acc.today.push(notification);
        } else if (notifDate.getTime() === yesterday.getTime()) {
          acc.yesterday.push(notification);
        } else if (notifDate >= weekStart) {
          acc.thisWeek.push(notification);
        } else {
          acc.older.push(notification);
        }

        return acc;
      },
      {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: [],
      },
    );
  };

  const getActivitySummaryText = notifications => {
    const types = notifications.reduce(
      (acc, notification) => {
        const message = notification.message.toLowerCase();
        if (message.includes('registration')) {
          acc.registrations++;
        } else if (message.includes('product request')) {
          acc.requests++;
        } else if (message.includes('approved')) {
          acc.approved++;
        } else if (message.includes('rejected')) {
          acc.rejected++;
        }
        return acc;
      },
      {
        registrations: 0,
        requests: 0,
        approved: 0,
        rejected: 0,
      },
    );

    const summaryParts = [];
    if (types.registrations > 0) {
      summaryParts.push(`${types.registrations} registration${types.registrations !== 1 ? 's' : ''}`);
    }
    if (types.requests > 0) {
      summaryParts.push(`${types.requests} request${types.requests !== 1 ? 's' : ''}`);
    }
    if (types.approved > 0) {
      summaryParts.push(`${types.approved} approved`);
    }
    if (types.rejected > 0) {
      summaryParts.push(`${types.rejected} rejected`);
    }

    return summaryParts.join(', ') || 'No activity';
  };

  const navigate = useNavigate();

  // Helper function to check if notification is visible based on user role
//   const isNotificationVisible = (notification) => {
//     const message = notification.message.toLowerCase();

//     if (message.includes('registration')) {
//       return user.role === 'ADMIN';
//     }

//     if (message.includes('product request')) {
//       return ['ADMIN', 'OFFICE_STAFF'].includes(user.role);
//     }

//     return true;
//   }

//   const getFilteredNotifications = () => {
//     const visibleNotifications = notifications.filter(isNotificationVisible);

//     switch (selectedFilter) {
//       case 'registration':
//         return user.role === 'ADMIN' ? visibleNotifications.filter(n => n.message.toLowerCase().includes('registration')) : [];
//       case 'requests':
//         return ['ADMIN', 'OFFICE_STAFF'].includes(user.role)
//           ? visibleNotifications.filter(n => n.message.toLowerCase().includes('product request'))
//           : [];
//       case 'approved':
//         return visibleNotifications.filter(n => n.message.toLowerCase().includes('approved'));
//       case 'rejected':
//         return visibleNotifications.filter(n => n.message.toLowerCase().includes('rejected'));
//       case 'unread':
//         return visibleNotifications.filter(n => n.notif_status === 'unread');
//       default:
//         return visibleNotifications;
//     }
//   };

  const handleFilterChange = key => {
    setSelectedFilter(key);
  };

  const getAvailableFilters = () => {
    const filters = [
      {
        key: 'all',
        icon: <BellOutlined />,
        label: 'All Notifications',
        count: notifications.filter(isNotificationVisible).length,
        visible: true, // Always visible
      },
      {
        key: 'registration',
        icon: <UserAddOutlined />,
        label: 'Registrations',
        count: notifications.filter(n => n.message.toLowerCase().includes('registration')).length,
        visible: user.role === 'ADMIN',
      },
      {
        key: 'requests',
        icon: <ShoppingCartOutlined />,
        label: 'Product Requests',
        count: notifications.filter(n => n.message.toLowerCase().includes('product request')).length,
        visible: ['ADMIN', 'OFFICE_STAFF'].includes(user.role),
      },
      {
        key: 'approved',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
        count: notifications.filter(n => n.message.toLowerCase().includes('approved')).length,
        visible: !['ADMIN', 'OFFICE_STAFF'].includes(user.role),
      },
      {
        key: 'rejected',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
        count: notifications.filter(n => n.message.toLowerCase().includes('rejected')).length,
        visible: !['ADMIN', 'OFFICE_STAFF'].includes(user.role),
      },
    ];

    return filters.filter(filter => filter.visible);
  };



   const isNotificationVisible = useCallback((notification) => {
    const message = notification.message.toLowerCase();

    // Registration notifications - only visible to admin
    if (message.includes('registration')) {
      return user.role === 'ADMIN';
    }

    // Product request notifications - visible to admin and office staff
    if (message.includes('product request')) {
      return ['ADMIN', 'OFFICE_STAFF'].includes(user.role);
    }

    // All other notifications are visible to everyone
    return true;
  }, [user.role]);

  const fetchNotifications = useCallback(async (forceUpdate = false) => {
    try {
      const response = await api.get('/notifications');
      const visibleNotifications = response.data.filter(isNotificationVisible);

      // Compare with previous notifications
      const hasChanges = forceUpdate || JSON.stringify(prevNotificationsRef.current) !== JSON.stringify(visibleNotifications);

      if (hasChanges) {
        setNotifications(response.data);
        prevNotificationsRef.current = visibleNotifications;

        const unreadCount = visibleNotifications.filter(n => n.notif_status === 'unread').length;
        const todayCount = visibleNotifications.filter(n => {
          const notifDate = new Date(n.created_at).toDateString();
          const today = new Date().toDateString();
          return notifDate === today;
        }).length;

        setStats({
          total: visibleNotifications.length,
          unread: unreadCount,
          today: todayCount,
        });

        setActivitySummary(categorizeNotifications(visibleNotifications));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      if (forceUpdate) {
        message.error('Failed to load notifications');
      }
    }
  }, [isNotificationVisible]); // Now depends on isNotificationVisible

  const getFilteredNotifications = useCallback(() => {
    // First filter by role visibility
    const visibleNotifications = notifications.filter(isNotificationVisible);

    // Then apply selected filter
    switch (selectedFilter) {
      case 'registration':
        return user.role === 'ADMIN' ? visibleNotifications.filter(n => n.message.toLowerCase().includes('registration')) : [];
      case 'requests':
        return ['ADMIN', 'OFFICE_STAFF'].includes(user.role)
          ? visibleNotifications.filter(n => n.message.toLowerCase().includes('product request'))
          : [];
      case 'approved':
        return visibleNotifications.filter(n => n.message.toLowerCase().includes('approved'));
      case 'rejected':
        return visibleNotifications.filter(n => n.message.toLowerCase().includes('rejected'));
      case 'unread':
        return visibleNotifications.filter(n => n.notif_status === 'unread');
      default:
        return visibleNotifications;
    }
  }, [notifications, selectedFilter, isNotificationVisible, user.role]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(true).finally(() => setLoading(false));
  }, [fetchNotifications]);

  // Silent background updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
}, [fetchNotifications]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchNotifications(true);
    setLoading(false);
    message.success('Notifications refreshed');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      await fetchNotifications(true);
      message.success('All notifications marked as read');
    } catch (error) {
      message.error('Failed to mark notifications as read');
    }
  };

  const getNotificationStyle = (message, status) => {
    if (message.includes('APPROVED')) {
      return {
        borderColor: '#52c41a',
        icon: <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />,
        background: '#f6ffed',
        tag: 'success',
        tagText: 'APPROVED',
      };
    }
    if (message.includes('REJECTED')) {
      return {
        borderColor: '#ff4d4f',
        icon: <CloseCircleOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />,
        background: '#fff1f0',
        tag: 'error',
        tagText: 'REJECTED',
      };
    }
    if (message.includes('registration')) {
      return {
        borderColor: '#1890ff',
        icon: <UserAddOutlined style={{ fontSize: '20px', color: '#1890ff' }} />,
        background: '#e6f7ff',
        tag: 'processing',
        tagText: 'REGISTRATION',
      };
    }
    return {
      borderColor: '#722ed1',
      icon: <ShoppingCartOutlined style={{ fontSize: '20px', color: '#722ed1' }} />,
      background: '#f9f0ff',
      tag: 'warning',
      tagText: 'REQUEST',
    };
  };

  // Add this function to handle notification routing
  const getNotificationRoute = (notification) => {
    const message = notification.message.toLowerCase();

    // Check for registration-related notifications
    if (message.includes('registration')) {
      // Extract the Staff ID from the notification message
      const match = notification.message.match(/Staff ID: (\d+)/);
      const staffId = match ? match[1] : null;
      if (staffId) {
        return `/user/approval?staffId=${staffId}`;
      }
    }

    // Check for product/inventory request notifications
    if (message.includes('product request')) {
      const idMatch = notification.message.match(/ID: (\d+)/);
      const requestId = idMatch ? idMatch[1] : null;
      if (requestId) {
        return `/inventory/request?id=${requestId}`;
      }
      return '/inventory/request';
    }

    return null; // Return null if no specific route matches
  };

  // Add this handler for notification clicks
  const handleNotificationClick = (notification) => {
    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
  };

  const StatsCard = ({ icon, title, value, color }) => (
    <Card
      className={styles.statsCard}
      bodyStyle={{
        padding: '24px',
        display: 'flex',
        alignItems: 'start',
      }}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.iconWrapper} style={{ background: color }}>
          {icon}
        </div>
        <div className={styles.textWrapper}>
          <Text type="secondary" className={styles.title}>
            {title}
          </Text>
          <Title level={3} className={styles.value}>
            {value}
          </Title>
        </div>
      </div>
    </Card>
  );

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Activity Summary Component
  const ActivitySummaryMenu = () => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    const summaryItems = [
      {
        key: 'today',
        icon: <ClockCircleOutlined />,
        label: 'Today',
        color: '#1890ff',
        count: activitySummary.today.length,
        summary: getActivitySummaryText(activitySummary.today),
        show: activitySummary.today.length > 0,
      },
      {
        key: 'yesterday',
        icon: <FieldTimeOutlined />,
        label: 'Yesterday',
        color: '#52c41a',
        count: activitySummary.yesterday.length,
        summary: getActivitySummaryText(activitySummary.yesterday),
        show: activitySummary.yesterday.length > 0,
      },
      {
        key: 'thisWeek',
        icon: <CalendarOutlined />,
        label: 'This Week',
        color: '#722ed1',
        count: activitySummary.thisWeek.length,
        summary: getActivitySummaryText(activitySummary.thisWeek),
        show: activitySummary.thisWeek.length > 0,
      },
      {
        key: 'older',
        icon: <HistoryOutlined />,
        label: 'Older',
        color: '#faad14',
        count: activitySummary.older.length,
        summary: getActivitySummaryText(activitySummary.older),
        show: activitySummary.older.length > 0,
      },
    ];

    if (Object.values(activitySummary).every(arr => arr.length === 0)) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No activity to show"
        />
      );
    }

    return (
      <div className={styles.activityList}>
        {summaryItems
          .filter(item => item.show)
          .map(item => (
            <div key={item.key} className={styles.activityItem}>
              <Space align="start" style={{ width: '100%' }}>
                <div
                  className={styles.iconWrapper}
                  style={{
                    color: item.color,
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '12px',
                    marginTop: '2px'
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{item.label}</Text>
                    <Tag color="blue">{item.count}</Tag>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.summary}
                    </Text>
                  </div>
                </div>
              </Space>
            </div>
          ))}
      </div>
    );
  };

  return (
    <Layout style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <>
                    <HomeOutlined /> Home
                  </>
                ),
              },
              { title: 'Notifications' },
            ]}
          />
          <Row gutter={[24, 24]}>
            {/* Left sidebar */}
            <Col xs={24} lg={6}>
              <div className={styles.sidebarWrapper}>
                {/* Quick Filters Card */}
                <Card className={styles.CardDetails}>
                  <Title level={5} style={{ marginBottom: 16 }}>Quick Filters</Title>
                  <Menu
                    mode="inline"
                    selectedKeys={[selectedFilter]}
                    style={{ border: 'none' }}
                    onClick={({ key }) => handleFilterChange(key)}
                  >
                    {getAvailableFilters().map(filter => (
                      <Menu.Item key={filter.key} icon={filter.icon}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          {filter.label}
                          <Tag color={filter.key === 'all' ? undefined : 'blue'}>
                            {filter.count}
                          </Tag>
                        </Space>
                      </Menu.Item>
                    ))}
                  </Menu>
                </Card>

                {/* Activity Summary Card */}
                <Card className={styles.CardDetails} style={{ marginTop: '24px' }}>
                  <Title level={5} style={{ marginBottom: 16 }}>Activity Summary</Title>
                  <ActivitySummaryMenu />
                </Card>
              </div>
            </Col>

            {/* 右侧主要内容部分 */}
            <Col xs={24} lg={18}>
              {/* Header and Stats Card */}
              <Card className={styles.CardDetails}>
                <Row justify="space-between" align="middle" className={styles.headerRow}>
                  <Col xs={24} md={12}>
                    <Space align="center" className={styles.headerTitle}>
                      <BellOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                      <Title level={2} style={{ margin: 0 }}>
                        Notifications
                      </Title>
                      {stats.unread > 0 && <Badge count={stats.unread} style={{ backgroundColor: '#1890ff' }} />}
                    </Space>
                  </Col>
                  <Col xs={24} md={12} className={styles.headerActions}>
                    <Space wrap>
                      {stats.unread > 0 && (
                        <Button onClick={handleMarkAllAsRead} className={Globalstyle.ActionButton}>
                          Mark all as read
                        </Button>
                      )}
                      <Button icon={<ReloadOutlined />} onClick={handleRefresh} className={Globalstyle.ActionButton}>
                        Refresh
                      </Button>
                    </Space>
                  </Col>
                </Row>

                {/* Stats Cards */}
                <Row gutter={[16, 16]} className={styles.statsRow}>
                  <Col xs={24} md={8}>
                    <StatsCard
                      icon={
                        <BellOutlined
                          style={{
                            fontSize: 'calc(1.5rem + 1vw)',
                            color: '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      }
                      title="Total Notifications"
                      value={stats.total}
                      color="#e6f7ff"
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <StatsCard
                      icon={
                        <CommentOutlined
                          style={{
                            fontSize: 'calc(1.5rem + 1vw)',
                            color: '#52c41a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      }
                      title="Unread Messages"
                      value={stats.unread}
                      color="#f6ffed"
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <StatsCard
                      icon={
                        <CalendarOutlined
                          style={{
                            fontSize: 'calc(1.5rem + 1vw)',
                            color: '#722ed1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      }
                      title="Today's Notifications"
                      value={stats.today}
                      color="#f9f0ff"
                    />
                  </Col>
                </Row>
              </Card>

              {/* Filters & Notifications List */}
              <Card className={styles.CardDetails} style={{ marginTop: '24px' }}>
                {/* Notifications List */}
                <div className={styles.notificationsList} style={{ marginTop: '16px' }}>
                  {loading ? (
                    <Card>
                      <Skeleton active avatar paragraph={{ rows: 3 }} />
                    </Card>
                  ) : getFilteredNotifications().length === 0 ? (
                    <Card>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Space direction="vertical" size="small">
                            <Text strong>No notifications</Text>
                            <Text type="secondary">You're all caught up!</Text>
                          </Space>
                        }
                      />
                    </Card>
                  ) : (
                    <List
                    itemLayout="horizontal"
                    dataSource={getFilteredNotifications()}
                    renderItem={item => {
                        const style = getNotificationStyle(item.message);
                        return (
                        <Card
                            className={styles.notificationCard}
                            style={{
                            marginBottom: '16px',
                            borderLeft: `4px solid ${style.borderColor}`,
                            paddingLeft: '10px',
                            cursor: getNotificationRoute(item) ? 'pointer' : 'default',
                            }}
                            hoverable={!!getNotificationRoute(item)}
                            onClick={() => handleNotificationClick(item)}
                        >
                            <List.Item>
                            <List.Item.Meta
                                avatar={
                                <div
                                    style={{
                                    padding: '12px',
                                    background: style.background,
                                    borderRadius: '12px',
                                    }}
                                >
                                    {style.icon}
                                </div>
                                }
                                title={
                                    <Space size={4}>
                                      <Text strong>{item.message}</Text>
                                      <Tag color={style.tag}>{style.tagText}</Tag>
                                      {item.notif_status === 'unread' && <Tag color="blue">NEW</Tag>}
                                    </Space>
                                  }
                                  description={
                                <Space>
                                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                    <Text type="secondary">{formatDate(item.created_at)}</Text>
                                </Space>
                                }
                            />
                            </List.Item>
                        </Card>
                        );
                      }}
                    />
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </Layout>
  );
}
