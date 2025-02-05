import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/ProtectedRoute';
import Login from './pages/login';
import Register from './pages/Register';
import Home from './pages/home';
import UserManagement from './pages/UserManagement';
import UserApproval from './pages/UserApproval';
import InventoryManagement from './pages/InventoryManagement';
import ActivityLog from './pages/ActivityLog';
import Unauthorized from './components/Unauthorized';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<PrivateRoute allowedRoles={['ADMIN', 'OFFICE_STAFF', 'SALESPERSON']} />}>
        <Route path="/home" element={<Home />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['ADMIN', 'OFFICE_STAFF']} />}>
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/user-approval" element={<UserApproval />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['ADMIN', 'OFFICE_STAFF', 'SALESPERSON']} />}>
        <Route path="/inventory-management" element={<InventoryManagement />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
        <Route path="/activity-log" element={<ActivityLog />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
