import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, firebaseAuth } from "../../firebaseConfig";
import { onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";



export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
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
  if (!user) return;

  // Start loading when the listener sets up
  setLoading(true);

  // Define query: only user's reports, ordered by createdAt (newest first)
  const q = query(
    collection(db, "reports"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(fetchedReports);
      setLoading(false);
    },
    (error) => {
      console.error("Error listening to reports:", error);
      setLoading(false);
    }
  );

  // Cleanup listener on unmount
  return () => unsubscribe();
}, [user]);

const toggleExpand = (id) => {
  setExpandedId(expandedId === id ? null : id);
}


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
            onPress={() => toggleExpand(report.id)}
            className="bg-gray-800 rounded-xl p-4 mb-4 flex-row"
          >
            <Image
              source={{ uri: report.photoUrl || "https://via.placeholder.com/150" }}
              className="w-24 h-24 rounded-lg bg-gray-700"
            />

            <View className="flex-1 ml-4">
              {/* Category */}
              <Text
                className="text-white text-lg font-semibold"
                numberOfLines={expandedId === report.id ? undefined : 2}
              >
                {report.category || "General Issue"}
              </Text>

              {/* Description */}
              <Text
                className="text-gray-400 text-sm mt-1"
                numberOfLines={expandedId === report.id ? undefined : 2}
              >
                {report.description || "No description"}
              </Text>

              {/* Location */}
              <Text className="text-gray-500 text-xs mt-1">
                {report.location?.address || "Unknown location"}
              </Text>

              {/* Status and date */}
              <View className="flex-row items-center mt-2 justify-between">
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

              {/* Expanded Section */}
              {expandedId === report.id && (
                <View className="mt-3">
                  
                  {/* Status Dropdown */}
                  <View className="flex-row items-center mb-3">
                    <Text className="text-gray-300 mr-2">Update Status:</Text>
                    <View className="flex-1 bg-gray-700 rounded-lg px-1 py-0">
                      <Picker
                        selectedValue={report.newStatus || report.status}
                        onValueChange={(value) => {
                          const updatedReports = reports.map((r) =>
                            r.id === report.id ? { ...r, newStatus: value } : r
                          );
                          setReports(updatedReports);
                        }}
                        style={{ color: "#fff" }}
                      >
                        <Picker.Item label="Pending" value="pending" />
                        <Picker.Item label="In Progress" value="in progress" />
                        <Picker.Item label="Resolved" value="resolved" />
                        <Picker.Item label="Reviewed" value="reviewed" />
                      </Picker>
                    </View>
                  </View>

                  {/* Save Button */}
                  <Pressable
                    onPress={async () => {
                      try {
                        const reportRef = doc(db, "reports", report.id);
                        await updateDoc(reportRef, {
                          status: report.newStatus || report.status,
                        });
                        alert("Status updated successfully!");
                      } catch (err) {
                        console.error("Error updating status:", err);
                        alert("Error updating status. Please try again.");
                      }
                    }}
                    className="bg-blue-600 rounded-lg py-2 mt-2"
                    >
                      <Text className="text-white text-center font-semibold">Save</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
