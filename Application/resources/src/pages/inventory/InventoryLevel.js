import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Table, Card, Space, Input, Tag, Typography, Row, Col,
  Statistic, Progress, Tooltip, Button, Alert,
  message, Breadcrumb, Form,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, HomeOutlined, DatabaseOutlined,
  CheckCircleOutlined, WarningOutlined, StopOutlined, SettingOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import Globalstyle from '../../App.module.css';
import styles from './inventory.module.css';
import { useAuthContext } from '../../contexts/AuthProvider';
import LowStockMonitor from './LowStockMonitor';
import StockSettingsForm from './StockSettingsForm';

const { Title, Text } = Typography;

const InventoryLevel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const paginationRef = useRef({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', itemGroup: undefined, itemType: undefined });
  const [sortState, setSortState] = useState({ field: undefined, order: undefined });
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    healthyStock: 0,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockViewMode, setLowStockViewMode] = useState('list');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [lowStockLoading] = useState(false);
  const [stockSettings, setStockSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm] = Form.useForm();
  const { user } = useAuthContext();

  const fetchStockSettings = async () => {
    try {
      const response = await api.get('/stock-settings');
      setStockSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch stock settings:', error);
      message.error('Failed to fetch stock settings');
    }
  };

  const fetchItems = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        if (!stockSettings) return;

        const requestParams = {
          page: params.current || paginationRef.current.current,
          per_page: params.pageSize || paginationRef.current.pageSize,
          search: params.search ?? filters.search,
          sort_field: params.sort_field,
          sort_direction: params.sort_direction,
          stock_level: params.stock_level || 'all',
          critical_threshold: stockSettings.critical_threshold,
          low_threshold: stockSettings.low_threshold,
          healthy_threshold: stockSettings.healthy_threshold,
        };

        if (params.item_group) {
          requestParams.item_group = params.item_group;
        }
        if (params.item_type) {
          requestParams.item_type = params.item_type;
        }

        const response = await api.get('/items', {
          params: requestParams
        });

        if (response.data) {
          const processedItems = response.data.data.map(item => ({
            ...item,
            quantity: parseFloat(item.BalQty),
          }));

          setItems(processedItems);
          paginationRef.current = {
            ...paginationRef.current,
            current: Number(response.data.current_page),
            total: Number(response.data.total),
          };

          const allItemsResponse = await api.get('/items', {
            params: {
              ...requestParams,
              per_page: 9999,
              page: 1,
            }
          });

          if (allItemsResponse.data && allItemsResponse.data.data) {
            const allFilteredItems = allItemsResponse.data.data.map(item => ({
              ...item,
              quantity: parseFloat(item.BalQty),
            }));

            setStatistics({
              totalItems: allFilteredItems.length,
              lowStock: allFilteredItems.filter(item =>
                parseFloat(item.BalQty) <= stockSettings.low_threshold &&
                parseFloat(item.BalQty) > 0
              ).length,
              outOfStock: allFilteredItems.filter(item =>
                parseFloat(item.BalQty) === 0
              ).length,
              healthyStock: allFilteredItems.filter(item =>
                parseFloat(item.BalQty) > stockSettings.low_threshold
              ).length,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
        message.error('Failed to fetch inventory items');
      } finally {
        setLoading(false);
      }
    },
    [filters.search, stockSettings],
  );

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const settingsResponse = await api.get('/stock-settings');
        setStockSettings(settingsResponse.data);

        const itemsResponse = await api.get('/items', {
          params: {
            page: paginationRef.current.current,
            per_page: paginationRef.current.pageSize,
            search: filters.search,
          },
        });

        if (itemsResponse.data) {
          const processedItems = itemsResponse.data.data.map(item => ({
            ...item,
            quantity: parseFloat(item.BalQty),
          }));

          setItems(processedItems);
          paginationRef.current = {
            ...paginationRef.current,
            current: itemsResponse.data.current_page,
            total: itemsResponse.data.total,
          };
        }

        const allItemsResponse = await api.get('/items', {
          params: {
            per_page: 9999
          }
        });

        if (allItemsResponse.data && allItemsResponse.data.data) {
          const criticalItems = allItemsResponse.data.data
            .map(item => ({
              ...item,
              quantity: parseFloat(item.BalQty),
            }))
            .filter(item => item.quantity <= settingsResponse.data.critical_threshold)
            .sort((a, b) => parseFloat(a.BalQty) - parseFloat(b.BalQty));

          setLowStockItems(criticalItems);
        }

      } catch (error) {
        console.error('Failed to initialize data:', error);
        message.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [filters.search]);

  useEffect(() => {
    if (stockSettings) {
      fetchItems();
    }
  }, [fetchItems, stockSettings]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (value) => {
    const searchValue = value.trim();
    setFilters(prev => ({ ...prev, search: searchValue }));
    paginationRef.current.current = 1;

    fetchItems({
      current: 1,
      pageSize: paginationRef.current.pageSize,
      search: searchValue,
      sort_field: sortState.field,
      sort_direction: sortState.order,
      item_group: filters.item_group,
      item_type: filters.item_type
    });
  };

  const handleTableChange = (newPagination, tableFilters, sorter) => {
    const newFilters = {
      ...filters,
      item_group: tableFilters.group?.length ? tableFilters.group[0] : undefined,
      item_type: tableFilters.type?.length ? tableFilters.type[0] : undefined,
    };

    const newSortState = {
      field: sorter.field,
      order: sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined
    };

    setFilters(newFilters);
    setSortState(newSortState);
    paginationRef.current = {
      ...paginationRef.current,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    };

    fetchItems({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      sort_field: newSortState.field,
      sort_direction: newSortState.order,
      item_group: tableFilters.group?.length ? tableFilters.group[0] : undefined,
      item_type: tableFilters.type?.length ? tableFilters.type[0] : undefined,
      search: filters.search
    });
  };

  const handleSaveSettings = async (values) => {
    setSavingSettings(true);
    try {
      await api.put('/stock-settings', values);
      message.success('Stock level thresholds updated successfully');
      setSettingsModalVisible(false);
      await fetchStockSettings();
      fetchItems();
    } catch (error) {
      console.error('Failed to update stock settings:', error);
      message.error('Failed to update stock settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const getStockStatus = qty => {
    if (!stockSettings) return { color: '#52c41a', text: 'Loading...', status: 'success' };

    const quantity = parseFloat(qty);
    if (quantity <= stockSettings.critical_threshold)
      return { color: '#ff4d4f', text: 'Critical', status: 'exception' };
    if (quantity <= stockSettings.low_threshold)
      return { color: '#faad14', text: 'Low', status: 'warning' };
    return { color: '#52c41a', text: 'Healthy', status: 'success' };
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'ItemCode',
      key: 'itemCode',
      sorter: true,
      width: '15%',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {parseFloat(record.BalQty) <= 5 && (
            <Tooltip title="Critical Stock Level">
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'description',
      sorter: true,
      width: '25%',
    },
    {
      title: 'Stock Level',
      dataIndex: 'BalQty',
      key: 'quantity',
      sorter: true,
      width: '25%',
      render: qty => {
        const status = getStockStatus(qty);
        const percentage = stockSettings ?
          Math.min((parseFloat(qty) / (stockSettings.healthy_threshold)) * 100, 100) : 0;
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text strong>{parseFloat(qty).toFixed(2)}</Text>
              <Tag color={status.color}>{status.text}</Tag>
            </Space>
            <Progress percent={percentage} status={status.status} showInfo={false} size="small" strokeColor={status.color} />
          </Space>
        );
      },
    },
    {
      title: 'Group',
      dataIndex: 'ItemGroup',
      key: 'group',
      width: '15%',
      filters: Array.from(new Set(items.map(item => item.ItemGroup)))
        .filter(Boolean)
        .map(group => ({ text: group, value: group })),
      filteredValue: filters.item_group ? [filters.item_group] : null,
      filterMultiple: false,
    },
    {
      title: 'Type',
      dataIndex: 'ItemType',
      key: 'type',
      width: '15%',
      filters: Array.from(new Set(items.map(item => item.ItemType)))
        .filter(Boolean)
        .map(type => ({ text: type || 'Uncategorized', value: type })),
      filteredValue: filters.item_type ? [filters.item_type] : null,
      filterMultiple: false,
      render: type => type || '-',
    },
  ];

  return (
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
            { title: 'Inventory' },
            { title: 'Inventory Level' },
          ]}
        />

        <Title level={2}>Inventory Level Monitor</Title>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <DatabaseOutlined /> Total Items
                  </Space>
                }
                value={statistics.totalItems}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <CheckCircleOutlined /> Healthy Stock
                  </Space>
                }
                value={statistics.healthyStock}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <WarningOutlined /> Low Stock
                  </Space>
                }
                value={statistics.lowStock}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <StopOutlined /> Out of Stock
                  </Space>
                }
                value={statistics.outOfStock}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <LowStockMonitor
          data={lowStockItems}
          loading={lowStockLoading}
          onRefresh={fetchItems}
          stockSettings={stockSettings}
          lowStockViewMode={lowStockViewMode}
          setLowStockViewMode={setLowStockViewMode}
        />

        {/* Main Content */}
        <Card style={{ padding: '1%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Input.Search
                placeholder="Search items..."
                allowClear
                enterButton={
                  <Button icon={<SearchOutlined />} type="primary">
                    Search
                  </Button>
                }
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value.trim()) {
                    handleSearch('');
                  }
                }}
                style={{ width: 250 }}
              />

              <Button
                icon={<ReloadOutlined />}
                className={Globalstyle.ActionButton}
                onClick={() => fetchItems()}
                loading={loading || lowStockLoading}
              >
                Refresh
              </Button>

              {user.role !== 'SALESPERSON' && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsModalVisible(true)}
                  className={Globalstyle.ActionButton}
                >
                  Configure Stock Levels
                </Button>
              )}
            </Space>

            <StockSettingsForm
              visible={settingsModalVisible}
              onCancel={() => {
                setSettingsModalVisible(false);
                settingsForm.resetFields();
              }}
              onSubmit={handleSaveSettings}
              loading={savingSettings}
              form={settingsForm}
              initialValues={stockSettings}
            />

            <Alert
              message="Stock Level Guide"
              description={
                stockSettings ? (
                  isMobile ? (
                    <Row gutter={[8, 8]}>
                      <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
                        <Tag color="red">Critical ≤{stockSettings.critical_threshold}</Tag>
                      </Col>
                      <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
                        <Tag color="orange">Low ≤{stockSettings.low_threshold}</Tag>
                      </Col>
                      <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 8 }}>
                        <Tag color="green">Healthy &gt;{stockSettings.low_threshold}</Tag>
                      </Col>
                    </Row>
                  ) : (
                    <div>
                      <Tag color="red">Critical ≤{stockSettings.critical_threshold}</Tag> |{' '}
                      <Tag color="orange">Low ≤{stockSettings.low_threshold}</Tag> |{' '}
                      <Tag color="green">Healthy &gt;{stockSettings.low_threshold}</Tag>
                    </div>
                  )
                ) : (
                  <Text>Loading thresholds...</Text>
                )
              }
              type="info"
              showIcon
            />

            <Table
            columns={columns}
            dataSource={items}
            rowKey="ItemCode"
            pagination={{
            ...paginationRef.current,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            loading={loading}
            scroll={{ x: 1200 }}
        />
          </Space>
        </Card>
      </Space>

      <style jsx>{`
        .ant-card-hoverable {
          transition: all 0.3s;
        }

        .ant-card-hoverable:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
        }

        .stock-warning {
          color: #faad14;
        }

        .stock-critical {
          color: #f5222d;
        }

        .stock-normal {
          color: #52c41a;
        }

        .ant-progress-circle {
          transition: all 0.3s ease;
        }

        .ant-progress-circle:hover {
          transform: scale(1.05);
        }

        .ant-tag {
          transition: all 0.3s ease;
        }

        .ant-tag:hover {
          transform: scale(1.05);
        }

        .ant-table-row {
          transition: all 0.3s ease;
        }

        .ant-table-row:hover {
          transform: translateX(4px);
        }

        .ant-statistic-content {
          transition: all 0.3s ease;
        }

        .ant-statistic-content:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default InventoryLevel;
