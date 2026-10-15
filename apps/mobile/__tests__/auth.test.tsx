import { jest, it, beforeEach, expect } from "@jest/globals";
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from "expo-router/testing-library";
import { Text } from "react-native";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Row } from "../src/lib/supabase";
import Root from "../src/app/_layout";
import Welcome from "../src/app/index";
import Auth from "../src/app/auth";
import ClientTabs from "../src/app/(cliente)/_layout";
import MerchantTabs from "../src/app/(lojista)/_layout";
import Profile from "../src/features/profile";

type ProfileResult = { data: Row<"profiles">; error: null };
let mockListener:
  ((event: AuthChangeEvent, session: Session | null) => void) | undefined;
let mockSession: Session | null = null;
let mockPending: ((result: ProfileResult) => void) | null = null;
let mockDelay = false;
const mockProfiles = new Map<string, Row<"profiles">>();
function mockProfile(
  role: "cliente" | "lojista",
  id: string = role,
): Row<"profiles"> {
  return {
    id,
    nome: role,
    email: `${id}@teste.com`,
    role,
    plano: "free",
    telefone: null,
    avatar_url: null,
    premium_ate: null,
    premium_desde: null,
    created_at: "2026-10-15",
  };
}
function mockEmit(event: AuthChangeEvent, session: Session | null) {
  mockSession = session;
  mockListener?.(event, session);
}
function mockSignIn(role: "cliente" | "lojista", id: string = role) {
  const profile = mockProfile(role, id);
  mockProfiles.set(id, profile);
  const session = { user: { id } } as Session;
  mockEmit("SIGNED_IN", session);
  return { data: { session, user: session.user }, error: null };
}
jest.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn((listener: typeof mockListener) => {
        mockListener = listener;
        Promise.resolve().then(() =>
          listener?.("INITIAL_SESSION", mockSession),
        );
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                mockListener = undefined;
              },
            },
          },
        };
      }),
      getSession: jest.fn(async () => ({
        data: { session: mockSession },
        error: null,
      })),
      signInWithPassword: jest.fn(async ({ email }: { email: string }) =>
        mockSignIn(email.startsWith("lojista") ? "lojista" : "cliente"),
      ),
      signUp: jest.fn(
        async ({
          options,
        }: {
          options: { data: { role: "cliente" | "lojista" } };
        }) => mockSignIn(options.data.role, "cadastro-novo"),
      ),
      signOut: jest.fn(async () => {
        mockEmit("SIGNED_OUT", null);
        return { error: null };
      }),
    },
    from: jest.fn((table: string) => {
      let id = "";
      const query = {
        select: () => query,
        eq: (_column: string, value: string) => {
          id = value;
          return query;
        },
        single: () =>
          mockDelay
            ? new Promise<ProfileResult>((resolve) => {
                mockPending = resolve;
              })
            : Promise.resolve({ data: mockProfiles.get(id), error: null }),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({
            data: table === "stores" ? [] : null,
            error: null,
          }).then(resolve),
      };
      return query;
    }),
  },
}));
jest.mock("expo-font", () => ({
  ...jest.requireActual<typeof import("expo-font")>("expo-font"),
  useFonts: () => [true, null],
  isLoaded: () => true,
}));
jest.mock(
  "react-native-safe-area-context",
  () =>
    jest.requireActual<{
      default: typeof import("react-native-safe-area-context");
    }>("react-native-safe-area-context/jest/mock").default,
);
const Dummy = () => <Text>Conteúdo</Text>;
const routes = {
  _layout: Root,
  index: Welcome,
  auth: Auth,
  "(cliente)/_layout": ClientTabs,
  "(cliente)/index": () => <Text>Explorar tutor</Text>,
  "(cliente)/cupons": Dummy,
  "(cliente)/favoritos": Dummy,
  "(cliente)/perfil": Profile,
  "(lojista)/_layout": MerchantTabs,
  "(lojista)/index": () => <Text>Painel lojista</Text>,
  "(lojista)/loja": Dummy,
  "(lojista)/itens": Dummy,
  "(lojista)/cupons": Dummy,
  "(lojista)/perfil": Profile,
  "loja/[id]": Dummy,
  premium: Dummy,
  pets: Dummy,
  admin: Dummy,
};
beforeEach(() => {
  mockSession = null;
  mockPending = null;
  mockDelay = false;
  mockProfiles.clear();
});
async function start(role: "cliente" | "lojista") {
  await renderRouter(routes, { initialUrl: `/auth?role=${role}` });
  await screen.findByText("Que bom ter você aqui!");
  await fireEvent.changeText(
    screen.getByLabelText("E-mail"),
    `${role}@easypet.com`,
  );
  await fireEvent.changeText(screen.getByLabelText("Senha"), "easypet123");
}
it.each(["cliente", "lojista"] as const)(
  "login %s → tabs corretas → logout sem loop",
  async (role) => {
    await start(role);
    await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    await screen.findByText(
      role === "cliente" ? "Explorar tutor" : "Painel lojista",
    );
    await fireEvent.press(screen.getByRole("button", { name: /Perfil, tab/ }));
    await fireEvent.press(
      await screen.findByRole("button", { name: "Sair da conta" }),
    );
    await screen.findByText("Seu pet. Sua cidade. Tudo perto.");
    expect(screen.queryByText("Sair da conta")).toBeNull();
  },
);
it.each(["cliente", "lojista"] as const)(
  "cadastro %s entra direto na tab do perfil",
  async (role) => {
    await start(role);
    await fireEvent.press(
      screen.getByRole("button", { name: "Quero me cadastrar" }),
    );
    await fireEvent.changeText(screen.getByLabelText("Seu nome"), "Nova conta");
    await fireEvent.press(screen.getByRole("button", { name: "Criar conta" }));
    await screen.findByText(
      role === "cliente" ? "Explorar tutor" : "Painel lojista",
    );
    expect(screen.queryByText("Criar conta")).toBeNull();
  },
);
it("SIGNED_OUT limpa imediatamente e resposta atrasada não restaura perfil", async () => {
  await start("cliente");
  mockDelay = true;
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  await screen.findByText("Um instante…");
  await waitFor(() => expect(mockPending).not.toBeNull());
  await act(async () => mockEmit("SIGNED_OUT", null));
  await screen.findByText("Seu pet. Sua cidade. Tudo perto.");
  await act(async () =>
    mockPending?.({ data: mockProfile("cliente"), error: null }),
  );
  expect(screen.getByText("Seu pet. Sua cidade. Tudo perto.")).toBeTruthy();
  expect(screen.queryByText("Explorar tutor")).toBeNull();
});
