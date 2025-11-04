import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {db, storage, firebaseAuth} from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigation } from '@react-navigation/native';


export default function ReportForm({ navigation, route }) {
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const userId = firebaseAuth.currentUser?.uid; // Get from auth/params

  const categories = [
    'Pothole',
    'Garbage Overflow',
    'Broken Streetlight',
    'Water Leakage',
    'Sewage Issue',
    'Other',
  ];
  const handleCategorySelect = (cat) => {
    setCategory(cat);
  }

    


  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permissions to add location to your report.');
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const loc = reverseGeocode[0];
        const fullAddress = `${loc.street || ''}, ${loc.city || ''}, ${loc.region || ''}, ${loc.country || ''}`.replace(/^,\s*/, '');
        setAddress(fullAddress);
      }

      setLocation({
        lat: latitude,
        lng: longitude,
      });

      Alert.alert('Success', 'Location added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Please try again.');
      console.error(error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Show image source options
  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Submit report
  const handleSubmit = async () => {
    if (!userId) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        return;
    }

    if (!category) {
      Alert.alert('Missing Category', 'Please select a category for your report.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Missing Image', 'Please add a photo to your report.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide a description of the issue.');
      return;
    }

    if (!location) {
      Alert.alert('Missing Location', 'Please add location to your report.');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Upload image
      const imageRef = ref(storage, `reports/${userId}/${Date.now()}.jpg`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const photoUrl = await getDownloadURL(imageRef);

      // 2️⃣ Add to Firestore
      await addDoc(collection(db, "reports"), {
        userId,
        category,
        description: description.trim(),
        photoUrl,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: address || 'Location added',
        },
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        'Success',
        'Your report has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setImageUri(null);
              setDescription('');
              setLocation(null);
              setAddress('');
              // Navigate back or to reports list
              navigation?.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-6">
        <TouchableOpacity onPress={() => {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate("Main"); 
            }
        }}>
          <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-white text-2xl font-semibold text-center mr-10">
          New Report
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Image Upload Section */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-3">Report Photo </Text>
          <TouchableOpacity
            onPress={showImageOptions}
            className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 overflow-hidden"
            activeOpacity={0.7}
          >
            {imageUri ? (
              <View className="relative">
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-64"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  className="absolute top-3 right-3 bg-red-600 w-10 h-10 rounded-full items-center justify-center"
                >
                  <Feather name="x" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex flex-row items-center justify-center py-16">
                <View className="bg-slate-700 w-16 h-16 rounded-full items-center justify-center mr-4 mt-3 mb-3">
                  <Feather name="camera" size={28} color="#94a3b8" />
                </View>
                <Text className="text-gray-400 text-base font-semibold">Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* CATEGORY SELECTOR */}
        <View className="mb-6 ">
          <Text className="text-gray-400 text-sm mb-3">Category </Text>
          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            }}
        >
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => handleCategorySelect(item)}
                  style={{
                    width: "31%", 
                    marginBottom: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                        category === item ? "#2563EB" : "#1E293B", // blue-600 or slate-800
                    borderColor:
                        category === item ? "#2563EB" : "#334155", // blue-600 or slate-700
                }}
              >
                <Text
                  className={`${
                    category === item ? "text-white" : "text-gray-400"
                  } text-center font-medium`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-3">Description </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-slate-800 text-white text-base px-5 py-4 rounded-xl border border-slate-700"
            style={{ minHeight: 120 }}
          />
        </View>

        {/* Location Section */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-3">Location *</Text>
          
          {location ? (
            <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <View className="flex-row items-start mb-3">
                <Feather name="map-pin" size={20} color="#3b82f6" className="mr-2" />
                <View className="flex-1 ml-2">
                  <Text className="text-white text-base font-medium mb-1">
                    Location Added
                  </Text>
                  {address ? (
                    <Text className="text-gray-400 text-sm">{address}</Text>
                  ) : (
                    <Text className="text-gray-400 text-sm">
                      Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={locationLoading}
                className="bg-slate-700 py-3 rounded-lg"
              >
                <Text className="text-blue-400 text-center text-sm font-medium">
                  Update Location
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={locationLoading}
              className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 py-8"
              activeOpacity={0.7}
            >
              <View className="flex flex-row items-center justify-center">
                {locationLoading ? (
                  <ActivityIndicator size="large" color="#3b82f6" />
                ) : (
                  <>
                    <View className="bg-slate-700 w-16 h-16 rounded-full items-center justify-center mt-3 mr-4 mb-3">
                      <Feather name="map-pin" size={28} color="#94a3b8" />
                    </View>
                    <Text className="text-gray-400 text-base font-semibold">Tap to add location</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-5 rounded-xl mb-8 ${loading ? 'bg-slate-700' : 'bg-blue-600'}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Submit Report
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}