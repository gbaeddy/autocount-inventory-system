import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, GithubOutlined } from '@ant-design/icons';
import LoginForm from '../../components/LoginForm';
import LoginHeader from '../../components/commonHeader/loginHeader';
import style from './login.module.css';

const { Content, Footer } = Layout;
const { Text, Link } = Typography;

const CompactFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{ background: '#18223e', padding: '16px 24px', color: '#fff' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px' }}>
            © {currentYear} Fourntec. All rights reserved.
          </Text>
        </Col>
        <Col>
          <Space size="middle">
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
              <FacebookOutlined />
            </Link>
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
              <TwitterOutlined />
            </Link>
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
              <InstagramOutlined />
            </Link>
            <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '18px' }}>
              <GithubOutlined />
            </Link>
          </Space>
        </Col>
      </Row>
    </Footer>
  );
};

const LoginPage = () => {
  return (
    <Layout className={style.layout}>
      <LoginHeader />
      <Content className={style.content}>
        <LoginForm />
      </Content>
      <CompactFooter />
    </Layout>
  );
};

export default LoginPage;
