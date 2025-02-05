import router from './router';
import { ConfigProvider } from 'antd'; // 确保正确引入 antd 组件

import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';

function App() {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#4E71CF', // Change the primary color for buttons
            colorPrimaryHover: '#16223D', // Change the primary color for buttons when hover
          },
          components: {
            Button: {
              defaultBg: '#16223D',
              defaultBorderColor: '#16223D',
              defaultColor: '#FFFFFF',
              defaultHoverBg: '#4E71CF',
              defaultHoverBorderColor: '#4E71CF',
              defaultHoverColor: '#FFFFFF',
            },
            Input: {
              defaultBg: '#FFFFFF',
              defaultBorderColor: '#D9D9D9',
              defaultColor: '#000000',
              hoverBorderColor: '#000000',
              activeBorderColor: '#000000',
              activeShadow: '#000000',
            },
            Select: {
              defaultBg: '#FFFFFF',
              defaultBorderColor: '#D9D9D9',
              defaultColor: '#000000',
              hoverBorderColor: '#000000',
              activeBorderColor: '#000000',
              activeOutlineColor: 'rgba(0, 0, 0, 0)',
            },
            DatePicker: {
              defaultBorderColor: '#D9D9D9',
              defaultColor: '#000000',
              hoverBorderColor: '#000000',
              activeBorderColor: '#000000',
            },
            InputNumber: {
              activeBorderColor: '#000000',
              hoverBorderColor: '#000000',
              activeShadow: 'none',
            },
          },
        }}
      >
        <div className="App">
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
