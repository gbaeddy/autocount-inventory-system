import React from 'react';
import { Modal, Form, InputNumber, Button, Alert, Space } from 'antd';
import { SettingOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';

const StockSettingsForm = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  form
}) => {
  const validateCriticalThreshold = (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    const { low_threshold } = form.getFieldsValue(['low_threshold']);

    if (low_threshold != null && value >= low_threshold) {
      return Promise.reject('Critical threshold must be less than Low threshold');
    }
    return Promise.resolve();
  };

  const validateLowThreshold = (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    const { critical_threshold, healthy_threshold } = form.getFieldsValue([
      'critical_threshold',
      'healthy_threshold'
    ]);

    if (critical_threshold != null && value <= critical_threshold) {
      return Promise.reject('Low threshold must be greater than Critical threshold');
    }

    if (healthy_threshold != null && value > healthy_threshold) {
      return Promise.reject('Low threshold must be less than Healthy threshold');
    }

    return Promise.resolve();
  };

  const validateHealthyThreshold = (_, value) => {
    if (value === undefined || value === null) return Promise.resolve();
    const { low_threshold } = form.getFieldsValue(['low_threshold']);

    if (low_threshold != null && value < low_threshold) {
      return Promise.reject('Healthy threshold must be greater than Low threshold');
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          Configure Stock Level Thresholds
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="reset"
          icon={<UndoOutlined />}
          onClick={() => form.resetFields()}
        >
          Reset
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          Save Changes
        </Button>
      ]}
      width={600}
    >
      <Alert
        message="Note"
        description="These settings will affect stock level indicators for all users in the system."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="critical_threshold"
          label="Critical Stock Level Threshold"
          rules={[
            { required: true, message: 'Please set critical threshold' },
            { validator: validateCriticalThreshold }
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="low_threshold"
          label="Low Stock Level Threshold"
          rules={[
            { required: true, message: 'Please set low threshold' },
            { validator: validateLowThreshold }
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="healthy_threshold"
          label="Healthy Stock Level Threshold"
          rules={[
            { required: true, message: 'Please set healthy threshold' },
            { validator: validateHealthyThreshold }
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockSettingsForm;
