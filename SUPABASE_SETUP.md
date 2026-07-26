# Configurar a sincronização em tempo real (Supabase)

Passos para criar o banco compartilhado que sincroniza os dados entre você e
seu parceiro. Leva uns 5 minutos.

1. Crie uma conta gratuita em https://supabase.com (dá pra entrar com o GitHub).
2. Crie um novo projeto: escolha um nome, uma senha de banco (não precisa
   guardar, o app não usa ela) e a região mais próxima (ex: South America).
   Espere ~2 minutos até o projeto ficar pronto.
3. No menu lateral, abra **SQL Editor > New query**, cole o conteúdo do
   arquivo `supabase/schema.sql` deste repositório e clique em **Run**.
   Isso cria a tabela `app_state` e liga a sincronização em tempo real nela.
4. Vá em **Project Settings > API**. Copie os dois valores:
   - **Project URL**
   - **anon public** (a chave pública, não a `service_role`)
5. Me envie esses dois valores aqui na conversa. Vou configurá-los como
   segredo no GitHub Actions (não ficam expostos no código do repositório,
   embora a chave "anon" seja feita para uso público no navegador — a
   proteção real dos seus dados está na etapa 3, no código compartilhado que
   só você e seu parceiro vão saber).

Depois disso, o app publicado no GitHub Pages já sincroniza sozinho: ao abrir
pela primeira vez em cada celular, basta digitar o mesmo código combinado
entre vocês dois.

## Ativando a publicação no GitHub Pages

Duas configurações no repositório do GitHub que só um administrador consegue
fazer (eu não tenho acesso para isso):

1. **Settings > Secrets and variables > Actions > New repository secret**:
   crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do
   passo 4 acima.
2. **Settings > Pages > Build and deployment > Source**: selecione
   **GitHub Actions**.

O workflow em `.github/workflows/deploy-pages.yml` publica automaticamente a
cada push na branch `main`. O link final fica algo como
`https://luanaraquelfreire-dotcom.github.io/App-h-bitos/`.
