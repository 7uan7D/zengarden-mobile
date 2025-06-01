import axios from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

// 1. Lấy thông tin người dùng theo userId
export const getUserById = (userId) => {
  return axios.get(`/User/${userId}`);
};

// 2. Lấy danh sách thông báo của người dùng
export const getNotificationsByUserId = (userId) => {
  return axios.get(`/Notification/user/${userId}/notifications`);
};

// 3. Lấy task đang active của người dùng
export const getActiveTaskByUserId = (userId) => {
  return axios.get(`/Task/active/${userId}`);
};

// 4. Bắt đầu task theo taskId
export const startTaskById = async (taskId) => {
  const token = await getToken();
  return axios.post(`/Task/start-task/${taskId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const pauseTaskById = async (taskId) => {
  const token = await getToken();
  return axios.post(`/Task/pause/${taskId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const completeTaskById = async (taskId) => {
  const token = await getToken();
  return axios.post(`/Task/complete-task/${taskId}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
