import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { getUserById, getNotificationsByUserId } from "../config/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";

const notifications = [
  {
    id: 1,
    title: "Task Completed",
    message: "You have successfully completed 'Learn React Basics'!",
    timestamp: "2025-05-30T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Level Up",
    message: "Congratulations! Your tree has reached Level 4!",
    timestamp: "2025-05-30T08:30:00.000Z",
  },
  {
    id: 3,
    title: "Reminder",
    message: "Don't forget to start your next task today!",
    timestamp: "2025-05-30T07:45:00.000Z",
  },
];

export default function NotificationScreen() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const isPM = hours >= 12;

  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const ampm = isPM ? "PM" : "AM";

  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub; // userId nằm trong sub
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      try {
        const resUser = await getUserById(userId);
        setUser(resUser.data);

        const resNoti = await getNotificationsByUserId(userId);
        setNotifications(resNoti.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      {user && user.userConfig && (
        <ImageBackground
          source={{ uri: user.userConfig?.backgroundConfig }}
          style={styles.mainContainer}
          resizeMode="cover"
        >
          <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.notificationList}>
                {notifications.length === 0 ? (
                  <Text style={styles.noNotificationText}>
                    Không có thông báo
                  </Text>
                ) : (
                  notifications.map((notification) => (
                    <View
                      key={notification.notificationId}
                      style={styles.notificationCard}
                    >
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.content}
                      </Text>
                      <Text style={styles.notificationTimestamp}>
                        {formatTimestamp(notification.createdAt)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </ImageBackground>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  nameAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#609994",
  },
  avatarBlock: {
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  level: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  itemTrigger: {
    width: 40,
    height: 40,
    backgroundColor: "#83aa6c",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTriggerText: {
    fontSize: 20,
    color: "#fff",
  },
  clockWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    position: "relative",
  },
  ampmText: {
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    top: 6,
    right: -40,
    color: "#333",
  },
  notificationList: {
    flexDirection: "column",
    gap: 10,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
  },
});
