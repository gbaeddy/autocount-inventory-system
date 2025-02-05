import React, { useState, useEffect, useCallback, useRef} from 'react';
import {
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Modal,
  Space,
  Typography,
  Tooltip,
  Breadcrumb,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CommentOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  StopOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuthContext } from '../../contexts/AuthProvider';
import PropTypes from 'prop-types';
import ItemSelector from './Itemselector';
import Globalstyle from '../../App.module.css';
import styles from './inventory.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const InventoryRequest = () => {
  const [form] = Form.useForm();
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: undefined, order: undefined });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const paginationRef = useRef(pagination);
  // Update the ref whenever pagination changes
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchRequests = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const { data } = await api.get('/product-requests', {
          params: {
            ...params,
            page: params.current || paginationRef.current.current,
            per_page: params.pageSize || paginationRef.current.pageSize,
            search: searchKeyword,
            status: statusFilter,
            staff_id: user.staff_id,
            sort_by: sortConfig.field || params.sort_by,
            sort_direction: sortConfig.order || params.sort_direction,
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD'),
          },
        });

        const requests = data.data;
        setRequests(requests);
        setPagination(prev => ({
          ...prev,
          current: Number(data.current_page),
          total: Number(data.total),
        }));

        const allItemsResponse = await api.get('/product-requests', {
          params: {
            per_page: 10000,
            search: searchKeyword,
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD'),
          },
        });

        const allRequests = allItemsResponse.data.data;
        setStatistics({
          total: allItemsResponse.data.total,
          pending: allRequests.filter(r => r.request_status === 'PENDING').length,
          approved: allRequests.filter(r => r.request_status === 'APPROVED').length,
          rejected: allRequests.filter(r => r.request_status === 'REJECTED').length,
        });
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        message.error('Failed to fetch inventory requests');
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword, statusFilter, user.staff_id, dateRange, sortConfig] // removed pagination
  );

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/items', {
        params: {
          per_page: 9999, // Very large number to get all items
        },
      });

      // Process all items
      const processedItems = data.data.map(item => ({
        ...item,
        BalQty: parseFloat(item.BalQty),
        IsActive: item.IsActive === 'T',
      }));

      setItems(processedItems);
    } catch (error) {
      message.error('Failed to load inventory items');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, [fetchRequests]);

  const handleSubmit = async values => {
    try {
      // Basic validation
      if (!selectedItemDetails) {
        message.error('Please select an item');
        return;
      }

      // Convert values to numbers for comparison
      const requestedQty = Number(values.quantity);
      const availableQty = Number(selectedItemDetails.BalQty);

      // Validate quantity
      if (!requestedQty || requestedQty <= 0) {
        message.error('Please enter a valid quantity');
        return;
      }

      // Comprehensive validation with detailed messages
      if (!values.ItemCode) {
        message.error('Please select an item');
        return;
      }

      if (!values.description?.trim()) {
        message.error('Please enter a description');
        return;
      }

      // Active status check
      if (!selectedItemDetails.IsActive) {
        message.error('Cannot submit request for inactive items');
        return;
      }

      // Stock availability check
      if (requestedQty > availableQty) {
        message.error(`Insufficient stock. Available: ${availableQty}, Requested: ${requestedQty}`);
        return;
      }

      // If all validations pass, submit the request
      const response = await api.post('/product-requests', {
        ...values,
        staff_id: user.staff_id,
        request_date: new Date().toISOString().split('T')[0],
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Request submitted successfully');
        setModalVisible(false);
        form.resetFields();
        setSelectedItemDetails(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to submit request:', error);

      // More detailed error messaging
      if (error.response) {
        message.error(error.response.data.message || 'Failed to submit request');
      } else {
        message.error('Failed to submit request. Please try again.');
      }
    }
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setSortConfig({
      field: sorter.field,
      order: sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined
    });

    setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
  };

  const showCommentModal = comment => {
    setCurrentComment(comment);
    setCommentModalVisible(true);
  };

  const getStatusColor = status => {
    const colors = {
      APPROVED: 'green',
      PENDING: 'gold',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: 'Item Details',
      key: 'item',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.ItemCode}</Text>
          <Text type="secondary">{record.ItemDescription}</Text>
        </Space>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      sorter: true,
      render: qty => <Text strong>{qty}</Text>,
    },
    {
      title: 'Request Date',
      dataIndex: 'request_date',
      sorter: true,
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'request_status',
      render: status => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      render: comment => {
        if (!comment) return '-';
        return (
          <Tooltip title="View Comment">
            <Button className={Globalstyle.ActionButton} type="text" icon={<CommentOutlined />} onClick={() => showCommentModal(comment)}>
              View Comment
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  const handleItemChange = itemCode => {
    // Find the selected item from our complete items list
    const selectedItem = items.find(item => item.ItemCode === itemCode);
    if (selectedItem) {
      setSelectedItemDetails(selectedItem);
      form.setFieldsValue({ quantity: null }); // Reset quantity field

      // Stock level warning
      if (selectedItem.BalQty <= 10) {
        message.warning(`This item has low stock (${selectedItem.BalQty} units remaining).`);
      }
    } else {
      message.error('Error loading item details');
    }
  };

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
            { title: 'My Requests' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>My Inventory Requests</Title>
          <Button className={Globalstyle.ActionButton} icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            New Request
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className={styles.CardDetails}>
              <Statistic
                title={
                  <Space>
                    <ShoppingCartOutlined /> Total Requests
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
                    <ClockCircleOutlined /> Pending
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
          <div style={{}}>
            <Button
              style={{ margin: '0.5%' }}
              className={statusFilter === 'PENDING' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              style={{ margin: '0.5%' }}
              className={statusFilter === 'APPROVED' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved
            </Button>
            <Button
              style={{ margin: '0.5%' }}
              className={statusFilter === 'REJECTED' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected
            </Button>

            <Input.Search
              placeholder="Search by item code"
              allowClear
              enterButton={<Button icon={<SearchOutlined />} type="primary"></Button>}
              style={{ width: 250, margin: '0.5%' }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch('');
                }
              }}
            />

            <Button
              className={Globalstyle.ActionButton}
              style={{ margin: '0.5%' }}
              icon={<ReloadOutlined />}
              onClick={() => fetchRequests()}
            >
              Refresh
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>

        {/* New Request Modal */}
        <Modal
          title="New Inventory Request"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedItemDetails(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="ItemCode"
              label={
                <>
                  Item <span style={{ color: '#ff4d4f' }}>*</span>
                </>
              }
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <ItemSelector onChange={handleItemChange} disabled={loading} />
            </Form.Item>
            {items.length === 0 && !loading && (
              <Alert
                message="No items available"
                description="There was an error loading the items. Please try again."
                type="error"
                showIcon
              />
            )}
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: 'Please enter the quantity' },
                {
                  validator: (_, value) => {
                    if (!selectedItemDetails) return Promise.resolve();
                    if (!value || value <= 0) {
                      return Promise.reject('Quantity must be greater than 0');
                    }
                    if (value > selectedItemDetails.BalQty) {
                      return Promise.reject('Quantity exceeds available stock');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber min={1} max={selectedItemDetails?.BalQty} style={{ width: '100%' }} disabled={!selectedItemDetails} />
            </Form.Item>

            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description' }]}>
              <TextArea rows={4} disabled={!selectedItemDetails} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button className={Globalstyle.ActionButton} htmlType="submit" disabled={!selectedItemDetails}>
                  Submit Request
                </Button>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setSelectedItemDetails(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Comment Modal */}
        <Modal
          title="Comment Details"
          open={commentModalVisible}
          onCancel={() => setCommentModalVisible(false)}
          footer={[
            <Button key="close" className={Globalstyle.DeleteButton} onClick={() => setCommentModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          <p style={{ whiteSpace: 'pre-wrap' }}>{currentComment}</p>
        </Modal>
        {/* Add warning dialogs/modals */}
        <Modal
          title="Low Stock Warning"
          open={selectedItemDetails?.BalQty <= 10 && modalVisible && !selectedItemDetails?.warningAcknowledged}
          onOk={() => {
            // Just close the warning modal but keep the request form modal open
            setSelectedItemDetails({
              ...selectedItemDetails,
              warningAcknowledged: true,
            });
          }}
          onCancel={() => {
            setSelectedItemDetails(null);
            form.resetFields();
            setModalVisible(false);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setSelectedItemDetails(null);
                form.resetFields();
                setModalVisible(false);
              }}
            >
              Cancel Request
            </Button>,
            <Button
              key="submit"
              onClick={() => {
                // Acknowledge the warning and allow the user to proceed
                setSelectedItemDetails({
                  ...selectedItemDetails,
                  warningAcknowledged: true,
                });
                message.info('You can now proceed with your request');
              }}
            >
              Proceed Anyway
            </Button>,
          ]}
        >
          <Alert
            message="Low Stock Warning"
            description={`This item has low stock (${selectedItemDetails?.BalQty} units remaining). Please make sure you really need this quantity.`}
            type="warning"
            showIcon
          />
        </Modal>

        {/* Custom Styles */}
        <style jsx>{`
          .ant-statistic-title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.45);
          }

          .ant-card-hoverable {
            transition: all 0.3s;
          }

          .ant-card-hoverable:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          }

          .ant-alert {
            margin-bottom: 16px;
          }

          .ant-form-item-label > label {
            font-weight: 500;
          }

          .ant-select-selection-item {
            font-weight: normal;
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
        `}</style>
      </Space>

      {/* Helper functions */}
      <script>
        {' '}
        {`
        function formatQuantity(qty) {
          return parseFloat(qty).toFixed(2);
        }

        function getStockLevel(qty) {
          const quantity = parseFloat(qty);
          if (quantity <= 5) return { color: '#ff4d4f', text: 'Critical', status: 'exception' };
          if (quantity <= 10) return { color: '#faad14', text: 'Low', status: 'warning' };
          return { color: '#52c41a', text: 'Normal', status: 'success' };
        }

        function validateQuantity(value, max) {
          if (!value) return false;
          if (value <= 0) return false;
          if (value > max) return false;
          return true;
        }

        function formatDate(date) {
          return new Date(date).toLocaleDateString();
        }
      `}
      </script>
    </div>
  );
};

// Add PropTypes validation
InventoryRequest.propTypes = {
  user: PropTypes.shape({
    staff_id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }),
};

export default InventoryRequest;
