import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          console.warn("No profile found for this user");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-400 mt-3">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <Feather name="alert-circle" size={48} color="#9CA3AF" />
        <Text className="text-gray-400 mt-3">No profile information found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-12 pb-6 bg-slate-900">
        <Text className="text-white text-2xl font-semibold text-center">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Profile Image */}
        <View className="items-center mb-6">
          {profile.profilePic ? (
            <Image
              source={{ uri: profile.profilePic }}
              className="w-52 h-52 rounded-full bg-gray-200"
            />
          ) : (
            <View className="w-52 h-52 rounded-full bg-gray-200 items-center justify-center">
              <Feather name="user" size={80} color="#9ca3af" />
            </View>
          )}
          <Text className="text-white text-2xl font-semibold mt-6">
            {profile.name || "Unnamed User"}
          </Text>
          <Text className="text-gray-400 text-base mt-1">{user?.email}</Text>
        </View>

        {/* Info Section */}
        <View className="bg-slate-800 rounded-2xl p-5 mb-8 border border-slate-700">
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-1">Full Name</Text>
            <Text className="text-white text-lg font-medium">
              {profile.name || "N/A"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-1">Phone Number</Text>
            <Text className="text-white text-lg font-medium">
              {profile.phone || "N/A"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-1">Address</Text>
            <Text className="text-white text-lg font-medium">
              {profile.address || "N/A"}
            </Text>
          </View>

          {profile.age ? (
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-1">Age</Text>
              <Text className="text-white text-lg font-medium">{profile.age}</Text>
            </View>
          ) : null}

          <View className="mb-2">
            <Text className="text-gray-400 text-sm mb-1">Last Updated</Text>
            <Text className="text-white text-lg font-medium">
              {profile.updatedAt
                ? new Date(profile.updatedAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </Text>
          </View>
        </View>
        {/* Logout Button */}
            <TouchableOpacity
            onPress={async () => {
                try {
                const auth = getAuth();
                await signOut(auth);
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                });
                } catch (error) {
                console.error("Logout error:", error);
                }
            }}
            className="bg-red-600 py-5 rounded-full mb-10"
            activeOpacity={0.8}
            >
            <Text className="text-white text-center text-lg font-semibold">
                Logout
            </Text>
            </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
