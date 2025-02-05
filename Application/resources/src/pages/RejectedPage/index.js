import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const RejectedPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="error"
      title="Application Rejected"
      subTitle="Your application has been rejected. Please contact the administrator for more information."
      extra={[
        <Button key="console" onClick={() => navigate('/login')}>
          Back to Login
        </Button>,
      ]}
    />
  );
};

export default RejectedPage;
