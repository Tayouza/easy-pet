import { supabase } from "../lib/supabase";
import { reportError } from "../lib/session";
import { Button, Card, Page, Txt } from "../features/ui";
export default function Admin() {
  return (
    <Page>
      <Card>
        <Txt title>Área administrativa</Txt>
        <Txt muted>
          Acesse o site EasyPet para gerenciar lojas, usuários e assinaturas.
        </Txt>
        <Button
          secondary
          label="Sair da conta"
          onPress={() =>
            void supabase.auth.signOut().then(({ error }) => {
              if (error) reportError(error);
            })
          }
        />
      </Card>
    </Page>
  );
}
