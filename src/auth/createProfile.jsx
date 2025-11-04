import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '../../firebaseConfig';

export default function CreateProfile() {
    const handleLogout = async () => {
        try {
        await signOut(firebaseAuth);
        } catch (error) {
        console.error('Logout error:', error);
        }
    };

    const user = firebaseAuth.currentUser;
    console.log('Current user after logout:', user);

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
        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
        <ScrollView className="flex-1 bg-white p-6">
        <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage}>
            <Image
                source={
                profile.profilePic
                    ? { uri: profile.profilePic }
                    : require("../../assets/images/default-avatar.png")
                }
                className="w-32 h-32 rounded-full border border-gray-300"
            />
            </TouchableOpacity>
            <Text className="text-gray-500 mt-2">Tap to change photo</Text>
        </View>

        <Text className="text-gray-600 mb-1">Full Name</Text>
        <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Enter name"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
        />

        <Text className="text-gray-600 mb-1">Phone Number</Text>
        <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-3"
            placeholder="Enter phone number"
            value={profile.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
        />

        <Text className="text-gray-600 mb-1">Address</Text>
        <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-6"
            placeholder="Enter address"
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
        />

        <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-600"}`}
        >
            <Text className="text-center text-white text-lg font-semibold">
            {loading ? "Saving..." : "Save Profile"}
            </Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}