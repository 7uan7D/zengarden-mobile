import { Tabs } from "expo-router";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Hàm xử lý đăng xuất
const handleLogout = async () => {
  try {
    // Xóa token và refreshToken khỏi AsyncStorage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    
    // Điều hướng về màn hình login
    router.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
          height: 80,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          alignItems: "center",
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
          marginTop: -4,
          lineHeight: 10,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#333",
        tabBarIcon: () => null, // Ẩn icon
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={[styles.navSeparator, { bottom: insets.bottom }]} />
          </View>
        ),
        headerShown: false, // Tắt header nhóm (tabs)
        headerRight: () => (
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <LogOut color="#333" size={24} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="task"
        options={{
          title: "Task",
          headerShown: true,
          headerTitle: "Task",
          headerStyle: {
            backgroundColor: "#F5FDF7",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "600",
            color: "#333",
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#3b82f6" : "#333",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              Task
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          headerShown: true,
          headerTitle: "Notification",
          headerStyle: {
            backgroundColor: "#F5FDF7",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "600",
            color: "#333",
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#3b82f6" : "#333",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              Notification
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  navSeparator: {
    width: 1,
    backgroundColor: "#ccc",
    height: "60%",
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -0.5 }],
    zIndex: -1,
  },
  headerButton: {
    marginRight: 15,
  },
});