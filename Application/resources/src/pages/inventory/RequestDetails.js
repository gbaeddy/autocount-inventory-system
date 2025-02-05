import React, { useState } from 'react';
import {
  Modal, Space, Tag, Typography, Card, Avatar,
  Timeline, Badge, Descriptions, Row, Col,
  Statistic, Progress, Button
} from 'antd';
import {
  UserOutlined, CalendarOutlined, ShoppingCartOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  InfoCircleOutlined, FileTextOutlined, TagOutlined
} from '@ant-design/icons';
import Globalstyle from '../../App.module.css'

const { Text, Title } = Typography;

const RequestDetails = ({ request, visible, onClose, onApprove, onReject }) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!visible && !isClosing) return null;

  const getStatusInfo = (status) => {
    const statusMap = {
      'APPROVED': {
        color: '#52c41a',
        icon: <CheckCircleOutlined />,
        text: 'Approved',
        progress: 100,
      },
      'REJECTED': {
        color: '#ff4d4f',
        icon: <CloseCircleOutlined />,
        text: 'Rejected',
        progress: 100,
      },
      'PENDING': {
        color: '#faad14',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
        progress: 50,
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const statusInfo = getStatusInfo(request.request_status);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSoftClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Delay for fade-out effect
  };

  return (
    <Modal
      title={
        <Space size="middle" align="center">
          <Badge status={request.request_status === 'PENDING' ? 'processing' : 'default'} />
          <Text strong>Request #{request.id}</Text>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Space>
      }
      open={!isClosing}
      onCancel={handleSoftClose}
      width={800}
      footer={
        request?.request_status === 'PENDING' ? (
          <Space>
            <Button className={Globalstyle.ActionButton} icon={<CheckCircleOutlined />} onClick={() => onApprove(request.id)}>
              Approve
            </Button>
            <Button className={Globalstyle.DeleteButton} icon={<CloseCircleOutlined />} onClick={() => onReject(request.id)}>
              Reject
            </Button>
          </Space>
        ) : null
      }
      className={`modern-modal ${isClosing ? 'fade-out' : ''}`}
    >
      <div className="p-4 space-y-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <Progress
            percent={statusInfo.progress}
            status={request.request_status === 'REJECTED' ? 'exception' : 'active'}
            strokeColor={statusInfo.color}
            showInfo={false}
          />
        </div>

        {/* Requester Info Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <Row gutter={24} align="middle">
            <Col>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
            </Col>
            <Col flex="1">
              <Title level={4} className="m-0">{request.username}</Title>
              <Space>
                <Tag icon={<UserOutlined />}>{request.staff_id}</Tag>
                <Tag icon={<CalendarOutlined />}>
                  {formatDate(request.created_at)}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Statistic
                title="Request Status"
                value={statusInfo.text}
                valueStyle={{ color: statusInfo.color }}
                prefix={statusInfo.icon}
              />
            </Col>
          </Row>
        </Card>

        {/* Item Details */}
        <Card
          title={<Space><ShoppingCartOutlined /> Item Details</Space>}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Descriptions
            column={{ xs: 1, sm: 2, md: 2 }}
            bordered
            labelStyle={{ fontWeight: 'bold' }}
          >
            <Descriptions.Item label={<Space><TagOutlined /> Item Code</Space>}>
              <Text strong>{request.ItemCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              <Text strong className="text-lg">{request.quantity}</Text> units
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {request.description}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Request Timeline */}
        <Card style={{padding: '5px'}}
          title={<Space><InfoCircleOutlined /> Request Timeline</Space>}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Timeline
            style={{ padding: '25px' }}
            items={[
              {
                color: 'blue',
                dot: <CalendarOutlined />,
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>Request Submitted</Text>
                    <Text type="secondary">{formatDate(request.created_at)}</Text>
                    <Text>{request.description}</Text>
                  </Space>
                ),
              },
              request.comment && {
                color: 'purple',
                dot: <FileTextOutlined />,
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>Comment Added</Text>
                    <Text>{request.comment}</Text>
                  </Space>
                ),
              },
              {
                color: statusInfo.color,
                dot: statusInfo.icon,
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>Status Updated</Text>
                    <Text type="secondary">{formatDate(request.updated_at)}</Text>
                    <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                  </Space>
                ),
              },
            ].filter(Boolean)}
          />
        </Card>
      </div>

      <style jsx>{`
        .modern-modal.fade-out :global(.ant-modal-content) {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </Modal>
  );
};

export default RequestDetails;
