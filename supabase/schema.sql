-- Rode este script no SQL Editor do Supabase (Project > SQL Editor > New query > Run).
-- Cria a tabela que guarda o estado do app por "código de família" e liga o realtime nela.

create table if not exists app_state (
  code text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

-- Sem login individual: quem souber o código (chave anônima do projeto + código
-- combinado entre vocês) pode ler e escrever o próprio registro. Adequado para
-- uso pessoal entre duas pessoas de confiança, não para dados sensíveis.
create policy "anon pode ler e escrever app_state"
  on app_state
  for all
  to anon
  using (true)
  with check (true);

alter publication supabase_realtime add table app_state;
