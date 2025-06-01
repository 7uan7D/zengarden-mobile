import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { getActiveTaskByUserId } from "../config/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";
import {
  startTaskById,
  pauseTaskById,
  completeTaskById,
} from "../config/services";
import { getUserById } from "../config/services"; // hoặc đường dẫn đúng của bạn

// Component chính hiển thị màn hình quản lý nhiệm vụ
export default function TaskScreen() {
  // State để lưu thời gian hiện tại, cập nhật mỗi giây
  const [time, setTime] = useState(new Date());
  // State để lưu trạng thái nhiệm vụ: 0 (Not Started), 1 (On-going), 2 (Paused), 3 (Completed)
  const [taskStatus, setTaskStatus] = useState(0);
  // State để lưu thời gian còn lại của nhiệm vụ (tính bằng giây)
  const [remainingTime, setRemainingTime] = useState(4 * 60);
  // State để kiểm soát dialog xác nhận hoàn thành
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

  const [task, setTask] = useState(null);

  const [user, setUser] = useState(null);

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
    const fetchUser = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      try {
        const res = await getUserById(userId);
        setUser(res.data);
      } catch (err) {
        console.error("Lỗi lấy user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchActiveTask = async () => {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      try {
        const res = await getActiveTaskByUserId(userId);
        if (res.data) {
          const apiTask = res.data;

          const [hh, mm, ss] = apiTask.remainingTime.split(":").map(Number);
          const totalRemainingSeconds = hh * 3600 + mm * 60 + ss;

          setTaskStatus(apiTask.status);
          setRemainingTime(totalRemainingSeconds);
          setTask({
            ...apiTask,
            remainingTime: totalRemainingSeconds,
          });
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
      }
    };

    fetchActiveTask();
  }, []);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quản lý bộ đếm thời gian cho nhiệm vụ khi đang chạy
  useEffect(() => {
    let timer;
    if (taskStatus === 1 && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            setTaskStatus(3); // Đặt trạng thái hoàn thành khi hết thời gian
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [taskStatus, remainingTime]);

  // Định dạng thời gian hiển thị (giờ, phút, AM/PM)
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const isPM = hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const ampm = isPM ? "PM" : "AM";

  // Hàm định dạng giây thành chuỗi HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Xử lý sự kiện bắt đầu nhiệm vụ
  const handleStart = async () => {
    if (!task) return;
    try {
      await startTaskById(task.taskId);
      setTaskStatus(1);
    } catch (error) {
      console.error("Lỗi khi bắt đầu nhiệm vụ:", error);
    }
  };

  const handlePause = async () => {
    if (!task) return;
    try {
      await pauseTaskById(task.taskId);
      setTaskStatus(2);
    } catch (error) {
      console.error("Lỗi khi tạm dừng nhiệm vụ:", error);
    }
  };

  const handleResume = async () => {
    if (!task) return;
    try {
      await startTaskById(task.taskId); // resume = start
      setTaskStatus(1);
    } catch (error) {
      console.error("Lỗi khi tiếp tục nhiệm vụ:", error);
    }
  };

  const handleFinish = async () => {
    if (!task) return;
    try {
      await completeTaskById(task.taskId);
      setTaskStatus(3);
      setRemainingTime(0);
      setIsFinishDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi hoàn thành nhiệm vụ:", error);
    }
  };

  // Hàm vẽ vòng tròn tiến độ với các đoạn màu cho work/break
  const renderProgressCircle = (task) => {
    // Tính toán tổng thời gian và thời gian đã trôi qua
    const totalDurationSeconds = task.totalDuration * 60;
    const elapsedTime = totalDurationSeconds - remainingTime;
    const cycleDuration = (task.workDuration + task.breakTime) * 60;
    const completedCycles = Math.floor(elapsedTime / cycleDuration);
    const timeInCurrentCycle = elapsedTime % cycleDuration;

    // Tạo danh sách các giai đoạn (work/break)
    const phases = [];
    for (let i = 0; i < completedCycles; i++) {
      phases.push({
        type: "work",
        duration: task.workDuration * 60,
      });
      phases.push({
        type: "break",
        duration: task.breakTime * 60,
      });
    }
    if (timeInCurrentCycle < task.workDuration * 60) {
      phases.push({
        type: "work",
        duration: timeInCurrentCycle,
      });
    } else {
      phases.push({
        type: "work",
        duration: task.workDuration * 60,
      });
      phases.push({
        type: "break",
        duration: timeInCurrentCycle - task.workDuration * 60,
      });
    }

    // Tính toán kích thước vòng tròn dựa trên chiều rộng màn hình
    const screenWidth = Dimensions.get("window").width;
    const circleSize = screenWidth * 0.45;
    const radius = circleSize / 2;
    const circumference = 2 * Math.PI * (radius - 8);

    let accumulatedProgress = 0;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.taskName}>{task.taskName}</Text>

        <Svg height={circleSize} width={circleSize}>
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius - 8}
            stroke="#fef3c7"
            strokeWidth={8}
            fill="#ffffff"
          />
          {phases.map((phase, idx) => {
            const phaseProgress = phase.duration / totalDurationSeconds;
            const startAngle = accumulatedProgress * 2 * Math.PI - Math.PI / 2;
            const endAngle =
              (accumulatedProgress + phaseProgress) * 2 * Math.PI - Math.PI / 2;
            accumulatedProgress += phaseProgress;

            const largeArcFlag = phaseProgress > 0.5 ? 1 : 0;
            const x1 = circleSize / 2 + (radius - 8) * Math.cos(startAngle);
            const y1 = circleSize / 2 + (radius - 8) * Math.sin(startAngle);
            const x2 = circleSize / 2 + (radius - 8) * Math.cos(endAngle);
            const y2 = circleSize / 2 + (radius - 8) * Math.sin(endAngle);

            return (
              <Path
                key={idx}
                d={`M ${x1} ${y1} A ${radius - 8} ${
                  radius - 8
                } 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                stroke={phase.type === "work" ? "#3b82f6" : "#eab308"}
                strokeWidth={8}
                fill="none"
              />
            );
          })}
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{formatTime(remainingTime)}</Text>
          <Text style={styles.progressText}>
            {timeInCurrentCycle < task.workDuration * 60 ? "Work" : "Break"}
          </Text>
          <Text style={styles.progressText}>
            {formatTime(
              timeInCurrentCycle < task.workDuration * 60
                ? task.workDuration * 60 - timeInCurrentCycle
                : task.breakTime * 60 -
                    (timeInCurrentCycle - task.workDuration * 60)
            )}
          </Text>
        </View>
      </View>
    );
  };

  // Giao diện chính của component
  return (
    <>
      {user && user.userConfig && (
        <ImageBackground
          source={{ uri: user.userConfig?.backgroundConfig }}
          style={styles.mainContainer}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <View style={styles.clockWrapper}>
                <Text style={styles.timeText}>
                  {displayHour}:{displayMinutes}
                  <Text style={styles.ampmText}> {ampm}</Text>
                </Text>
              </View>
              {user && (
                <View style={styles.nameAvatarRow}>
                  <Text style={styles.name}>{user.userName}</Text>

                  <View style={styles.avatarBlock}>
                    <Image
                      source={{ uri: user.userConfig?.imageUrl }}
                      style={styles.avatar}
                    />
                    <Text style={styles.level}>
                      Lv {user.userConfig?.levelId ?? 5}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            {task && (
              <>
                <View style={styles.timerContainer}>
                  {renderProgressCircle(task)}
                </View>

                <View style={styles.actionButtons}>
                  {taskStatus === 0 && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#3b82f6" },
                      ]}
                      onPress={handleStart}
                    >
                      <Text style={styles.actionButtonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                  {(taskStatus === 1 || taskStatus === 2) && (
                    <>
                      {remainingTime <= 300 && remainingTime >= 0 ? (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#f97316" },
                          ]}
                          onPress={() => setIsFinishDialogOpen(true)}
                        >
                          <Text style={styles.actionButtonText}>Finish</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor:
                                taskStatus === 1 ? "#f59e0b" : "#10b981",
                            },
                          ]}
                          onPress={
                            taskStatus === 1 ? handlePause : handleResume
                          }
                        >
                          <Text style={styles.actionButtonText}>
                            {taskStatus === 1 ? "Pause" : "Resume"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          <Modal
            visible={isFinishDialogOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsFinishDialogOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Complete Task</Text>
                <Text style={styles.modalDescription}>
                  Are you sure you want to mark "{task?.taskName}" as completed?
                </Text>
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsFinishDialogOpen(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleFinish}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      )}
    </>
  );
}

// Styles cho giao diện
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Lớp phủ mờ
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "transparent", // Trong suốt để hiển thị ảnh nền
  },
  container: {
    padding: 20,
    flexGrow: 1,
    alignItems: "center",
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 0, // Đặt timer ở trên cùng
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  nameAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff", // Màu trắng để nổi bật trên ảnh nền
  },
  avatarBlock: {
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  level: {
    fontSize: 12,
    color: "#ffffff", // Màu trắng để nổi bật
    marginTop: 2,
  },
  clockWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff", // Màu trắng để nổi bật
    position: "relative",
  },
  ampmText: {
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    top: 6,
    right: -40,
    color: "#ffffff", // Màu trắng để nổi bật
  },
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff", // Màu trắng để nổi bật
    marginBottom: 10,
    textAlign: "center",
  },
  progressTextContainer: {
    position: "absolute",
    top: "50%",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -60 }],
  },
  progressText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000", // Màu đen để nổi bật trên nền trắng của timer
    marginBottom: "7%",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#d1d5db", // Gray
  },
  confirmButton: {
    backgroundColor: "#10b981", // Green
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
