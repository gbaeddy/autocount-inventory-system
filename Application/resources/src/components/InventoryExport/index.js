import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Form, InputNumber, Space, message, Tooltip, ConfigProvider } from 'antd';
import { DownloadOutlined, SettingOutlined, FileExcelOutlined, LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

const ExportButton = ({ defaultThreshold = 10 }) => {
  const [loading, setLoading] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [form] = Form.useForm();

  const handleExport = async (threshold = defaultThreshold) => {
    setLoading(true);
    try {
      const response = await api.get('/inventory/export-low-stock', {
        params: { threshold },
        responseType: 'blob', // Important for file download
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date/time
      const filename = `low_stock_report_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.csv`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Export successful!');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export data');
    } finally {
      setLoading(false);
      setConfigVisible(false);
    }
  };

  const handleConfiguredExport = async () => {
    try {
      const values = await form.validateFields();
      handleExport(values.threshold);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: 'Quick Export (≤10 units)',
          icon: <FileExcelOutlined />,
          onClick: () => handleExport(10),
        },
        {
          key: '2',
          label: 'Quick Export (≤5 units)',
          icon: <FileExcelOutlined />,
          onClick: () => handleExport(5),
        },
        {
          key: '3',
          label: 'Configure Export...',
          icon: <SettingOutlined />,
          onClick: () => setConfigVisible(true),
        },
      ]}
    />
  );

  return (
    <>
      <ConfigProvider
        theme={{
          Component: {
            Dropdown: {
              defaultBg: '#FFFFFF',
              defaultBorderColor: '#FFFFFF',
              defaultColor: '#000000',
              hoverBg: '#FFFFFF',
              hoverBorderColor: '#000000',
              hoverColor: '#000000',
            },
          },
        }}
      >
        <Dropdown.Button
          overlay={menu}
          loading={loading}
          type="primary"
          icon={loading ? <LoadingOutlined /> : <DownloadOutlined />}
          onClick={() => handleExport(defaultThreshold)}
        >
          Export Low Stock
        </Dropdown.Button>

        <Modal
          title="Configure Export"
          open={configVisible}
          onCancel={() => setConfigVisible(false)}
          onOk={handleConfiguredExport}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" initialValues={{ threshold: defaultThreshold }}>
            <Form.Item
              name="threshold"
              label="Stock Threshold"
              rules={[
                { required: true, message: 'Please set a threshold value' },
                { type: 'number', min: 1, message: 'Threshold must be at least 1' },
              ]}
              help="Export items with stock level at or below this value"
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </ConfigProvider>
    </>
  );
};

// Example of how to implement this in a button group
const ExportButtonGroup = () => {
  return (
    <Space>
      <Tooltip title="Export items below threshold">
        <ExportButton />
      </Tooltip>
    </Space>
  );
};

export default ExportButton;
export { ExportButtonGroup };
