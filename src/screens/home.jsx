import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, firebaseAuth } from '../../firebaseConfig';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [flagging, setFlagging] = useState(false);

 

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'resolved':
        return 'text-green-500';
      case 'in progress':
      case 'reviewed':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // Real-time listener
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
  // Cleanup listener when component unmounts
  return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };


const handleFlag = async (report) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    alert("Please log in to flag reports.");
    return;
  }

  try {
    setFlagging(true);

    if (!report || !report.id) {
      console.warn("Invalid report passed to handleFlag:", report);
      return;
    }

    // Safe get map
    const currentFlagsMap =
      report.flagsMap && typeof report.flagsMap === "object"
        ? report.flagsMap
        : {};

    const alreadyFlagged = currentFlagsMap[user.uid] === true;
    const updatedFlagsMap = {
      ...currentFlagsMap,
      [user.uid]: !alreadyFlagged,
    };
    const newFlagCount = Object.values(updatedFlagsMap).filter(Boolean).length;

    // 🔹 Update Firestore
    const reportRef = doc(db, "reports", report.id);
    await updateDoc(reportRef, {
      flagsMap: updatedFlagsMap,
      flags: newFlagCount,
    });

    // 🔹 Instant local update
    setReports((prevReports) =>
      prevReports.map((r) =>
        r.id === report.id
          ? { ...r, flagsMap: updatedFlagsMap, flags: newFlagCount }
          : r
      )
    );

    } catch (error) {
      console.error("Error toggling flag:", error);
      console.error("Error toggling flag:", error.code, error.message);
    } finally {
      setFlagging(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
    
      
      <View className="flex-row items-center justify-between px-4 py-4 bg-gray-800">
        <View className="flex-row items-center">
          <Text className="text-white text-2xl font-bold ml-2">PublicEye</Text>
        </View>
        <Ionicons name="notifications-outline" size={28} color="white" />
      </View>
      
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-400 mt-3">Loading recent reports...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg">No reports yet.</Text>
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
            source={{
              uri: report.photoUrl || "https://via.placeholder.com/150",
            }}
            className="w-24 h-24 rounded-lg bg-gray-700"
          />
          <View className="flex-1 ml-4">
            <Text
              className="text-white text-lg font-semibold"
              numberOfLines={expandedId === report.id ? undefined : 2}
            >
              {report.category || "No description"}
            </Text>

            <Text className="text-gray-400 text-sm mt-1">
              {report.location?.address || "Unknown location"}
            </Text>

            <View className="flex-row items-center mt-2 justify-between">
              <Text
                className={`font-semibold capitalize ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status || "Pending"}
              </Text>

              <Pressable
                onPress={() => handleFlag(report)}
                disabled={flagging}
                className="flex-row items-center"
              >
                <Ionicons
                  name={
                    report.flagsMap?.[firebaseAuth.currentUser?.uid]
                      ? "flag"
                      : "flag-outline"
                  }
                  size={18}
                  color={report.flagsMap?.[firebaseAuth.currentUser?.uid] ? "#aaa" : "#3B82F6"}
                />
                <Text className="text-gray-300 text-sm ml-1">
                  {report.flags || 0}
                </Text>
              </Pressable>
            </View>

            {expandedId === report.id && (
              <Text className="text-gray-400 mt-3 text-sm leading-5">
                {report.fullDescription ||
                  report.description ||
                  "No detailed description available."}
              </Text>
            )}
          </View>
        </Pressable>
          ))}
        </ScrollView>
      )}

     
      <Pressable
        className="absolute bottom-5 right-5 bg-blue-500 rounded-full px-6 py-4 flex-row items-center shadow-lg"
        onPress={() => navigation.getParent()?.navigate('ReportForm')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text className="text-white font-bold ml-2 text-base">Report Issue</Text>
      </Pressable>
      
    </SafeAreaView>
  );
}
