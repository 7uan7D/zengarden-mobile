import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Progress from "react-native-progress";

export default function TaskScreen() {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Item Tab Trigger bên trái */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.itemTrigger}>
          <Text style={styles.itemTriggerText}>🎒</Text>
        </TouchableOpacity>

        <View style={styles.clockWrapper}>
          <Text style={styles.timeText}>
            {displayHour}:{displayMinutes}
            <Text style={styles.ampmText}> {ampm}</Text>
          </Text>
        </View>

        <View style={styles.nameAvatarRow}>
          <Text style={styles.name}>Tuấn</Text>
          <View style={styles.avatarBlock}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.avatar}
            />
            <Text style={styles.level}>Lv 5</Text>
          </View>
        </View>
      </View>

      {/* Tree info */}
      <View style={styles.treeBox}>
        <Image
          source={{ uri: "https://via.placeholder.com/50" }}
          style={styles.treeImage}
        />
        <View style={styles.treeInfo}>
          <Text style={styles.treeName}>Maple Tree</Text>
          <Text style={styles.treeLevel}>Lv 3</Text>
          <Progress.Bar progress={0.6} width={null} color="#83aa6c" />
          <Text style={styles.equipItem}>Equip: Watering Can 🌱</Text>
        </View>
      </View>

      {/* Task sections */}
      <TouchableOpacity
        style={[styles.taskBox, { borderLeftColor: "#3b82f6" }]}
      >
        <Text style={styles.taskText}>Daily Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.taskBox, { borderLeftColor: "#10b981" }]}
      >
        <Text style={styles.taskText}>Simple Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.taskBox, { borderLeftColor: "#f44336" }]}
      >
        <Text style={styles.taskText}>Complex Tasks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5FDF7",
    flexGrow: 1,
    position: "relative",
  },

  clockContainer: {
    flex: 1, // để chiếm khoảng giữa và đẩy đều
    alignItems: "center",
  },
  clock: {
    fontSize: 18,
    fontWeight: "600",
    color: "#609994",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#609994",
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
  treeBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
  },
  treeImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  treeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  treeName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#4d705e",
  },
  treeLevel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  equipItem: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  taskBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
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
});
