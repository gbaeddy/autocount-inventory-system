import React from 'react';
import { Layout } from 'antd';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import LoginHeader from '../../components/commonHeader/loginHeader';
import CommonFooter from '../../components/commonFooter';
import style from './register.module.css'; // Reusing the same CSS as the login page for consistency

const { Content } = Layout;

const RegisterPage = () => {
  return (
    <Layout className={style.layout}>
      {/* Header */}
      <LoginHeader />

      {/* Content */}
      <Content className={style.content}>
        <RegisterForm />
      </Content>

      {/* Footer */}
      <CommonFooter />
    </Layout>
  );
};

export default RegisterPage;
