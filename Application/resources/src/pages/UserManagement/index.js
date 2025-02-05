import React, { useState, useCallback } from 'react';
import { Breadcrumb, message } from 'antd';
import UserTable from './UserTable';
import UserForm from './UserForm';
import UserSearch from './UserSearch';
import axios from 'axios';
import styles from './UserManagement.module.css';
import Globalstyle from '../../App.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users', { params });
      setUsers(data.data);
      setPagination({
        ...pagination,
        current: data.current_page,
        total: data.total,
      });
    } catch (error) {
      message.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  const handleAdd = async (values) => {
    try {
      await api.post('/api/users', values);
      message.success('User added successfully');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to add user: ' + error.message);
    }
  };

  const handleEdit = async (values) => {
    try {
      await api.put(`/api/users/${editingUser.staff_id}`, values);
      message.success('User updated successfully');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user: ' + error.message);
    }
  };

  const handleDelete = async (staffId) => {
    try {
      await api.delete(`/api/users/${staffId}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user: ' + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>User Management</Breadcrumb.Item>
      </Breadcrumb>
      <h1>User Management</h1>
      <UserSearch onSearch={(params) => fetchUsers({ ...params, page: 1 })} />
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        onTableChange={(newPagination) => fetchUsers(newPagination)}
        onEdit={(user) => {
          setEditingUser(user);
          setIsModalVisible(true);
        }}
        onDelete={handleDelete}
      />
      <UserForm
        visible={isModalVisible}
        editingUser={editingUser}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
        }}
        onSubmit={(values) => {
          if (editingUser) {
            handleEdit(values);
          } else {
            handleAdd(values);
          }
        }}
      />
    </div>
  );
};

export default UserManagement;
