import { View } from "react-native";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";


export default function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-900">
      <LottieView
        source={require("../../assets/loading.json")}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}
