import React from 'react';
import { Button, Typography, Space, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './NotFound.module.css';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const NotFound = () => {
  const navigate = useNavigate();

  const onSearch = (value) => {
    // Implement your search logic here
    console.log('Search:', value);
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.notFoundImage}>404</div>
        <Title level={2} className={styles.notFoundTitle}>
          Oops! Page Not Found
        </Title>
        <Space direction="vertical" size="large" className={styles.notFoundMessage}>
          <Paragraph>
            The page you're looking for doesn't exist or has been moved.
          </Paragraph>
          <Search
            placeholder="Try searching for content"
            onSearch={onSearch}
            enterButton={<SearchOutlined />}
            className={styles.searchInput}
          />
        </Space>
        <Space size="middle" className={styles.actionButtons}>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/home')}>
            Back to Home
          </Button>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Space>
      </div>
    </div>
  );
};

export default NotFound;
