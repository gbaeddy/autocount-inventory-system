import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../contexts/AuthProvider';
import style from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, values, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        login(response.data.user);
        message.success('Login successful!');
        navigate('/home');
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.loginContainer}>
      <h1 className={style.login_title}>Welcome Back</h1>
      <Form form={form} className={style.loginForm} onFinish={handleSubmit}>
        <Form.Item
          name="staff_id"
          rules={[{ required: true, message: 'Please input your Staff ID!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Staff ID" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
        <div className={style.registerLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
