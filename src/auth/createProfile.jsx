import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CreateProfile() {
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
        await signOut(firebaseAuth);
        } catch (error) {
        console.error('Logout error:', error);
        }
    };

    const user = firebaseAuth.currentUser;
    

    const [profile, setProfile] = useState({
        name: '',
        address: '',
        phone: '',
        profilePic: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;
            const docRef = doc(db, 'users', user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setProfile(snap.data());
            }
        };
        fetchUserProfile();
    }, []);

    const pickImage = async () => {
        const result =  await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) {
            setProfile({ ...profile, profilePic: result.assets[0].uri });
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            let photoUrl = profile.profilePic;
            if (profile.profilePic && profile.profilePic.startsWith("file:")) {
                const imageRef = ref(storage, `profiles/${user.uid}.jpg`);
                const response = await fetch(profile.profilePic);
                const blob = await response.blob();
                await uploadBytes(imageRef, blob);
                photoUrl = await getDownloadURL(imageRef);
            }

            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.address,
                    email: user.email,
                    profilePic: photoUrl || null,
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );

        Alert.alert("Success", "Profile updated successfully!");
        navigation.replace('Main');
        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
            <Text className="text-white text-2xl font-semibold text-center">
            Create Profile
            </Text>
            <Text className="text-gray-400 text-center mt-2">
            Complete your profile to get started
            </Text>
        </View>

        <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        >
            {/* Profile Picture */}
            <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <View className="relative">
                <Image
                    source={
                    profile.profilePic
                        ? { uri: profile.profilePic }
                        : require("../../assets/images/default-avatar.png")
                    }
                    className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700"
                />
                <View className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full items-center justify-center border-4 border-slate-900">
                    <Feather name="camera" size={18} color="white" />
                </View>
                </View>
            </TouchableOpacity>
            <Text className="text-gray-400 text-sm mt-3">Tap to add photo</Text>
            </View>

            {/* Full Name */}
            <View className="mb-5">
            <Text className="text-gray-400 text-sm mb-2">Full Name </Text>
            <TextInput
                className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
                placeholder="Enter your full name"
                placeholderTextColor="#64748b"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
            </View>

            {/* Phone Number */}
            <View className="mb-5">
            <Text className="text-gray-400 text-sm mb-2">Phone Number </Text>
            <TextInput
                className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
                placeholder="Enter phone number"
                placeholderTextColor="#64748b"
                value={profile.phone}
                keyboardType="phone-pad"
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
            />
            </View>

            {/* Address */}
            <View className="mb-6">
            <Text className="text-gray-400 text-sm mb-2">Address </Text>
            <TextInput
                className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
                placeholder="Enter your address"
                placeholderTextColor="#64748b"
                value={profile.address}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onChangeText={(text) => setProfile({ ...profile, address: text })}
            />
            </View>

            {/* Save Button */}
            <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`py-5 rounded-full mb-8 ${loading ? 'bg-slate-700' : 'bg-blue-600'}`}
            activeOpacity={0.8}
            >
            {loading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Text className="text-white text-center text-lg font-semibold">
                Save Profile
                </Text>
            )}
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}