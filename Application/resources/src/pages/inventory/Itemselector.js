import React, { useState, useEffect } from 'react';
import { Select, Space, Typography, Tag, Spin, Empty, Alert } from 'antd';
import debounce from 'lodash/debounce';
import api from '../../services/api';

const { Text } = Typography;
const { Option } = Select;

const ItemSelector = ({ value, onChange, disabled = false }) => {
  const [loading] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [stockSettings, setStockSettings] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize data with proper sequence
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      try {
        // First fetch stock settings
        const settingsResponse = await api.get('/stock-settings');
        if (!settingsResponse.data) {
          throw new Error('Failed to load stock settings');
        }
        setStockSettings(settingsResponse.data);

        // Then fetch items
        const itemsResponse = await api.get('/items', {
          params: {
            per_page: 9999,
            IsActive: 'T'
          }
        });

        if (!itemsResponse.data) {
          throw new Error('Failed to load items');
        }

        const items = itemsResponse.data.data
          .filter(item => item.IsActive === 'T')
          .map(item => ({
            ...item,
            BalQty: parseFloat(item.BalQty)
          }));

        setAllItems(items);
        setOptions(items);

      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, []);

  const getStockStatus = (qty) => {
    if (!stockSettings) return { color: 'success', text: 'Healthy' };

    const quantity = parseFloat(qty);
    if (quantity <= stockSettings.critical_threshold) {
      return { color: 'error', text: 'Critical' };
    }
    if (quantity <= stockSettings.low_threshold) {
      return { color: 'warning', text: 'Low' };
    }
    return { color: 'success', text: 'Healthy' };
  };

  const handleSearch = debounce((searchText) => {
    if (!searchText) {
      setOptions(allItems);
      setSearchMode(false);
      return;
    }

    setSearchMode(true);
    const filteredItems = allItems.filter(item =>
      item.ItemCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.Description.toLowerCase().includes(searchText.toLowerCase())
    );
    setOptions(filteredItems);
  }, 300);

  const handleChange = (selectedValue) => {
    onChange?.(selectedValue);
  };

  const renderOption = (item) => {
    const stockStatus = getStockStatus(item.BalQty);
    return (
      <Option
        key={item.ItemCode}
        value={item.ItemCode}
        label={`${item.ItemCode} ${item.Description}`}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 0'
        }}>
          <Space>
            <Text strong style={{ minWidth: '80px' }}>{item.ItemCode}</Text>
            <Text>{item.Description}</Text>
          </Space>
          <Space style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Available: {item.BalQty.toFixed(2)} units
            </Text>
            <Tag color={stockStatus.color}>
              {stockStatus.text}
            </Tag>
          </Space>
        </div>
      </Option>
    );
  };

  if (initialLoading) {
    return <Spin size="large" />;
  }

  return (
    <>
      <Select
        showSearch
        value={value}
        placeholder="Search or select an item..."
        defaultActiveFirstOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        notFoundContent={loading ? <Spin size="small" /> : <Empty description="No items found" />}
        style={{ width: '100%' }}
        disabled={disabled}
        loading={loading}
        filterOption={false}
        optionLabelProp="label"
        listHeight={350}
        onClear={() => {
          setSearchMode(false);
          setOptions(allItems);
          onChange?.(undefined);
        }}
        allowClear
      >
        {!searchMode && options.length > 0 && (
          <Option disabled key="header" className="select-header">
            <Text strong>Available Items</Text>
          </Option>
        )}
        {options.map(renderOption)}
      </Select>

      {value && options.find(item => item.ItemCode === value) && (
        <div style={{ marginTop: 8 }}>
          <Alert
            message={
              <Space direction="vertical" size={0}>
                <Space>
                  <Text>Available Quantity: </Text>
                  <Text strong>
                    {options.find(item => item.ItemCode === value)?.BalQty.toFixed(2)}
                  </Text>
                </Space>
                <Space>
                  <Text>Status: </Text>
                  {stockSettings && (
                    <Tag color={getStockStatus(
                      options.find(item => item.ItemCode === value)?.BalQty
                    ).color}>
                      {getStockStatus(
                        options.find(item => item.ItemCode === value)?.BalQty
                      ).text}
                    </Tag>
                  )}
                </Space>
              </Space>
            }
            type="info"
            showIcon
          />
        </div>
      )}
    </>
  );
};

export default ItemSelector;
