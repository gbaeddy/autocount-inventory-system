import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Statistic,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import ActivityChart from '../../components/ActivityChart';
import api from '../../services/api';
import Globalstyle from '../../App.module.css';
import styles from './activity.module.css';

const { Option } = Select;

const ActivityLog = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [stats, setStats] = useState({
    total_logs: 0,
    logs_today: 0,
    logs_this_week: 0,
    most_common_action: null,
    daily_activity: {},
  });

  const paginationRef = useRef({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const filtersRef = useRef({
    action: undefined,
    username: undefined,
    date_from: undefined,
    date_to: undefined,
  });

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/activity-logs', {
        params: {
          ...filtersRef.current,
          page: params.current || paginationRef.current.current,
          per_page: params.pageSize || paginationRef.current.pageSize,
          sort_by: params.sortField || 'created_at',
          sort_direction: params.sortOrder === 'ascend' ? 'asc' : 'desc',
        },
      });

      if (response.data) {
        setActivityLogs(response.data.data || []);
        paginationRef.current = {
          ...paginationRef.current,
          current: Number(response.data.current_page) || 1,
          total: Number(response.data.total) || 0,
        };
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      message.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/activity-logs/statistics');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Failed to fetch statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [actionTypesResponse] = await Promise.all([
          api.get('/activity-logs/action-types'),
          fetchActivityLogs(),
          fetchStatistics()
        ]);
        setActionTypes(actionTypesResponse.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        message.error('Failed to fetch initial data');
      }
    };

    fetchInitialData();
  }, [fetchActivityLogs]);

  // Handle table changes
  const handleTableChange = (pagination, _, sorter) => {
    paginationRef.current = {
      ...paginationRef.current,
      current: pagination.current,
      pageSize: pagination.pageSize,
    };
    fetchActivityLogs({
      current: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  // Handle filter changes
  const handleSearch = useCallback((key, value) => {
    filtersRef.current = { ...filtersRef.current, [key]: value };
    paginationRef.current.current = 1;
    fetchActivityLogs({ current: 1, pageSize: paginationRef.current.pageSize });
  }, [fetchActivityLogs]);

  // Table columns configuration
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
      width: '15%',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      sorter: true,
      width: '15%',
      render: action => (
        <Tag color={action === 'INSERT' ? 'green' : action === 'UPDATE' ? 'blue' : action === 'DELETE' ? 'red' : 'default'}>{action}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'actionDesc',
      width: '40%',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      sorter: true,
      width: '20%',
      render: date => new Date(date).toLocaleString(),
    },
  ];

  const handleRefresh = () => {
    fetchActivityLogs({ current: 1 });
    fetchStatistics();
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading} className={styles.CardDetails}>
            <Statistic title="Total Logs" value={stats.total_logs} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading} className={styles.CardDetails}>
            <Statistic title="Logs Today" value={stats.logs_today} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading} className={styles.CardDetails}>
            <Statistic title="Logs This Week" value={stats.logs_this_week} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading} className={styles.CardDetails}>
            <Statistic
              title="Most Common Action"
              value={stats.most_common_action?.action || 'N/A'}
              suffix={stats.most_common_action ? `(${stats.most_common_action.count})` : ''}
            />
          </Card>
        </Col>
      </Row>
      <Col xs={24} sm={24} md={24}>
        <ActivityChart dailyActivity={stats.daily_activity} />
      </Col>
      <Card style={{ marginTop: 16, padding: '1%' }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            style={{ width: 200 }}
            placeholder="Select Action"
            allowClear
            onChange={value => handleSearch('action', value)}
          >
            {actionTypes.map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>

          <Input.Search
            style={{ width: 300 }}
            placeholder="Search by username"
            allowClear
            enterButton={
              <Button icon={<SearchOutlined />} type="primary">
                Search
              </Button>
            }
            onSearch={value => handleSearch('username', value)}
          />

          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} className={Globalstyle.ActionButton} />
          </Tooltip>
        </Space>

        <Table
          columns={columns}
          dataSource={activityLogs}
          rowKey="log_id"
          pagination={{
            ...paginationRef.current,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default ActivityLog;
