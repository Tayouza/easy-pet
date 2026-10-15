import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { SessionProvider } from "../lib/session";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Busy, colors } from "../features/ui";
export default function Layout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  if (!loaded && !error) return <Busy />;
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.ink,
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { fontFamily: "Nunito_800ExtraBold" },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth"
            options={{ title: "Bem-vindo ao EasyPet" }}
          />
          <Stack.Screen name="(cliente)" options={{ headerShown: false }} />
          <Stack.Screen name="(lojista)" options={{ headerShown: false }} />
          <Stack.Screen
            name="loja/[id]"
            options={{ title: "Conheça a loja" }}
          />
          <Stack.Screen
            name="premium"
            options={{ presentation: "modal", title: "Mais EasyPet para você" }}
          />
          <Stack.Screen
            name="pets"
            options={{ title: "Carteirinha dos pets" }}
          />
        </Stack>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
