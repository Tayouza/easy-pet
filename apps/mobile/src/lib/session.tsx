import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase, Row } from "./supabase";
import { Alert } from "react-native";
import { router } from "expo-router";
import { toFriendlyError } from "../shared";
const Context = createContext<{
  profile: Row<"profiles"> | null;
  loading: boolean;
  refresh: () => Promise<void>;
}>({ profile: null, loading: true, refresh: async () => {} });
export function SessionProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Row<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error)
        Alert.alert("Não foi possível carregar seu perfil", error.message);
      setProfile(data);
    } else setProfile(null);
    setLoading(false);
  };
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => void refresh(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  return (
    <Context.Provider value={{ profile, loading, refresh }}>
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
export function reportError(error: unknown, merchant = false) {
  const e = toFriendlyError(error);
  if (e.code !== "GENERICO")
    Alert.alert(e.titulo, e.mensagem, [
      { text: "Agora não", style: "cancel" },
      {
        text: merchant ? "Ver planos" : "Seja Premium",
        onPress: () => router.push("/premium"),
      },
    ]);
  else Alert.alert(e.titulo, e.mensagem);
}
