import React, { useState, useCallback, useEffect, useRef} from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Space,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Popconfirm,
  message,
  Breadcrumb,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  SolutionOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import Globalstyle from '../../App.module.css';
import styles from './user.module.css';
import { debounce } from 'lodash';

const { Title, Text } = Typography;

// UserDetailsModal Component
const UserDetailsModal = ({ user, visible, onClose, onApprove, onReject }) => {
    const [isVisible, setIsVisible] = useState(visible);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
      if (visible) {
        setIsVisible(true);
        setIsClosing(false);
      }
    }, [visible]);

    const handleSoftClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300); // Adjust this timing to match your CSS animation duration
    };

    if (!user) return null;

    return (
      <Modal
        title="User Registration Details"
        open={isVisible}
        onCancel={handleSoftClose}
        afterClose={() => setIsClosing(false)}
        footer={[
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              onReject(user.staff_id);
              handleSoftClose();
            }}
            className={styles.deleteButton}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              onApprove(user.staff_id);
              handleSoftClose();
            }}
            className={styles.actionButton}
          >
            Approve
          </Button>,
          <Button key="close" onClick={handleSoftClose} className={styles.actionButton}>
            Close
          </Button>,
        ]}
        width={600}
        className={`${styles.userDetailsModal} ${isClosing ? styles.closing : ''}`}
      >
        {/* Modal content remains the same */}
        <Card bordered={false} className={styles.userCard}>
          <Space align="start" size="large">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{
                backgroundColor: user.role === 'SALESPERSON' ? '#1890ff' : '#52c41a',
              }}
            />
            <Space direction="vertical">
              <Title level={3} style={{ margin: 0 }}>
                {user.username}
              </Title>
              <Tag color={user.role === 'SALESPERSON' ? 'blue' : 'green'} style={{ fontSize: '14px' }}>
                {user.role}
              </Tag>
            </Space>
          </Space>
        </Card>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Basic Information" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Staff ID</Text>
                <div>
                  <Text strong>{user.staff_id}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">Email Address</Text>
                <div>
                  <Text strong>{user.email}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">Registration Date</Text>
                <div>
                  <Text strong>{new Date(user.created_at).toLocaleString()}</Text>
                </div>
              </div>
            </Space>
          </Card>

          <Alert
            message="Approval Action Required"
            description="Please review the user details carefully before approving or rejecting this registration request."
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    );
  };


