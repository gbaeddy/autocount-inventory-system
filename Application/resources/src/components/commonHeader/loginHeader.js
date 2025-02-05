import React, { useState, useEffect } from 'react';
import { Layout, Space } from 'antd';
import logo from '../../assets/FourntecLogo.png';
import styles from './header.module.css';

const { Header } = Layout;

const LoginHeader = () => {
  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
    const checkScreenHeight = () => {
      setIsShortScreen(window.innerWidth < 768);
    };

    checkScreenHeight();
    window.addEventListener('resize', checkScreenHeight);

    return () => window.removeEventListener('resize', checkScreenHeight);
  }, []);

  return (
    <Header className={styles.header}>
      <Space align="center">
        <img
          src={logo}
          alt="Fourntec Logo"
          className={styles.headerLogo}
        />
        <h1 className={styles.headerTitle}>
          {isShortScreen ? 'Fourntec' : 'Fourntec Inventory Management System'}
        </h1>
      </Space>
    </Header>
  );
};

export default LoginHeader;
