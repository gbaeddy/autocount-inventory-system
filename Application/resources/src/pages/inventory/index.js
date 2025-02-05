import React from 'react';

const Inventory = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      
      <Breadcrumb
        style={{
          margin: '16px 0',
        }}
      >
        <Breadcrumb.Item>Inventory</Breadcrumb.Item>
        {/* <Breadcrumb.Item>Option 2</Breadcrumb.Item> */}
        {/* <Breadcrumb.Item>Option 3</Breadcrumb.Item> */}
      </Breadcrumb>
      <h1>React Inventory</h1>
    </div>
  );
};
export default Inventory;
