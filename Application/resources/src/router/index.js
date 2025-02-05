import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthContext } from '../contexts/AuthProvider';

// Lazy load components
const Main = lazy(() => import('../pages/main'));
const Home = lazy(() => import('../pages/home'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const Activity = lazy(() => import('../pages/activity'));
const InventoryRequest = lazy(() => import('../pages/inventory/InventoryRequest'));
const InventoryRequestAdmin = lazy(() => import('../pages/inventory/InventoryRequestAdmin'));
const InventoryOperation = lazy(() => import('../pages/inventory/InventoryOperation'));
const InventoryLevel = lazy(() => import('../pages/inventory/InventoryLevel'));
const UserApproval = lazy(() => import('../pages/UserManagement/UserApproval'));
const UserManagement = lazy(() => import('../pages/UserManagement/UserManagement'));
const Login = lazy(() => import('../pages/login'));
const Register = lazy(() => import('../pages/register'));
const RejectedPage = lazy(() => import('../pages/RejectedPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const RoleBasedInventoryRequest = () => {
    const { user } = useAuthContext();
    return user.role === 'ADMIN' || user.role === 'OFFICE_STAFF' ?
           <InventoryRequestAdmin /> :
           <InventoryRequest />;
};

const routes = [
    {
      path: '/',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute allowedRoles={['ADMIN', 'SALESPERSON', 'OFFICE_STAFF']} allowPending={true}>
            <Main />
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        {
          path: '/',
          element: <Navigate to="/home" replace />,
        },
        {
          path: 'home',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute allowedRoles={['ADMIN', 'SALESPERSON', 'OFFICE_STAFF']} allowPending={true}>
                <Home />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        {
            path: 'notifications',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute allowedRoles={['ADMIN', 'SALESPERSON', 'OFFICE_STAFF']}>
                  <NotificationsPage />
                </ProtectedRoute>
              </Suspense>
            ),
        },
        {
            path: 'inventory',
            children: [
              {
                path: 'request',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProtectedRoute allowedRoles={['ADMIN', 'SALESPERSON', 'OFFICE_STAFF']} requireApproved={true}>
               <RoleBasedInventoryRequest />
                     </ProtectedRoute>,
                  </Suspense>
                ),
              },
              {
                path: 'operation',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICE_STAFF']} requireApproved={true}>
                      <InventoryOperation />
                    </ProtectedRoute>
                  </Suspense>
                ),
              },
              {
                path: 'level',
                element: (
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProtectedRoute allowedRoles={['ADMIN', 'SALESPERSON', 'OFFICE_STAFF']} requireApproved={true}>
                      <InventoryLevel />
                    </ProtectedRoute>
                  </Suspense>
              ),
            },
          ],
        },
        {
          path: 'user',
          children: [
            {
              path: 'approval',
              element: (
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserApproval />
                  </ProtectedRoute>
                </Suspense>
              ),
            },
            {
              path: 'management',
              element: (
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                </Suspense>
              ),
            },
          ],
        },
        {
          path: 'activity',
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Activity />
              </ProtectedRoute>
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: '/register',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: '/rejected',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <RejectedPage />
        </Suspense>
      ),
    },
    {
      path: '/unauthorized',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ForbiddenPage />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <NotFound />
        </Suspense>
      ),
    },
  ];

  export default createBrowserRouter(routes);
