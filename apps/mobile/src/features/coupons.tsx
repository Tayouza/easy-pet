import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Button, Card, Txt } from "./ui";
import { formatDate } from "../shared";
export type Coupon = {
  id: string;
  titulo: string;
  descricao: string;
  desconto: string;
  codigo: string | null;
  bloqueado: boolean;
  validade: string | null;
  store_nome?: string;
};
export function CouponCard({ coupon: c }: { coupon: Coupon }) {
  return (
    <Card>
      <Txt title>{c.desconto}</Txt>
      {c.store_nome && <Txt muted>{c.store_nome}</Txt>}
      <Txt>{c.titulo}</Txt>
      <Txt muted>{c.descricao}</Txt>
      <Txt muted>
        {c.validade
          ? `Válido até ${formatDate(c.validade)}`
          : "Aproveite na loja parceira"}
      </Txt>
      <Button
        secondary
        label={
          c.bloqueado
            ? "🔒 Desbloquear com Premium"
            : `Copiar ${c.codigo ?? "cupom"}`
        }
        onPress={() => {
          if (c.bloqueado) router.push("/premium");
          else if (c.codigo)
            void Clipboard.setStringAsync(c.codigo).then(() =>
              Alert.alert("Código copiado!", "Apresente o cupom na loja."),
            );
        }}
      />
    </Card>
  );
}
