import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import Globalstyle from '../../App.module.css';

const { Option } = Select;

const UserForm = ({ open, editingUser, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const isEditing = !!editingUser;

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editingUser) {
        form.setFieldsValue(editingUser);
      }
    }
  }, [open, editingUser, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit User" : "Add User"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={isEditing ? "Save Changes" : "Add User"}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ role: 'SALESPERSON', reg_status: 'PENDING' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="staff_id"
              label="Staff ID"
              rules={[
                { required: true, message: 'Please input the Staff ID!' },
                { min: 3, message: 'Staff ID must be at least 3 characters.' }
              ]}
            >
              <Input disabled={isEditing} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input the username!' },
                { min: 3, message: 'Username must be at least 3 characters.' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input the email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>
        {!isEditing && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input the password!' },
              { min: 6, message: 'Password must be at least 6 characters.' }
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}>
              <Select>
                <Option value="ADMIN">Admin</Option>
                <Option value="SALESPERSON">Salesperson</Option>
                <Option value="OFFICE_STAFF">Office Staff</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="reg_status" label="Status" rules={[{ required: true, message: 'Please select a status!' }]}>
              <Select>
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="REJECTED">Rejected</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserForm;
