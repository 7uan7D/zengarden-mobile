import { Tabs } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
          height: 80, // Tăng nhẹ để có chỗ cho padding
          paddingBottom: insets.bottom, // Thêm padding cho system navigation
          paddingTop: 5, // Cân đối dọc
          alignItems: "center",
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
          marginTop: -4, // Nâng chữ nhẹ
          lineHeight: 10, // Căn dọc
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
    zIndex: -1, // Không che label
  },
});