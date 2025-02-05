import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Popconfirm,
  message,
  Breadcrumb,
  Select,
  Form,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  IdcardOutlined,
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import api from '../../services/api';
import Globalstyle from '../../App.module.css';
import styles from './user.module.css';
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Option } = Select;

// UserForm Component for Add/Edit
const UserForm = ({ visible, onCancel, onSubmit, initialValues, mode }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const validateStaffId = async (_, value) => {
    if (mode === 'edit') {
      return Promise.resolve();
    }

    if (!value) {
      return Promise.reject('Please input your Staff ID!');
    }

    if (value.startsWith('0')) {
      return Promise.reject('Staff ID cannot start with 0');
    }

    // Only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject('Staff ID can only contain letters and numbers');
    }

    if (value.length < 4) {
      return Promise.reject('Staff ID must be at least 4 characters long');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-staff-id`,
        { staff_id: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This Staff ID is already in use');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking Staff ID availability');
    }
  };

  // Username validation rule
  const validateUsername = async (_, value) => {
    if (mode === 'edit' && value === initialValues.username) {
      return Promise.resolve();
    }

    if (!value) {
      return Promise.reject('Please input your username!');
    }

    // Username format validation
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return Promise.reject('Username can only contain letters, numbers, and underscores');
    }

    if (value.length < 3) {
      return Promise.reject('Username must be at least 3 characters long');
    }

    // Check if username exists
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-username`,
        { username: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This Username is already in use');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking Username availability');
    }
  };

  // Email validation rule
  const validateEmail = async (_, value) => {
    if (!value) {
      return Promise.reject('Please input your email');
    }

    // Strict email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return Promise.reject('Please enter a valid email address!');
    }

    // If we're in edit mode, skip the duplication check if the value is the same as the current email
    if (mode === 'edit' && value === initialValues.email) {
      return Promise.resolve(); // Skip duplicate check if email is the same as the current one
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-email`,
        { email: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This email is already registered');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking email availability');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal title={mode === 'edit' ? 'Edit User' : 'Add New User'} open={visible} onCancel={onCancel} onOk={handleSubmit} width={600}>
      <Form form={form} layout="vertical" initialValues={{ role: 'SALESPERSON', reg_status: 'PENDING' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="staff_id"
              label="Staff ID"
              validateTrigger={['onBlur', 'onChange']}
              rules={[
                { validator: validateStaffId }
              ]}
              hasFeedback
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Staff ID"
                maxLength={20}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').replace(/^0+/, '');
                }}
                disabled={mode === 'edit'}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              validateTrigger={['onBlur', 'onChange']}
              rules={[
                { validator: validateUsername }
              ]}
              hasFeedback
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                maxLength={30}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label="Email"
          validateTrigger={['onBlur', 'onChange']}
          rules={[
            { validator: validateEmail }
          ]}
          hasFeedback
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            maxLength={50}
          />
        </Form.Item>

        {mode !== 'edit' && (
          <Form.Item
            name="password"
            label="Password"
            validateTrigger={['onBlur', 'onChange']}
            rules={[
              { required: true, message: 'Please input password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="role" label="Role" validateTrigger={['onBlur', 'onChange']} hasFeedback rules={[{ required: true, message: 'Please select role' }]}>
              <Select>
                <Option value="SALESPERSON">Salesperson</Option>
                <Option value="OFFICE_STAFF">Office Staff</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="reg_status" label="Status" validateTrigger={['onBlur', 'onChange']} hasFeedback rules={[{ required: true, message: 'Please select status' }]}>
              <Select>
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="REJECTED">Rejected</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};


// const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });

// Main UserManagement Component
const UserManagement = () => {
    // ... (previous state declarations remain the same)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Use useRef to maintain pagination state
    const paginationRef = useRef({
      current: 1,
      pageSize: 10,
      total: 0
    });

    const [filters, setFilters] = useState({
      reg_status: undefined,
      role: undefined,
    });

    const [statistics, setStatistics] = useState({
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });

    const fetchUsers = useCallback(
        async (params = {}) => {
          setLoading(true);
          try {
            const requestParams = {
              page: params.current || paginationRef.current.current,
              per_page: params.pageSize || paginationRef.current.pageSize,
              search: params.search !== undefined ? params.search : searchTerm,
              reg_status: params.reg_status || filters.reg_status,
              role: params.role || filters.role,
              sort_field: params.sort_field,
              sort_direction: params.sort_direction,
            };

            const response = await api.get('/users', { params: requestParams });

            if (response.data) {
              setUsers(response.data.data);
              paginationRef.current = {
                ...paginationRef.current,
                current: Number(response.data.current_page),
                total: Number(response.data.total),
              };

              // Fetch statistics
              const statsResponse = await api.get('/users', {
                params: {
                  per_page: 9999,
                  search: requestParams.search,
                  reg_status: requestParams.reg_status,
                  role: requestParams.role
                }
              });

              if (statsResponse.data?.data) {
                const allFilteredUsers = statsResponse.data.data;
                setStatistics({
                  total: allFilteredUsers.length,
                  approved: allFilteredUsers.filter(u => u.reg_status === 'APPROVED').length,
                  pending: allFilteredUsers.filter(u => u.reg_status === 'PENDING').length,
                  rejected: allFilteredUsers.filter(u => u.reg_status === 'REJECTED').length,
                });
              }
            }
          } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to fetch users');
          } finally {
            setLoading(false);
          }
        },
        [searchTerm, filters]
      );

      useEffect(() => {
        fetchUsers();
      }, [fetchUsers]);

    const debouncedSearch = useRef(
        debounce((value) => {
          setSearchTerm(value);
          paginationRef.current.current = 1;
          fetchUsers({ current: 1, search: value });
        }, 300)
      ).current;

      const handleSearch = (value) => {
        debouncedSearch(value);
      };

      const handleTableChange = (newPagination, tableFilters, sorter) => {
        const newFilters = {
          reg_status: tableFilters.reg_status?.[0],
          role: tableFilters.role?.[0]
        };
        setFilters(newFilters);

        paginationRef.current = {
          ...paginationRef.current,
          current: newPagination.current,
          pageSize: newPagination.pageSize,
        };

        fetchUsers({
          current: newPagination.current,
          pageSize: newPagination.pageSize,
          sort_field: sorter.field,
          sort_direction: sorter.order === 'ascend' ? 'asc' : 'desc',
          ...newFilters
        });
      };

      const handleRefresh = () => {
        paginationRef.current.current = 1;
        fetchUsers({ current: 1 });
      };

  const handleAddEdit = async values => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.staff_id}`, values);
        message.success('User updated successfully');
      } else {
        await api.post('/users', values);
        message.success('User added successfully');
      }
      setModalVisible(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Failed to save user');
    }
  };

  const handleDelete = async staffId => {
    try {
      await api.delete(`/users/${staffId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const getStatusColor = status => {
    const colors = {
      APPROVED: 'green',
      PENDING: 'gold',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  };

  const getRoleColor = role => {
    const colors = {
      ADMIN: 'purple',
      SALESPERSON: 'blue',
      OFFICE_STAFF: 'cyan',
    };
    return colors[role] || 'default';
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
              backgroundColor: getRoleColor(record.role) === 'default' ? '#1890ff' : undefined,
            }}
            className={`avatar-${getRoleColor(record.role)}`}
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
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: role => <Tag color={getRoleColor(role)}>{role}</Tag>,
      filters: [
        // { text: 'Admin', value: 'ADMIN' },
        { text: 'Salesperson', value: 'SALESPERSON' },
        { text: 'Office Staff', value: 'OFFICE_STAFF' },
      ],
      filterMultiple: false,
      filteredValue: filters.role ? [filters.role] : null,
    },
    {
      title: 'Status',
      dataIndex: 'reg_status',
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: [
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Pending', value: 'PENDING' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      filterMultiple: false,
      filteredValue: filters.reg_status ? [filters.reg_status] : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              className={Globalstyle.ActionButton}
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.staff_id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button danger icon={<DeleteOutlined />} className={Globalstyle.DeleteButton} />
            </Tooltip>
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
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>User Management</Title>
          <Button
            className={Globalstyle.ActionButton}
            icon={<UserAddOutlined />}
            onClick={() => {
              setEditingUser(null);
              setModalVisible(true);
            }}
          >
            Add User
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <TeamOutlined /> Total Users
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
                    <CheckCircleOutlined /> Approved
                  </Space>
                }
                value={statistics.approved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <Badge status="processing" />
                    Pending
                  </Space>
                }
                value={statistics.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <StopOutlined /> Rejected
                  </Space>
                }
                value={statistics.rejected}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%', padding: '1%' }}>
            <Space wrap>
            <Input.Search
                placeholder="Search users..."
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

              <Button className={Globalstyle.ActionButton} icon={<ReloadOutlined />} onClick={() => handleRefresh()}>
                Refresh
              </Button>
            </Space>

            <Table
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
            scroll={{ x: 1000 }}
            className="user-management-table"
            />
          </Space>
        </Card>

        {/* User Form Modal */}
        <UserForm
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingUser(null);
          }}
          onSubmit={handleAddEdit}
          initialValues={editingUser}
          mode={editingUser ? 'edit' : 'add'}
        />
      </Space>
    </div>
  );
};

export default UserManagement;
