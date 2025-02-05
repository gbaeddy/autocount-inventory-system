import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error data:', error.response.data);
    console.error('Error status:', error.response.status);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error request:', error.request);
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
    throw new Error('Error setting up the request');
  }
};

// const loginUser = async (credentials) => {
//   try {
//     const response = await axios.post('/api/login', credentials);
//     const token = response.data.token;
//     localStorage.setItem('token', token);
//     // Set up axios to use this token in future requests
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     return true;
//   } catch (error) {
//     console.error('Login failed:', error);
//     return false;
//   }
// };

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPendingUsers = async (search = '') => {
  try {
    const response = await api.get('/users/role/PENDING', { params: { search } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const approveUser = async (staffId) => {
  try {
    const response = await api.put(`/users/${staffId}/status`, { reg_status: 'APPROVED' });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const rejectUser = async (staffId) => {
  try {
    const response = await api.put(`/users/${staffId}/status`, { reg_status: 'REJECTED' });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
// Add more API functions here for other endpoints

export default api;
