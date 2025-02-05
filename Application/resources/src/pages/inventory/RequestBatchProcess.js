import React from 'react';
import {
  Modal, Form, Input, Space, Alert, Typography,
  Button, Card, List, Avatar, Tag,
  Tooltip, Statistic, Row, Col
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, UserOutlined, WarningOutlined,
  ShoppingCartOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const BatchProcessingModal = ({
  visible,
  onCancel,
  onApprove,
  onReject,
  selectedRequests,
  loading,
  form
}) => {
  const totalQuantity = selectedRequests.reduce((acc, item) => acc + parseInt(item.quantity, 10), 0);

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined style={{ color: '#1890ff' }} />
          <span>Batch Process Inventory Requests</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      className="batch-processing-modal"
    >
      <div className="modal-content">
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Requests"
                value={selectedRequests.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Items"
                value={totalQuantity}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Pending Action"
                value="Review"
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alert Message */}
        <Alert
          message="Batch Processing Mode"
          description={
            <Text>
              You are about to process <Text strong>{selectedRequests.length}</Text> requests
              with a total of <Text strong>{totalQuantity}</Text> items.
              Please review the details carefully before proceeding.
            </Text>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Selected Requests List */}
        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Selected Requests</span>
            </Space>
          }
          className="shadow-sm"
          bodyStyle={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          <List
            size="small"
            dataSource={selectedRequests}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <div className="request-title">
                      <Text strong>Request #{item.id}</Text>
                      <div className="request-tags">
                        <Tag color="blue">{item.username}</Tag>
                        <Tag color="green">{item.ItemCode}</Tag>
                      </div>
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Quantity: {item.quantity}</Text>
                      <Text type="secondary">{item.ItemDescription}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Comment Form */}
        <Form form={form} layout="vertical">
          <Form.Item
            name="batchComment"
            label={
              <Space>
                <InfoCircleOutlined />
                <span>Add a comment for all selected requests</span>
              </Space>
            }
            style={{ marginTop: '10px' }}
          >
            <TextArea
              rows={3}
              placeholder="Enter your comment here..."
              showCount
              maxLength={500}
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>
        </Form>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            block
            onClick={onCancel}
            className="cancel-button"
            style={{ marginBottom: '8px' }}
          >
            Cancel
          </Button>
          <Tooltip title="Approve all selected requests">
            <Button
              block
              icon={<CheckCircleOutlined />}
              onClick={onApprove}
              loading={loading}
              style={{
                marginBottom: '8px',
                backgroundColor: '#4caf50',
                borderColor: '#4caf50'
              }}
              className="approve-button"
            >
              Approve All ({selectedRequests.length})
            </Button>
          </Tooltip>
          <Tooltip title="Reject all selected requests">
            <Button
              block
              icon={<CloseCircleOutlined />}
              onClick={onReject}
              loading={loading}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f'
              }}
              className="reject-button"
            >
              Reject All ({selectedRequests.length})
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        .modal-content {
          padding: 16px;
        }

        .action-buttons {
          padding-top: 16px;
        }

        .cancel-button {
          margin-bottom: 8px;
        }

        .request-title {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .request-tags {
          margin-top: 4px;
        }

        @media (max-width: 576px) {
          .modal-content {
            padding: 8px;
          }

          .action-buttons button {
            margin-bottom: 8px;
          }

          .modal-content :global(.ant-card) {
            margin-bottom: 12px;
          }

          .request-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .request-tags {
            margin-top: 4px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default BatchProcessingModal;
