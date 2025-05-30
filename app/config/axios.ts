// app/config/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://zengarden-api-bmhbarbtcwc0dffg.southeastasia-01.azurewebsites.net/api", // đổi thành URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
