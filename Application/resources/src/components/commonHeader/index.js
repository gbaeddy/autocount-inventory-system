import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Avatar,
  Button,
  message,
  ConfigProvider,
  Spin,
  Dropdown,
  Badge,
  List,
  Typography,
  Card,
  Space
} from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styles from './header.module.css';
import ProfilePicture from '../../assets/hutaowave.png';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
// import { useAuthContext } from '../../contexts/AuthProvider';

const { Header } = Layout;
const { Text } = Typography;

const CommonHeader = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
//   const { user } = useAuthContext(); // Keep user for future use if needed
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => notif.notif_status === 'unread').length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = status => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'REJECTED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const handleDropdownVisibleChange = visible => {
    setDropdownVisible(visible);
    if (visible && unreadCount > 0) {
      markAllAsRead();
    }
  };

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
        // If we couldn't extract an ID, still redirect to the inventory request page
        return '/inventory/request';
    }

    // Default to notifications page if no specific route is matched
    return '/notifications';
  };

  // Add this handler for notification clicks
  const handleNotificationClick = (notification) => {
    const route = getNotificationRoute(notification);
    setDropdownVisible(false); // Close the dropdown
    navigate(route); // Navigate to the appropriate route
  };

  // Modify the notification menu to use the new click handler
  const NotificationMenu = ({ notifications, onNotificationClick, onViewAll }) => (
    <Card style={{ width: 300 }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '8px' }}>
          <List
            itemLayout="horizontal"
            dataSource={notifications.slice(0, 3)}
            renderItem={item => (
              <List.Item
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onClick={() => onNotificationClick(item)}
                className={styles.notificationItem}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(item.request_status)}
                  title={
                    <Text
                      strong
                      style={{
                        color: item.notif_status === 'unread' ? '#1890ff' : 'rgba(0, 0, 0, 0.85)'
                      }}
                    >
                      {item.message}
                    </Text>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            padding: '8px 0',
            textAlign: 'center',
            marginTop: 'auto'
          }}
        >
          <Button
            type="link"
            onClick={onViewAll}
            style={{ width: '100%' }}
          >
            View all notifications
          </Button>
        </div>
      </div>
    </Card>
  );

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      message.success('Logging out...');

      document.querySelector(`.${styles.header.replace(/[^a-zA-Z0-9-_]/g, '\\$&')}`).classList.add(styles.fadeOut);

      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      message.error('An error occurred during logout. Please try again.');
      setLoading(false);
    }
  };

  const userDropdownItems = {
    items: [
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerColor: '#fff',
          },
        },
      }}
    >
      <Header className={styles.header}>
        <h1 className={styles.headerTitle}>{isMobile ? 'Fourntec' : 'Fourntec Inventory Management System'}</h1>
        <Space>
        <Dropdown
        overlay={
            <NotificationMenu
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onViewAll={() => {
                setDropdownVisible(false);
                navigate('/notifications');
            }}
            />
        }
        trigger={['click']}
        placement="bottomRight"
        open={dropdownVisible}
        onOpenChange={handleDropdownVisibleChange}
        >
        <Badge count={unreadCount} offset={[-15, 5]}>
            <Button icon={<BellOutlined />} className={styles.notificationButton} />
        </Badge>
        </Dropdown>
          <Spin spinning={loading} size="small">
            <Dropdown menu={userDropdownItems} placement="bottomRight" arrow trigger={['click']}>
              <Avatar
                icon={<UserOutlined />}
                src={ProfilePicture}
                className={styles.avatar}
                style={{
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                }}
              />
            </Dropdown>
          </Spin>
        </Space>
      </Header>
    </ConfigProvider>
  );
};

export default CommonHeader;
