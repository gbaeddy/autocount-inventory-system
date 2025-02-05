import React, { useState, useEffect } from 'react';
import {
  Card, Radio, Space, Tag, Table,
  Tooltip, Button, Alert, Badge,
  Progress, Row, Col, Typography
} from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import ExportButton from '../../components/InventoryExport';

const { Text } = Typography;

const LowStockMonitor = ({
  data,
  loading,
  onRefresh,
  stockSettings,
  lowStockViewMode,
  setLowStockViewMode
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStockLevel = qty => {
    if (!stockSettings) return { color: '#52c41a', text: 'Loading...', severity: 0 };

    const quantity = parseFloat(qty);
    if (quantity <= stockSettings.critical_threshold)
      return { color: '#ff4d4f', text: 'Critical', severity: 3 };
    if (quantity <= stockSettings.low_threshold)
      return { color: '#ffa940', text: 'Low', severity: 2 };
    return { color: '#52c41a', text: 'Healthy', severity: 1 };
  };

  const columns = [
    {
      title: 'Item',
      key: 'item',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Badge dot color={getStockLevel(record.BalQty).color} style={{ marginRight: 8 }} />
            <Text strong>{record.ItemCode}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.Description}
          </Text>
        </Space>
      ),
      width: '30%',
    },
    {
      title: 'Current Stock',
      key: 'stock',
      render: (_, record) => {
        const status = getStockLevel(record.BalQty);
        const percentage = (parseFloat(record.BalQty) / stockSettings.healthy_threshold) * 100;

        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Text strong>{parseFloat(record.BalQty).toFixed(2)}</Text>
              <Tag color={status.color}>{status.text}</Tag>
            </Space>
            <Progress percent={percentage} size="small" strokeColor={status.color} showInfo={false} />
          </Space>
        );
      },
      width: '30%',
    },
    {
      title: 'Group',
      dataIndex: 'ItemGroup',
      width: '20%',
    },
    {
      title: 'Type',
      dataIndex: 'ItemType',
      render: type => type || '-',
      width: '20%',
    },
  ];

  const renderGrid = () => (
    <Row gutter={[16, 16]}>
      {data.map(item => (
        <Col xs={24} sm={12} md={8} lg={6} key={item.ItemCode}>
          <Card size="small" hoverable>
            <Badge.Ribbon
              text={getStockLevel(item.BalQty).text}
              color={getStockLevel(item.BalQty).color}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>{item.ItemCode}</Text>
                <Text type="secondary" ellipsis>
                  {item.Description}
                </Text>
                <Progress
                  type="circle"
                  percent={stockSettings ?
                    Math.min((parseFloat(item.BalQty) / stockSettings.healthy_threshold) * 100, 100) : 0}
                  width={80}
                  strokeColor={getStockLevel(item.BalQty).color}
                  format={() => <Text strong>{parseFloat(item.BalQty).toFixed(2)}</Text>}
                />
              </Space>
            </Badge.Ribbon>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderContent = () => {
    if (data.length === 0) {
      return (
        <Alert
          message="No Low Stock Items"
          description={`All items are currently above the critical threshold (${stockSettings?.critical_threshold} units).`}
          type="success"
          showIcon
        />
      );
    }

    return (
      <>
        <Alert
          message={`${data.filter(item =>
            stockSettings && parseFloat(item.BalQty) <= stockSettings.critical_threshold
          ).length} items are at critical stock level`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        {lowStockViewMode === 'list' ? (
          <Table
            scroll={{ y: 240, x: 'max-content' }}
            columns={columns}
            dataSource={data}
            rowKey="ItemCode"
            pagination={false}
            loading={loading}
          />
        ) : (
          renderGrid()
        )}
      </>
    );
  };

  return (
    <Card
      title={
        <div style={{
          display: 'flex',
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          justifyContent: windowWidth <= 768 ? 'center' : 'space-between',
          alignItems: windowWidth <= 768 ? 'center' : 'flex-start',
          gap: windowWidth <= 768 ? '16px' : '0',
          width: '100%'
        }}>
          <Space align="center">
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            <span>Low Stock Items</span>
            <Badge count={data.length} style={{ backgroundColor: '#ff4d4f' }} />
          </Space>

          <Space wrap style={{ justifyContent: windowWidth <= 768 ? 'center' : 'flex-end' }}>
            <Radio.Group
              value={lowStockViewMode}
              onChange={e => setLowStockViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="list">List</Radio.Button>
              <Radio.Button value="grid">Grid</Radio.Button>
            </Radio.Group>
            <Button
              className="action-button"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            />
            <Tooltip title="Export">
              <ExportButton />
            </Tooltip>
          </Space>
        </div>
      }
    >
      {renderContent()}
    </Card>
  );
};

export default LowStockMonitor;
