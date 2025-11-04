import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, firebaseAuth } from "../../firebaseConfig";

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = firebaseAuth.currentUser;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-500";
      case "resolved":
        return "text-green-500";
      case "in progress":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user) return;
        setLoading(true);
        const q = query(
          collection(db, "reports"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-gray-800">
        <View className="flex-row items-center">
          <Ionicons name="document-text-outline" size={28} color="#3B82F6" />
          <Text className="text-white text-2xl font-bold ml-2">My Reports</Text>
        </View>
        <Ionicons name="refresh" size={24} color="white" onPress={() => navigation.replace("MyReports")} />
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-400 mt-3">Fetching your reports...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="folder-open-outline" size={60} color="#6b7280" />
          <Text className="text-gray-400 text-lg mt-3 text-center">
            You haven’t submitted any reports yet.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {reports.map((report) => (
            <Pressable
              key={report.id}
              className="bg-gray-800 rounded-xl p-4 mb-4 flex-row"
            >
              <Image
                source={{ uri: report.photoUrl || "https://via.placeholder.com/150" }}
                className="w-24 h-24 rounded-lg bg-gray-700"
              />
              <View className="flex-1 ml-4">
                <Text className="text-white text-lg font-semibold" numberOfLines={2}>
                  {report.category || "General Issue"}
                </Text>
                <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                  {report.description || "No description"}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {report.location?.address || "Unknown location"}
                </Text>

                <View className="flex-row items-center mt-2">
                  <Text
                    className={`font-semibold capitalize ${getStatusColor(report.status)}`}
                  >
                    {report.status || "Pending"}
                  </Text>
                  <Text className="text-gray-400 text-xs ml-2">
                    {report.createdAt?.seconds
                      ? new Date(report.createdAt.seconds * 1000).toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
