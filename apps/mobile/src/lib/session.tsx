import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
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
  const revision = useRef(0);
  const mounted = useRef(false);
  const currentSession = useRef<Session | null>(null);
  const invalidateRequests = useCallback(() => ++revision.current, []);
  const loadProfile = useCallback(
    async (session: Session | null, request: number) => {
      const isCurrent = () => mounted.current && revision.current === request;
      if (!session) {
        if (isCurrent()) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (!isCurrent()) return;
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        if (!isCurrent()) return;
        setProfile(null);
        Alert.alert(
          "Não foi possível carregar seu perfil",
          toFriendlyError(error).mensagem,
        );
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [],
  );
  const refresh = useCallback(async () => {
    const request = invalidateRequests();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!mounted.current || revision.current !== request) return;
    currentSession.current = session;
    await loadProfile(session, request);
  }, [loadProfile, invalidateRequests]);
  useEffect(() => {
    mounted.current = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate in-flight reads before handling logout or another account.
      const request = invalidateRequests();
      const previousUser = currentSession.current?.user.id;
      currentSession.current = session;
      if (event === "SIGNED_OUT" || !session) {
        setProfile(null);
        setLoading(false);
        return;
      }
      if (previousUser !== session.user.id) {
        setProfile(null);
        setLoading(true);
      }
      // Keep the callback synchronous: don't await a Supabase request inside its auth lock.
      void loadProfile(session, request);
    });
    return () => {
      mounted.current = false;
      invalidateRequests();
      subscription.unsubscribe();
    };
  }, [loadProfile, invalidateRequests]);
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
