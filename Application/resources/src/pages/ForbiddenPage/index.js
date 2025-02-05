import React from 'react';
import { Button, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './ForbiddenPage.module.css';

const { Title, Paragraph } = Typography;

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.forbiddenContainer}>
      <div className={styles.forbiddenContent}>
        <LockOutlined className={styles.forbiddenIcon} />
        <Title level={2} className={styles.forbiddenTitle}>
          Access Denied
        </Title>
        <Space direction="vertical" size="large" className={styles.forbiddenMessage}>
          <Paragraph>
            Sorry, you don't have permission to access this page.
          </Paragraph>
          <Paragraph>
            If you believe this is an error, please contact your system administrator.
          </Paragraph>
        </Space>
        <Space size="middle" className={styles.actionButtons}>
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
            Back to Home
          </Button>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Space>
      </div>
    </div>
  );
};

export default ForbiddenPage;
