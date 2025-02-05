import React from 'react';
import { Layout, Flex } from 'antd';
import CommonAside from '../components/commonAside/index.js';
import CommonHeader from '../components/commonHeader/index.js';
import CommonFooter from '../components/commonFooter/index.js';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const Main = () => {
  return (
    <Flex gap="middle" wrap>
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        <CommonAside />
        <Layout>
          <CommonHeader />
          <Content>
            <Outlet />
          </Content>
          <CommonFooter />
        </Layout>
      </Layout>
    </Flex>
  );
};

export default Main;
