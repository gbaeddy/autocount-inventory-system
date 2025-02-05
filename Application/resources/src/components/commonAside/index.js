import React, { useState, useEffect } from 'react';
import * as Icon from '@ant-design/icons';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import logo from '../../assets/FourntecLogo.png';
import { Layout, Menu, ConfigProvider, Button } from 'antd';
import style from './Aside.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthProvider';

const { Sider } = Layout;

const iconToElement = name => React.createElement(Icon[name]);

const CommonAside = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthContext();
  // for mobile screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileNow = window.innerWidth <= 768;
      setIsMobile(isMobileNow);
      if (isMobileNow) {
        setCollapsed(true); // Keep collapsed on mobile
        setIsMenuVisible(false); // Hide menu by default on mobile
      }
    };

    const debouncedCheckMobile = debounce(checkMobile, 200);
    window.addEventListener('resize', debouncedCheckMobile);
    return () => window.removeEventListener('resize', debouncedCheckMobile);
  }, []);

  const toggleMenu = () => {
    if (isMobile) {
      setIsMenuVisible(!isMenuVisible);
      setCollapsed(true);
    }
  };

  // Define common menu items for all users
  const commonItems = [
    {
      key: '/home',
      icon: 'HomeOutlined',
      label: 'Home',
    },
    {
      key: '/notifications',
      icon: 'BellOutlined',
      label: 'Notifications',
    },
  ];

  // Define menu items for different roles
  const adminItems = [
    {
      key: '/user',
      icon: 'UserOutlined',
      label: 'User',
      children: [
        {
          key: '/user/approval',
          label: 'User Approval',
        },
        {
          key: '/user/management',
          label: 'User Management',
        },
      ],
    },
    // Only show inventory items for approved users
    ...(user.reg_status === 'APPROVED'
      ? [
          {
            key: '/inventory',
            icon: 'ShoppingOutlined',
            label: 'Inventory',
            children: [
              {
                key: '/inventory/request',
                label: 'Inventory Request',
              },
              {
                key: '/inventory/operation',
                label: 'Inventory Operation',
              },
              {
                key: '/inventory/level',
                label: 'Inventory Level',
              },
            ],
          },
        ]
      : []),
    {
      key: '/activity',
      icon: 'FileOutlined',
      label: 'Activity Log',
    },
  ];

  const officeStaffItems = [
    // Only show inventory items for approved users
    ...(user.reg_status === 'APPROVED'
      ? [
          {
            key: '/inventory',
            icon: 'ShoppingOutlined',
            label: 'Inventory',
            children: [
              {
                key: '/inventory/request',
                label: 'Inventory Request',
              },
              {
                key: '/inventory/operation',
                label: 'Inventory Operation',
              },
              {
                key: '/inventory/level',
                label: 'Inventory Level',
              },
            ],
          },
        ]
      : []),
  ];

  const salespersonItems = [
    // Only show inventory items for approved users
    ...(user.reg_status === 'APPROVED'
      ? [
          {
            key: '/inventory',
            icon: 'ShoppingOutlined',
            label: 'Inventory',
            children: [
              {
                key: '/inventory/request',
                label: 'Inventory Request',
              },
              {
                key: '/inventory/level',
                label: 'Inventory Level',
              },
            ],
          },
        ]
      : []),
  ];

  // Get menu items based on user role
  const getMenuItems = () => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          return [...commonItems, ...adminItems];
        case 'OFFICE_STAFF':
          return [...commonItems, ...officeStaffItems];
        case 'SALESPERSON':
          return [...commonItems, ...salespersonItems];
        default:
          return commonItems;
      }
    }
    return commonItems;
  };

  const items = getMenuItems().map(item => {
    const menuItem = {
      key: item.key,
      icon: iconToElement(item.icon),
      label: item.label,
    };

    if (item.children) {
      menuItem.children = item.children.map(child => ({
        key: child.key,
        label: child.label,
      }));
    }

    return menuItem;
  });

  const selectMenu = ({ key }) => {
    navigate(key);
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <>
      {isMobile && (
        <Button
          className={`${style['menuButton']} ${isMenuVisible ? style['menuButtonOpen'] : style['menuButtonClosed']}`}
          onClick={toggleMenu}
          icon={isMenuVisible ? <MenuFoldOutlined style={{ color: '#FFFFFF' }} /> : <MenuUnfoldOutlined style={{ color: '#FFFFFF' }} />}
        />
      )}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99,
          display: isMobile && isMenuVisible ? 'block' : 'none',
        }}
        onClick={toggleMenu}
      />
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              darkItemSelectedBg: '#4E71CF',
              darkSubMenuItemBg: '#101627',
            },
            Layout: {
              triggerBg: '#101627',
            },
          },
        }}
      >
        <Sider
          collapsible={!isMobile}
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
          className={style.Sider}
          style={{
            width: isMobile ? '100%' : '250px',
            position: isMobile ? 'fixed' : 'sticky',
            left: isMobile ? (isMenuVisible ? 0 : '-100%') : 0,
            zIndex: 100,
          }}
        >
          <div
            className={style.Logo}
            style={{
              height: '15%',
              margin: '16px',
              textAlign: 'center',
              color: 'white',
            }}
          >
            {collapsed ? (
              <img src={logo} style={{ width: '50px', height: '50px', marginTop: '1vh' }} alt="Logo" onClick={handleLogoClick} />
            ) : (
              <img src={logo} style={{ width: '90px', height: '90px', marginTop: '1vh' }} alt="Logo" onClick={handleLogoClick} />
            )}
          </div>
          <Menu
        theme="dark"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={items}
        className={style.Menu}
        onClick={selectMenu}
        />
        </Sider>
      </ConfigProvider>
    </>
  );
};

export default CommonAside;
