import React from 'react';
import { Layout } from 'antd';
const { Footer } = Layout;

const CommonFooter = () => {
  return (
    <Footer
      style={{
        textAlign: 'center',
      }}
    >
      ©{new Date().getFullYear()} Fourntec. All rights reserved.
    </Footer>
  );
};
export default CommonFooter;
