const MenuConfig = [
  {
    path: '/home',
    name: 'Home',
    label: 'Home',
    icon: 'HomeOutlined', // Updated with direct import
    url: '/home/index',
  },
  {
    path: '/user',
    name: 'User',
    label: 'User',
    icon: 'TeamOutlined', // Updated with direct import
    children: [
      {
        path: '/userApproval',
        name: 'Approval',
        label: 'Approval',
        url: '/approval/index',
      },
      {
        path: '/userManagement',
        name: 'Management',
        label: 'Management',
        url: '/management/index',
      },
    ],
  },
  {
    path: '/inventory',
    name: 'Inventory',
    label: 'Inventory',
    icon: 'DesktopOutlined', // Updated with direct import
    children: [
      {
        path: '/InventoryRequest',
        name: 'Request',
        label: 'Request',
        url: '/InventoryRequest/index',
      },
      {
        path: '/InventoryOperation',
        name: 'Operation',
        label: 'Operation',
        url: '/inventoryOperation/index',
      },
      {
        path: '/inventoryLevel',
        name: 'Level',
        label: 'Level',
        url: '/inventoryLevel/index',
      },
    ],
  },
  {
    path: '/activity',
    name: 'Activity Log',
    label: 'Activity Log',
    icon: 'HistoryOutlined', // Updated with direct import
    url: '/activity',
  },
];
export default MenuConfig;
