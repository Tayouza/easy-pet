import { Redirect, router } from "expo-router";
import { Image } from "expo-image";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../lib/session";
import { Busy, Button, colors, Txt } from "../features/ui";
export default function Welcome() {
  const { profile, loading } = useSession();
  if (loading) return <Busy />;
  if (profile)
    return (
      <Redirect
        href={profile.role === "lojista" ? "/(lojista)" : "/(cliente)"}
      />
    );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: 28,
        justifyContent: "space-around",
      }}
    >
      <Image
        source={require("../../assets/images/logo.png")}
        contentFit="contain"
        style={{ height: 80, width: "100%" }}
      />
      <View style={{ alignItems: "center", gap: 20 }}>
        <Image
          source={require("../../assets/images/splash-icon.png")}
          style={{ width: 160, height: 160 }}
        />
        <Txt title>Seu pet. Sua cidade. Tudo perto.</Txt>
        <Txt muted>
          Descubra os melhores cuidados, encontros e vantagens para quem é da
          família.
        </Txt>
      </View>
      <View style={{ gap: 12 }}>
        <Button
          label="Sou tutor 🐾"
          onPress={() =>
            router.push({ pathname: "/auth", params: { role: "cliente" } })
          }
        />
        <Button
          secondary
          label="Sou lojista"
          onPress={() =>
            router.push({ pathname: "/auth", params: { role: "lojista" } })
          }
        />
      </View>
    </SafeAreaView>
  );
}
