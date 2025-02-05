import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Tooltip,
  Breadcrumb,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Alert,
  Avatar,
  Popconfirm,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  CommentOutlined,
  SearchOutlined,
  HomeOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import RequestDetails from './RequestDetails';
import BatchProcessingModal from './RequestBatchProcess';
import Globalstyle from '../../App.module.css';
import styles from './inventory.module.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const InventoryRequestAdmin = () => {
  // Existing state
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [viewCommentModalVisible, setViewCommentModalVisible] = useState(false);
  const [currentComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: undefined, order: undefined });

  // New state for batch operations and error handling
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [error, setError] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    todayRequests: 0,
  });

  const mountedRef = useRef(true);
  const paginationRef = useRef(pagination);
    // Update the ref whenever pagination changes
    useEffect(() => {
    paginationRef.current = pagination;
    }, [pagination]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
          mountedRef.current = false;
        };
      }, []);

      useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const requestId = searchParams.get('id');
        if (requestId) {
          openRequestDetails(requestId);
        }
      }, [location]);

      const openRequestDetails = async (requestId) => {
        try {
          setLoading(true);
          const response = await api.get(`/product-requests/${requestId}`);
          setSelectedRequest(response.data);
          setDetailsModalVisible(true);
        } catch (error) {
          console.error('Failed to fetch request details:', error);
          message.error('Failed to load request details');
        } finally {
          setLoading(false);
        }
      };

    const fetchRequests = useCallback(
        async (params = {}) => {
          setLoading(true);
          try {
            const sortField = params.sort_by || sortConfig.field || 'created_at';
            const sortOrder = params.sort_direction || sortConfig.order || 'desc';

            const response = await api.get('/product-requests', {
              params: {
                ...params,
                page: params.current || paginationRef.current.current,
                per_page: params.pageSize || paginationRef.current.pageSize,
                search: searchKeyword,
                status: statusFilter,
                sort_by: sortField,
                sort_direction: sortOrder,
                start_date: dateRange[0]?.format('YYYY-MM-DD'),
                end_date: dateRange[1]?.format('YYYY-MM-DD'),
              },
            });

            const requests = response.data.data;
            setRequests(requests);
            setPagination(prev => ({
              ...prev,
              current: Number(response.data.current_page),
              total: Number(response.data.total),
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
        [searchKeyword, statusFilter, dateRange, sortConfig]
      );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.put(`/product-requests/${requestId}`, { request_status: newStatus });
      message.success(`Request ${newStatus.toLowerCase()} successfully`);

      // Update the selectedRequest state
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(prevRequest => ({
          ...prevRequest,
          request_status: newStatus
        }));

        // Set a timeout to close the modal after 1.5 seconds
        setTimeout(() => {
          setDetailsModalVisible(false);
          setSelectedRequest(null);
        }, 1500);
      }

      // Refresh the main table data
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      message.error('Failed to update request status');
    }
  };

  const handleCommentSubmit = async values => {
    const requestStatus = selectedRequest.request_status || 'PENDING';
    try {
      await api.put(`/product-requests/${selectedRequest.id}`, {
        comment: values.comment,
        request_status: requestStatus,
      });
      message.success('Comment added successfully');
      setCommentModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      message.error('Failed to add comment');
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'PENDING':
        return <Badge status="processing" text="Pending" />;
      case 'APPROVED':
        return <Badge status="success" text="Approved" />;
      case 'REJECTED':
        return <Badge status="error" text="Rejected" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      sorter: true,
      width: 100,
    },
    {
      title: 'Requester',
      dataIndex: 'username',
      render: (username, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{username}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.staff_id}
            </Text>
          </Space>
        </Space>
      ),
      sorter: false,
    },
    {
      title: 'Item Details',
      key: 'item',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.ItemCode}</Text>
          <Text type="secondary">{record.ItemDescription}</Text>
          <Text type="secondary">Quantity: {record.quantity}</Text>
        </Space>
      ),
    },
    {
      title: 'Request Date',
      dataIndex: 'request_date',
      render: date => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'request_status',
      render: status => getStatusBadge(status),
      sorter: false,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space>
          {record.request_status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <Popconfirm
                  title="Approve Request"
                  description="Are you sure you want to approve this request?"
                  onConfirm={() => handleStatusChange(record.id, 'APPROVED')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button className={Globalstyle.ActionButton} icon={<CheckOutlined />}>
                    Approve
                  </Button>
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Reject">
                <Popconfirm
                  title="Reject Request"
                  description="Are you sure you want to reject this request?"
                  onConfirm={() => handleStatusChange(record.id, 'REJECTED')}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button className={Globalstyle.DeleteButton} icon={<CloseOutlined />}>
                    Reject
                  </Button>
                </Popconfirm>
              </Tooltip>
            </>
          )}
          <Tooltip title="Add Comment">
            <Button
              className={Globalstyle.ActionButton}
              icon={<CommentOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setCommentModalVisible(true);
              }}
            >
              Comment
            </Button>
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="link"
              onClick={() => {
                setSelectedRequest(record);
                setDetailsModalVisible(true);
              }}
              icon={<InfoCircleOutlined />}
            >
              View Details
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    setSortConfig({
      field: sorter.field,
      order: sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined
    })

    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  // Batch operation handlers
  const handleBatchApprove = async () => {
    setBatchLoading(true);
    try {
      const comment = batchForm.getFieldValue('batchComment');
      await Promise.all(
        selectedRowKeys.map(id =>
          api.put(`/product-requests/${id}`, {
            request_status: 'APPROVED',
            comment: comment || undefined,
          }),
        ),
      );
      message.success(`Successfully approved ${selectedRowKeys.length} requests`);
      setBatchModalVisible(false);
      setSelectedRowKeys([]);
      batchForm.resetFields();
      fetchRequests();
    } catch (error) {
      setError('Failed to process batch approval');
      console.error('Batch approval error:', error);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchReject = async () => {
    setBatchLoading(true);
    try {
      const comment = batchForm.getFieldValue('batchComment');
      await Promise.all(
        selectedRowKeys.map(id =>
          api.put(`/product-requests/${id}`, {
            request_status: 'REJECTED',
            comment: comment || undefined,
          }),
        ),
      );
      message.success(`Successfully rejected ${selectedRowKeys.length} requests`);
      setBatchModalVisible(false);
      setSelectedRowKeys([]);
      batchForm.resetFields();
      fetchRequests();
    } catch (error) {
      setError('Failed to process batch rejection');
      console.error('Batch rejection error:', error);
    } finally {
      setBatchLoading(false);
    }
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys),
    getCheckboxProps: record => ({
      disabled: record.request_status !== 'PENDING',
    }),
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
            { title: 'Request Management' },
          ]}
        />
        <Title level={2}>Inventory Request Management</Title>

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
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {statistics.pending > 0 && (
          <Alert
            message={`${statistics.pending} pending ${statistics.pending === 1 ? 'request requires' : 'requests require'} your attention`}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        )}

        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Batch Process Button */}
          <Space style={{ marginLeft: '16px' }}>
            <Tooltip>
              <Button
                className={selectedRowKeys.length > 0 ? Globalstyle.ActionButton : ''}
                icon={<CheckCircleOutlined />}
                onClick={() => setBatchModalVisible(true)}
                disabled={selectedRowKeys.length === 0}
              >
                Batch Process
              </Button>
            </Tooltip>
            <Text style={{ color: selectedRowKeys.length > 0 ? '#1E90FF' : '#808080' }}>
            {selectedRowKeys.length} item{selectedRowKeys.length !== 1 ? 's' : ''} selected
            </Text>
          </Space>

          {/* Status Filter Buttons */}
          <Space wrap style={{ marginLeft: '16px' }}>
            <Button
              className={statusFilter === 'PENDING' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              className={statusFilter === 'APPROVED' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved
            </Button>
            <Button
              className={statusFilter === 'REJECTED' ? styles.ActiveButton : Globalstyle.ActionButton}
              onClick={() => setStatusFilter('REJECTED')}
            >
              Rejected
            </Button>
          </Space>

          {/* Search and Refresh */}
          <Space wrap style={{ marginLeft: '16px' }}>
            <Input.Search
              placeholder="Search requests..."
              allowClear
              enterButton={<Button icon={<SearchOutlined />} type="primary" />}
              style={{ width: 250 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch('');
                }
              }}
            />

            <Button className={Globalstyle.ActionButton} icon={<ReloadOutlined />} onClick={fetchRequests}>
              Refresh
            </Button>
          </Space>
        </Space>

        <Table
          style={{ width: '100%' }}
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={requests}
          rowKey="id"
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
      </Space>
    </Card>
        {/* Comment Modal */}
        <Modal
          title="Add Comment"
          open={commentModalVisible}
          onCancel={() => {
            setCommentModalVisible(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleCommentSubmit} layout="vertical">
            <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Please enter a comment' }]}>
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button className={Globalstyle.ActionButton} htmlType="submit">
                  Submit Comment
                </Button>
                <Button
                  className={Globalstyle.DeleteButton}
                  onClick={() => {
                    setCommentModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Comment Modal */}
        <Modal
          title="View Comment"
          open={viewCommentModalVisible}
          onCancel={() => setViewCommentModalVisible(false)}
          footer={[
            <Button key="close" className={Globalstyle.ActionButton} onClick={() => setViewCommentModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          <Card>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{currentComment || 'No comment available.'}</Paragraph>
          </Card>
        </Modal>

        {/* Request Details Modal */}
        <RequestDetails
        request={selectedRequest}
        visible={detailsModalVisible}
        onClose={() => {
            setDetailsModalVisible(false);
            setSelectedRequest(null);
        }}
        onApprove={(id) => handleStatusChange(id, 'APPROVED')}
        onReject={(id) => handleStatusChange(id, 'REJECTED')}
        />
        <BatchProcessingModal
          visible={batchModalVisible}
          onCancel={() => {
            setBatchModalVisible(false);
            batchForm.resetFields();
          }}
          onApprove={handleBatchApprove}
          onReject={handleBatchReject}
          selectedRequests={requests.filter(req => selectedRowKeys.includes(req.id))}
          loading={batchLoading}
          form={batchForm}
        />
      </Space>

      {/* Enhanced Error Handling */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
        />
      )}
    </div>
  );
};

// Additional utility components and styles
const Descriptions = ({ children, ...props }) => {
  return (
    <Card bordered={false} {...props}>
      <dl className="descriptions">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === Descriptions.Item) {
            return (
              <div className="description-item">
                <dt className="description-term">{child.props.label}</dt>
                <dd className="description-detail">{child.props.children}</dd>
              </div>
            );
          }
          return child;
        })}
      </dl>
    </Card>
  );
};

Descriptions.Item = ({ children }) => children;

export default InventoryRequestAdmin;
