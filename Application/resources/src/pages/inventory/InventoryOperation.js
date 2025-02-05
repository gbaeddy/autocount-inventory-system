import React, { useState, useCallback, useEffect, useRef} from 'react';
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
  Tooltip,
  Alert,
  Popconfirm,
  message,
  Breadcrumb,
  Form,
  Select,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  HomeOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import Globalstyle from '../../App.module.css';
import styles from './inventory.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

// ItemForm Component for Add/Edit
const ItemForm = ({ visible, onCancel, onSubmit, initialValues, mode }) => {
  const [form] = Form.useForm();
  const [duplicateChecking] = useState(false);
//   const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const validateItemCode = async (_, value) => {
    // Skip validation if in edit mode
    if (mode === 'edit') {
      return Promise.resolve();
    }

    // Basic validation checks
    if (!value) {
      return Promise.reject('Please enter an item code');
    }

    // Check format - only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject('Item Code can only contain letters and numbers');
    }

    try {
      // Fetch items from the API to check for duplicates
      const response = await api.get('/items', {
        params: {
          search: value, // Use search parameter to filter
          per_page: 100  // Limit the results since we only need to check existence
        }
      });

      // Check if any item with this code exists
      if (response.data && response.data.data) {
        const items = response.data.data;
        const isDuplicate = items.some(item =>
          item.ItemCode.toLowerCase() === value.toLowerCase()
        );

        if (isDuplicate) {
          return Promise.reject('Item code already exists');
        }
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error checking item code:', error);
      message.warning('Could not verify if item code is unique');
      return Promise.resolve();
    }
  };

  const validateDescription = (_, value) => {
    if (!value) {
      return Promise.reject('Please enter a description');
    }
    return Promise.resolve();
  };

  const validateBaseUOM = (_, value) => {
    if (!value) {
      return Promise.reject('Please enter a base UOM');
    }
    if (!/^[a-zA-Z]+$/.test(value)) {
      return Promise.reject('Base UOM can only contain letters');
    }
    return Promise.resolve();
  };

  const validateNumeric = (fieldName) => (_, value) => {
    if (value === undefined || value === null) {
      return Promise.reject(`Please enter a valid ${fieldName}`);
    }
    if (value < 0) {
      return Promise.reject(`${fieldName} cannot be negative`);
    }
    if (fieldName === 'Balance Qty' && !Number.isInteger(value)) {
      return Promise.reject('Balance Qty must be a whole number');
    }
    return Promise.resolve();
  };

  useEffect(() => {
    // Watch for changes in BaseUOM field
    const baseUOMSubscription = form.getFieldValue('BaseUOM');
    if (baseUOMSubscription) {
      form.setFieldsValue({
        SalesUOM: baseUOMSubscription,
        PurchaseUOM: baseUOMSubscription,
      });
    }

    // Watch for changes in BalQty field
    const balQtySubscription = form.getFieldValue('BalQty');
    if (balQtySubscription !== undefined) {
      form.setFieldsValue({
        TotalBalQty: balQtySubscription,
      });
    }
  }, [form]);

  // Handle Base UOM change
  const handleBaseUOMChange = value => {
    if (/^[a-zA-Z]*$/.test(value)) {
      form.setFieldsValue({
        SalesUOM: value,
        PurchaseUOM: value,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate all form fields
      const values = await form.validateFields();

      console.log('Submitting form values:', values);

      // Submit to parent component
      await onSubmit(values);

      // Reset form on successful submission
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
      if (error.errorFields) {
        // Form validation error
        message.error('Please fill in all required fields correctly');
      }
    }
  };

  return (
    <Modal title={mode === 'edit' ? 'Edit Item' : 'Add New Item'} open={visible} onCancel={onCancel} onOk={handleSubmit} confirmLoading={duplicateChecking} width={800}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ItemCode" label="Item Code" rules={[{ validator: validateItemCode, required: true }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Input
                placeholder='Item Code'
                maxLength={20}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                }}
                disabled={mode === 'edit'}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="Description" label="Description" rules={[{ validator: validateDescription, required: true }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Input
                placeholder='Description'
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ItemGroup" label="Item Group" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select placeholder="Select Item Group">
                <Select.Option value="RELOAD">RELOAD</Select.Option>
                <Select.Option value="PHONE">PHONE</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ItemType" label="Item Type" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select placeholder="Select Item Type">
                <Select.Option value="CELCOM">CELCOM</Select.Option>
                <Select.Option value="DIGI">DIGI</Select.Option>
                <Select.Option value="LG">LG</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="StockControl" label="Stock Control" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select>
                <Option value="T">Yes</Option>
                <Option value="F">No</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="HasSerialNo" label="Has Serial No" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select>
                <Option value="T">Yes</Option>
                <Option value="F">No</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="HasBatchNo" label="Has Batch No" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select>
                <Option value="T">Yes</Option>
                <Option value="F">No</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="DutyRate" label="Duty Rate" rules={[{ validator: validateNumeric('Duty Rate') }]} validateTrigger={['onChange', 'onBlur']} hasFeedback initialValue={0}>
              <InputNumber
                style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="Price" label="Price" rules={[{ validator: validateNumeric('Price') }]} validateTrigger={['onChange', 'onBlur']} hasFeedback initialValue={0}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="BalQty" label="Balance Qty" rules={[{ validator: validateNumeric('Balance Qty') }]} validateTrigger={['onChange', 'onBlur']} hasFeedback initialValue={0}>
              <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="BaseUOM" label="Base UOM" rules={[{ validator: validateBaseUOM, required: true }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Input onChange={e => handleBaseUOMChange(e.target.value)} disabled={mode === 'edit'}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="SalesUOM" label="Sales UOM" rules={[{ required: true }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="PurchaseUOM" label="Purchase UOM" rules={[{ required: true }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="IsActive" label="Status" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select>
                <Option value="T">Active</Option>
                <Option value="F">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="CostingMethod" label="Costing Method" rules={[{ required: true, message: 'Required' }]} validateTrigger={['onChange', 'onBlur']} hasFeedback>
              <Select>
                <Option value={0}>FIXED COST</Option>
                <Option value={1}>WEIGHTED AVERAGE</Option>
                <Option value={2}>FIFO</Option>
                <Option value={3}>LIFO</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// ItemDetailsModal Component
const ItemDetailsModal = ({ item, visible, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [modalVisible, setModalVisible] = useState(visible);

    useEffect(() => {
      setModalVisible(visible);
      if (visible) {
        setIsClosing(false);
      }
    }, [visible]);

    const handleSoftClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        setModalVisible(false);
        onClose();
      }, 300); // Match this with the CSS animation duration
    };

    if (!item) return null;

    return (
      <Modal
        title="Item Details"
        open={modalVisible}
        onCancel={handleSoftClose}
        footer={[
          <Button key="close" onClick={handleSoftClose}>
            Close
          </Button>,
        ]}
        width={700}
        className={`item-details-modal ${isClosing ? 'closing' : ''}`}
      >
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text type="secondary">Item Code</Text>
              <div>
                <Text strong>{item.ItemCode}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Description</Text>
              <div>
                <Text strong>{item.Description}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Item Group</Text>
              <div>
                <Text strong>{item.ItemGroup}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Item Type</Text>
              <div>
                <Text strong>{item.ItemType || 'N/A'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Price</Text>
              <div>
                <Text strong>${parseFloat(item.Price).toFixed(2)}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Current Stock</Text>
              <div>
                <Text strong>{parseFloat(item.BalQty).toFixed(2)}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Status</Text>
              <div>
                <Tag color={item.IsActive === 'T' ? 'green' : 'red'}>{item.IsActive === 'T' ? 'Active' : 'Inactive'}</Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Stock Control</Text>
              <div>
                <Tag color={item.StockControl === 'T' ? 'blue' : 'default'}>{item.StockControl === 'T' ? 'Yes' : 'No'}</Tag>
              </div>
            </Col>
          </Row>
        </Card>
        <style jsx>{`
        .item-details-modal {
          transform: scale(1);
          opacity: 1;
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }
        .item-details-modal.closing {
          transform: scale(0);
          opacity: 0;
        }
        .ant-modal-content {
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }
        .closing .ant-modal-content {
          transform: scale(0.8);
          opacity: 0;
        }
      `}</style>
      </Modal>
    );
  };

// Main InventoryOperation Component
const InventoryOperation = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [stockSettings, setStockSettings] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: undefined, order: undefined });
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    activeItems: 0,
    lowStock: 0,
    totalValue: 0,
  });

  const paginationRef = useRef({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchItems = useCallback(async (params = {}) => {
    if (!stockSettings) return;
    setLoading(true);
    try {
      // Use ref values for pagination
      const requestParams = {
        page: params.current || paginationRef.current.current,
        per_page: params.pageSize || paginationRef.current.pageSize,
        search: searchTerm,
        sort_field: params.sortField || sortConfig.field,
        sort_direction: params.sortOrder || sortConfig.order,
      };

      const response = await api.get('/items', {
        params: requestParams
      });

      if (response.data) {
        setItems(response.data.data);
        // Update ref instead of state
        paginationRef.current = {
          ...paginationRef.current,
          current: Number(response.data.current_page),
          total: Number(response.data.total),
        };
      }

      // Fetch ALL items for statistics (without pagination)
      const statsResponse = await api.get('/items', {
        params: {
          per_page: 9999,
          search: searchTerm,
        }
      });

      if (statsResponse.data?.data) {
        const allItems = statsResponse.data.data;
        setStatistics({
          totalItems: allItems.length,
          activeItems: allItems.filter(item => item.IsActive === 'T').length,
          lowStock: allItems.filter(item =>
            parseFloat(item.BalQty) <= stockSettings.low_threshold &&
            parseFloat(item.BalQty) > 0
          ).length,
          totalValue: allItems.reduce((sum, item) =>
            sum + (parseFloat(item.Price) * parseFloat(item.BalQty)), 0
          ),
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, stockSettings, sortConfig]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [settingsResponse, itemsResponse] = await Promise.all([
          api.get('/stock-settings'),
          api.get('/items', {
            params: {
              page: paginationRef.current.current,
              per_page: paginationRef.current.pageSize,
              search: searchTerm,
            },
          }),
        ]);

        setStockSettings(settingsResponse.data);

        if (itemsResponse.data) {
          setItems(itemsResponse.data.data);
          paginationRef.current = {
            ...paginationRef.current,
            current: itemsResponse.data.current_page,
            total: itemsResponse.data.total,
          };
        }

        // Fetch statistics
        const statsResponse = await api.get('/items', {
          params: {
            per_page: 9999,
            search: searchTerm,
          },
        });

        if (statsResponse.data?.data) {
          const allItems = statsResponse.data.data;
          setStatistics({
            totalItems: allItems.length,
            activeItems: allItems.filter(item => item.IsActive === 'T').length,
            lowStock: allItems.filter(item =>
              parseFloat(item.BalQty) <= settingsResponse.data.low_threshold &&
              parseFloat(item.BalQty) > 0
            ).length,
            totalValue: allItems.reduce((sum, item) =>
              sum + (parseFloat(item.Price) * parseFloat(item.BalQty)), 0
            ),
          });
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        message.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [searchTerm]);

  useEffect(() => {
    if (stockSettings) {
      fetchItems();
    }
  }, [stockSettings, fetchItems]); // Add fetchItems to dependencies

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Update ref directly
    paginationRef.current.current = 1;
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    const newSortConfig = {
      field: sorter.field,
      order: sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined
    };
    setSortConfig(newSortConfig);

    paginationRef.current = {
      ...paginationRef.current,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    };

    fetchItems({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      sortField: newSortConfig.field,
      sortOrder: newSortConfig.order
    });
  };

  const handleAddEdit = async values => {
    try {
      if (editingItem) {
        // Calculate the updated BalQty
        if ('BalQty' in values && editingItem.BalQty != null) {
          values.BalQty = values.BalQty - editingItem.BalQty;
        }

        await api.put(`/items/${editingItem.ItemCode}`, values);
        message.success('Item updated successfully');
      } else {
        await api.post('/items', values);
        message.success('Item added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error.response ? error.response.data : error);
      message.error('Failed to save item: ' + (error.response ? error.response.data.message : 'Unknown error'));
    }
  };

  const handleDelete = async itemCode => {
    try {
      await api.delete(`/items/${itemCode}`);
      message.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
    }
  };

  const getStockStatus = qty => {
    if (!stockSettings) return { color: '#52c41a', text: 'Loading...', status: 'success' };

    const quantity = parseFloat(qty);
    const { critical_threshold, low_threshold } = stockSettings;

    if (quantity <= critical_threshold) return { color: 'red', text: 'Critical' };
    if (quantity <= low_threshold) return { color: 'orange', text: 'Low' };
    return { color: 'green', text: 'Healthy' };
  };

  const columns = [
    {
      title: 'Item',
      key: 'item',
      dataIndex: 'ItemCode',
      render: (_, record) => (
        <Space>
          <Text strong>{record.ItemCode}</Text>
          <Text type="secondary">{record.Description}</Text>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Group',
      dataIndex: 'ItemGroup',
      sorter: true,
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      render: price => `$${parseFloat(price).toFixed(2)}`,
      sorter: true,
    },
    {
      title: 'Stock Level',
      dataIndex: 'BalQty',
      render: qty => {
        const status = getStockStatus(qty);
        return (
          <Tag color={status.color}>
            {parseFloat(qty).toFixed(2)} - {status.text}
          </Tag>
        );
      },
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'IsActive',
      render: isActive => <Tag color={isActive === 'T' ? 'green' : 'red'}>{isActive === 'T' ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              className={Globalstyle.ActionButton}
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              className={Globalstyle.ActionButton}
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.ItemCode)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button className={Globalstyle.DeleteButton} danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f5f5f5f' }}>
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
            { title: 'Inventory Operation' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Inventory Operation</Title>
          <Button
            className={Globalstyle.ActionButton}
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              setModalVisible(true);
            }}
          >
            Add Item
          </Button>
        </div>

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
                    <CheckCircleOutlined /> Active Items
                  </Space>
                }
                value={statistics.activeItems}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <StopOutlined /> Low Stock Items
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
                    <ShoppingOutlined /> Total Value
                  </Space>
                }
                value={statistics.totalValue}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%', padding: '1%' }}>
            <Space wrap>
              <Input.Search
                placeholder="Search by code or description..."
                allowClear
                enterButton={
                  <Button icon={<SearchOutlined />} type="primary" className={Globalstyle.ActionButton}>
                    Search
                  </Button>
                }
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleSearch('');
                  }
                }}
                style={{ width: 300 }}
              />

              <Button className={Globalstyle.ActionButton} icon={<ReloadOutlined />} onClick={() => fetchItems()} tooltip="Refresh">
                Refresh
              </Button>
            </Space>

            {items.length === 0 && !loading ? (
              <Alert message="No Items Found" description="No inventory items match your search criteria." type="info" showIcon />
            ) : (
              <Table
                columns={columns}
                dataSource={items}
                rowKey="ItemCode"
                loading={loading}
                pagination={{
                    ...paginationRef.current,
                    showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
              />
            )}
          </Space>
        </Card>

        {/* Item Form Modal */}
        <ItemForm
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingItem(null);
          }}
          onSubmit={handleAddEdit}
          initialValues={editingItem}
          mode={editingItem ? 'edit' : 'add'}
        />

        {/* Item Details Modal */}
        <ItemDetailsModal
          item={selectedItem}
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedItem(null);
          }}
        />
      </Space>

      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .ant-table-row {
          transition: all 0.3s ease;
        }
        .ant-table-row:hover {
          transform: translateX(4px);
        }
        .ant-tag {
          transition: all 0.3s ease;
        }
        .ant-tag:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default InventoryOperation;
