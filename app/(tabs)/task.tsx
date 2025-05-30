import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Progress from "react-native-progress";
import Svg, { Circle, Path } from "react-native-svg";

// Component chính hiển thị màn hình quản lý nhiệm vụ
export default function TaskScreen() {
  // State để lưu thời gian hiện tại, cập nhật mỗi giây
  const [time, setTime] = useState(new Date());
  // State để lưu trạng thái nhiệm vụ: 0 (Not Started), 1 (On-going), 2 (Paused), 3 (Completed)
  const [taskStatus, setTaskStatus] = useState(0);
  // State để lưu thời gian còn lại của nhiệm vụ (tính bằng giây)
  const [remainingTime, setRemainingTime] = useState(12.75 * 60);

  // Dữ liệu mẫu cho nhiệm vụ
  const sampleTask = {
    taskId: 1,
    taskName: "Learn React Basics",
    taskDescription: "Study React hooks and components",
    startDate: "2025-05-20T09:00:00.000Z",
    endDate: "2025-05-20T12:00:00.000Z",
    status: taskStatus,
    focusMethodName: "Pomodoro",
    totalDuration: 60, // Tổng thời gian nhiệm vụ (phút)
    workDuration: 25, // Thời gian làm việc mỗi chu kỳ (phút)
    breakTime: 5, // Thời gian nghỉ mỗi chu kỳ (phút)
    userTreeName: "Oak Tree",
    taskTypeName: "Simple",
    taskNote: "Focus on useState and useEffect",
    taskResult: null,
    remainingTime: remainingTime,
    priority: 1,
  };

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
  const handleStart = () => {
    setTaskStatus(1);
  };

  // Xử lý sự kiện tạm dừng nhiệm vụ
  const handlePause = () => {
    setTaskStatus(2);
  };

  // Xử lý sự kiện tiếp tục nhiệm vụ
  const handleResume = () => {
    setTaskStatus(1);
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
        {/* Vẽ vòng tròn bằng SVG */}
        <Svg height={circleSize} width={circleSize}>
          {/* Vòng tròn nền */}
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius - 8}
            stroke="#fef3c7"
            strokeWidth={8}
            fill="transparent"
          />
          {/* Vẽ từng đoạn cung cho các giai đoạn */}
          {phases.map((phase, idx) => {
            const phaseProgress = phase.duration / totalDurationSeconds;
            const startAngle = accumulatedProgress * 2 * Math.PI - Math.PI / 2;
            const endAngle = (accumulatedProgress + phaseProgress) * 2 * Math.PI - Math.PI / 2;
            accumulatedProgress += phaseProgress;

            const largeArcFlag = phaseProgress > 0.5 ? 1 : 0;
            const x1 = circleSize / 2 + (radius - 8) * Math.cos(startAngle);
            const y1 = circleSize / 2 + (radius - 8) * Math.sin(startAngle);
            const x2 = circleSize / 2 + (radius - 8) * Math.cos(endAngle);
            const y2 = circleSize / 2 + (radius - 8) * Math.sin(endAngle);

            return (
              <Path
                key={idx}
                d={`M ${x1} ${y1} A ${radius - 8} ${radius - 8} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                stroke={phase.type === "work" ? "#3b82f6" : "#eab308"}
                strokeWidth={8}
                fill="none"
              />
            );
          })}
        </Svg>
        {/* Hiển thị thông tin thời gian và giai đoạn */}
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{formatTime(remainingTime)}</Text>
          <Text style={styles.progressText}>
            {timeInCurrentCycle < task.workDuration * 60 ? "Work" : "Break"}
          </Text>
          <Text style={styles.progressText}>
            {formatTime(
              timeInCurrentCycle < task.workDuration * 60
                ? task.workDuration * 60 - timeInCurrentCycle
                : task.breakTime * 60 - (timeInCurrentCycle - task.workDuration * 60)
            )}
          </Text>
        </View>
      </View>
    );
  };

  // Giao diện chính của component
  return (
    <View style={styles.mainContainer}>
      {/* Header hiển thị thời gian và thông tin người dùng */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
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
      </View>
      {/* Nội dung chính, có thể cuộn */}
      <ScrollView contentContainerStyle={styles.container}>
        {renderProgressCircle(sampleTask)}
        {/* Nút điều khiển nhiệm vụ */}
        <View style={styles.actionButtons}>
          {taskStatus === 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
              onPress={handleStart}
            >
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {taskStatus === 1 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#f59e0b" }]}
              onPress={handlePause}
            >
              <Text style={styles.actionButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          {taskStatus === 2 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10b981" }]}
              onPress={handleResume}
            >
              <Text style={styles.actionButtonText}>Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Styles cho giao diện
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5FDF7",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#F5FDF7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
    color: "#333",
    fontWeight: "500",
    marginBottom: "5%",
  },
  progressBarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  progressBar: {
    height: 8,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressSegment: {
    height: "100%",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
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
});