// Main UserApproval Component
const UserApproval = () => {
    const [autoOpenStaffId, setAutoOpenStaffId] = useState(null);
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filters, setFilters] = useState({
      role: undefined,
    });
    const [statistics, setStatistics] = useState({
      total: 0,
      salespeople: 0,
      officeStaff: 0,
      today: 0,
    });
    const [sortState, setSortState] = useState({
      columnKey: 'created_at',
      order: 'descend',
    });

    const paginationRef = useRef({
      current: 1,
      pageSize: 10,
      total: 0,
    });

    const fetchPendingUsers = useCallback(
        async (params = {}) => {
          setLoading(true);
          try {
            const response = await api.get('/users', {
              params: {
                page: params.current || paginationRef.current.current,
                per_page: params.pageSize || paginationRef.current.pageSize,
                search: params.search !== undefined ? params.search : searchTerm,
                reg_status: 'PENDING',
                role: params.role || filters.role,
                sort_field: params.sort_field || sortState.columnKey,
                sort_order: params.sort_order || sortState.order,
              },
            });

          if (response.data) {
            setUsers(response.data.data);
            paginationRef.current = {
              ...paginationRef.current,
              current: Number(response.data.current_page),
              total: Number(response.data.total)
            };

            const statsResponse = await api.get('/users', {
              params: {
                per_page: 9999,
                search: params.search !== undefined ? params.search : searchTerm,
                reg_status: 'PENDING',
                role: params.role || filters.role,
              }
            });

            if (statsResponse.data?.data) {
              const allPendingUsers = statsResponse.data.data;
              const today = new Date().toDateString();
              setStatistics({
                total: allPendingUsers.length,
                salespeople: allPendingUsers.filter(u => u.role === 'SALESPERSON').length,
                officeStaff: allPendingUsers.filter(u => u.role === 'OFFICE_STAFF').length,
                today: allPendingUsers.filter(u => new Date(u.created_at).toDateString() === today).length,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching pending users:', error);
          message.error('Failed to fetch pending users');
        } finally {
          setLoading(false);
        }
      },
      [searchTerm, filters, sortState]
    );

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const staffId = searchParams.get('staffId');
        if (staffId) {
            setAutoOpenStaffId(staffId);
        }
        fetchPendingUsers();
    }, [location, fetchPendingUsers]);

    useEffect(() => {
        if (autoOpenStaffId && users.length > 0) {
            const userToOpen = users.find(user => user.staff_id === autoOpenStaffId);
            if (userToOpen) {
                setSelectedUser(userToOpen);
                setModalVisible(true);
                setAutoOpenStaffId(null); // Reset after opening
            }
        }
    }, [users, autoOpenStaffId]);

    const debouncedSearch = useRef(
      debounce((value) => {
        setSearchTerm(value);
        paginationRef.current.current = 1;
        fetchPendingUsers({ current: 1, search: value });
      }, 300)
    ).current;

    const handleSearch = (value) => {
      debouncedSearch(value);
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        const newFilters = {
          role: tableFilters.role?.[0],
        };
        setFilters(newFilters);

        setSortState({
          columnKey: sorter.field,
          order: sorter.order,
        });

        paginationRef.current = {
          ...paginationRef.current,
          current: newPagination.current,
          pageSize: newPagination.pageSize,
        };

        fetchPendingUsers({
          current: newPagination.current,
          pageSize: newPagination.pageSize,
          sort_field: sorter.field,
          sort_order: sorter.order,
          ...newFilters
        });
      };

    const handleRefresh = () => {
      paginationRef.current.current = 1;
      fetchPendingUsers({ current: 1 });
    };

    const handleApprove = async staffId => {
      try {
        await api.put(`/users/${staffId}/status`, {
          reg_status: 'APPROVED',
        });
        message.success('User approved successfully');
        setModalVisible(false);
        fetchPendingUsers();
      } catch (error) {
        console.error('Error approving user:', error);
        message.error('Failed to approve user');
      }
    };

    const handleReject = async staffId => {
      try {
        await api.put(`/users/${staffId}/status`, {
          reg_status: 'REJECTED',
        });
        message.success('User rejected successfully');
        setModalVisible(false);
        fetchPendingUsers();
      } catch (error) {
        console.error('Error rejecting user:', error);
        message.error('Failed to reject user');
      }
    };

    const formatDate = dateString => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
      }
    };

    const columns = [
      {
        title: 'User',
        key: 'user',
        render: (_, record) => (
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: record.role === 'SALESPERSON' ? '#1890ff' : '#52c41a',
              }}
            />
            <Space direction="vertical" size={0}>
              <Text strong>{record.username}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.staff_id}
              </Text>
            </Space>
          </Space>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        render: role => <Tag color={role === 'SALESPERSON' ? 'blue' : 'green'}>{role}</Tag>,
        filters: [
          { text: 'Salesperson', value: 'SALESPERSON' },
          { text: 'Office Staff', value: 'OFFICE_STAFF' },
        ],
        filterMultiple: false,
        filteredValue: filters.role ? [filters.role] : null,
      },
      {
        title: 'Email',
        dataIndex: 'email',
      },
      {
        title: 'Registration Date',
        dataIndex: 'created_at',
        render: date => formatDate(date),
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        defaultSortOrder: 'descend',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                className={Globalstyle.ActionButton}
                icon={<SolutionOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  setModalVisible(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Approve User"
              description="Are you sure you want to approve this user?"
              onConfirm={() => handleApprove(record.staff_id)}
              okText="Yes"
              cancelText="No"
            >
              <Button className={Globalstyle.ActionButton} icon={<CheckCircleOutlined />}>
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject User"
              description="Are you sure you want to reject this user?"
              onConfirm={() => handleReject(record.staff_id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<CloseCircleOutlined />} className={Globalstyle.DeleteButton}>
                Reject
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: 24, minHeight: '100vh', background: '#f5f5f5' }}>
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
              { title: 'User Management' },
              { title: 'User Approval' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Pending User Approvals</Title>
            <Button className={Globalstyle.ActionButton} icon={<ReloadOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className={styles.CardDetails}>
                <Statistic
                  title={
                    <Space>
                      <ClockCircleOutlined /> Total Pending
                    </Space>
                  }
                  value={statistics.total}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className={styles.CardDetails}>
                <Statistic
                  title={
                    <Space>
                      <UserOutlined /> Pending Salespeople
                    </Space>
                  }
                  value={statistics.salespeople}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className={styles.CardDetails}>
                <Statistic
                  title={
                    <Space>
                      <TeamOutlined /> Pending Office Staff
                    </Space>
                  }
                  value={statistics.officeStaff}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className={styles.CardDetails}>
                <Statistic
                  title={
                    <Space>
                      <Badge status="processing" />
                      New Today
                    </Space>
                  }
                  value={statistics.today}
                  valueStyle={{ color: '#fa541c' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content Card */}
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%', padding: '1%' }}>
              <Input.Search
                placeholder="Search by name, ID, or email"
                allowClear
                enterButton={
                  <Button icon={<SearchOutlined />} type="primary">
                    Search
                  </Button>
                }
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 300 }}
              />

              <Table
                scroll={({ y: 240 }, { x: 'max-content' })}
                columns={columns}
                dataSource={users}
                rowKey="staff_id"
                loading={loading}
                pagination={{
                  current: paginationRef.current.current,
                  pageSize: paginationRef.current.pageSize,
                  total: paginationRef.current.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                onChange={handleTableChange}
              />
            </Space>
          </Card>
          {/* User Details Modal */}
          <UserDetailsModal
            user={selectedUser}
            visible={modalVisible}
            onClose={() => {
                setModalVisible(false);
                setSelectedUser(null);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            />
        </Space>
      </div>
    );
  };

  export default UserApproval;
