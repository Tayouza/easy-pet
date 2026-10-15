import { Tabs, Redirect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSession } from "../../lib/session";
import { Busy, colors } from "../../features/ui";
export default function Layout() {
  const { profile, loading } = useSession();
  if (loading) return <Busy />;
  if (!profile) return <Redirect href="/" />;
  if (profile.role !== "lojista") return <Redirect href="/(cliente)" />;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontFamily: "Nunito_800ExtraBold" },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {(
        [
          ["index", "Painel", "bar-chart"],
          ["loja", "Minha loja", "storefront"],
          ["itens", "Itens", "pricetags"],
          ["cupons", "Cupons", "ticket"],
          ["perfil", "Perfil", "person"],
        ] as const
      ).map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
