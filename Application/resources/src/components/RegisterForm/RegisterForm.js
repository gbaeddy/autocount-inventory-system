import React, { useState } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './RegisterForm.module.css';

const { Option } = Select;

const RegisterForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Staff ID validation rule
  const validateStaffId = async (_, value) => {
    if (!value) {
      return Promise.reject('Please input your Staff ID!');
    }

    if (value.startsWith('0')) {
      return Promise.reject('Staff ID cannot start with 0');
    }

    // Only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return Promise.reject('Staff ID can only contain letters and numbers');
    }

    if (value.length < 4) {
      return Promise.reject('Staff ID must be at least 4 characters long');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-staff-id`,
        { staff_id: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This Staff ID is already in use');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking Staff ID availability');
    }
  };

  // Username validation rule
  const validateUsername = async (_, value) => {
    if (!value) {
      return Promise.reject('Please input your username!');
    }

    // Username format validation
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return Promise.reject('Username can only contain letters, numbers, and underscores');
    }

    if (value.length < 3) {
      return Promise.reject('Username must be at least 3 characters long');
    }

    // Check if username exists
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-username`,
        { username: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This Username is already in use');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking Username availability');
    }
  };

  // Email validation rule
  const validateEmail = async (_, value) => {
    if (!value) {
      return Promise.reject('Please input your email');
    }

    // Strict email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return Promise.reject('Please enter a valid email address!');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/check-email`,
        { email: value },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.exists) {
        return Promise.reject('This email is already registered');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Error checking email availability');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, values, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.status === 201) {
        message.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const errorMessages = error.response.data.errors;
        Object.keys(errorMessages).forEach(field => {
          form.setFields([{
            name: field,
            errors: [errorMessages[field][0]]
          }]);
        });
      } else {
        message.error(error.response?.data?.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.registerContainer}>
      <h1 className={style.register_title}>Create an Account</h1>
      <Form form={form} onFinish={handleSubmit} className={style.registerForm}>
        <Form.Item
          name="staff_id"
          validateTrigger={['onBlur', 'onChange']}
          rules={[
            { validator: validateStaffId }
          ]}
          hasFeedback
        >
          <Input
            prefix={<IdcardOutlined />}
            placeholder="Staff ID"
            maxLength={20}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').replace(/^0+/, '');
            }}
          />
        </Form.Item>

        <Form.Item
          name="username"
          validateTrigger={['onBlur', 'onChange']}
          rules={[
            { validator: validateUsername }
          ]}
          hasFeedback
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            maxLength={30}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          validateTrigger={['onBlur', 'onChange']}
          rules={[
            { validator: validateEmail }
          ]}
          hasFeedback
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="password"
          validateTrigger={['onBlur', 'onChange']}
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters long' },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="password_confirmation"
          validateTrigger={['onBlur', 'onChange']}
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="role"
          validateTrigger={['onBlur', 'onChange']}
          rules={[{ required: true, message: 'Please select your role!' }]}
          hasFeedback
        >
          <Select placeholder="Select your role">
            <Option value="SALESPERSON">Salesperson</Option>
            <Option value="OFFICE_STAFF">Office Staff</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
      <div className={style.loginLink}>
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
