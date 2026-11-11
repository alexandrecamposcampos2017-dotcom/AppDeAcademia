# FitTrack

Aplicativo web responsivo para registrar treinos, atividades, evolução corporal, metas, agenda, alimentação e hidratação. A interface e a API são separadas; os dados ficam em SQLite local e as rotas privadas sempre consultam o usuário autenticado.

## Colaboração da turma

Este repositório público permite que qualquer pessoa consulte e faça fork do código. Para propor alterações sem acesso de escrita ao repositório original:

1. Faça um fork no GitHub e clone o seu fork.
2. Siga as instruções de instalação abaixo e crie uma branch para sua alteração.
3. Faça commit e push para o fork e abra um pull request para este repositório.

O GitHub Pages não hospeda este app completo: ele precisa da API Node.js e de um banco de dados. Cada pessoa pode executar sua própria cópia localmente seguindo as instruções abaixo.

## Requisitos

- Node.js 20.19+ ou 22.12+ (recomendado: Node.js 22 LTS)
- npm 10+

## Instalação e execução local

Na raiz do projeto:

```powershell
npm install
Copy-Item api\.env.example api\.env
npm run db:generate
npm run db:migrate --workspace api -- --name init
npm run db:seed
npm run dev
```

Abra `http://localhost:5173`. A interface redireciona `/api` para a API local em `http://localhost:4000`. O arquivo `api/prisma/dev.db` é criado localmente e não deve ser apagado se você quiser preservar os registros.

Crie uma conta pela tela inicial. A biblioteca inicial contém apenas descrições informativas de exercícios; nenhuma conta ou histórico pessoal fictício é criado.

## Persistência e configuração

`api/.env` aceita:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `DATABASE_URL` | `file:./prisma/dev.db` | Banco SQLite relativo ao workspace `api` |
| `PORT` | `4000` | Porta da API |
| `WEB_ORIGIN` | `http://localhost:5173` | Origem permitida pelo CORS e proteção de origem |
| `NODE_ENV` | — | Use `production` para cookies `Secure` e bloquear recuperação local |

Para outros ambientes, crie e aplique migrações pelo Prisma. SQLite atende execução local; a troca de provedor requer revisar/aplicar migrações antes de usar PostgreSQL em produção.

## Funcionalidades implementadas

- Cadastro, login, logout, sessões em cookie HttpOnly, redefinição local de senha, perfil e foto JPEG/PNG/WebP redimensionada automaticamente e armazenada no banco da conta.
- Treinos personalizados, biblioteca de exercícios, séries, repetições, carga, descanso, favoritos, registro das sessões e temporizador.
- Registro e histórico de atividades, medições corporais, cálculo de IMC, metas, agenda, reagendamento e conclusão de sessões.
- Cadastro pessoal de alimentos por 100 g, cálculo de nutrientes por porção, refeições, hidratação e metas. A calculadora de calorias fica em uma seção própria, usa controles deslizantes para idade, peso e altura e estima gasto energético diário, objetivo calórico, IMC e macronutrientes para adultos.
- Dashboard, sequência ativa/conquistas calculadas dos registros, gráficos históricos, exportação CSV e impressão/salvamento de relatórios em PDF pelo navegador.
- Interface adaptável a celular e desktop, com tema claro/escuro.
- Ilustrações vetoriais originais, selecionadas conforme a modalidade, nos exercícios, treinos, atividades registradas e tela de acesso; não dependem de imagens externas.
- Acessibilidade: atalho para pular ao conteúdo, navegação por teclado com foco visível e foco atualizado ao trocar de página, opção de alto contraste disponível também na tela de acesso, ajuste de texto/interface entre 80% e 150%, suporte à preferência de movimento reduzido do sistema, rótulos explícitos de campos obrigatórios, estados anunciados por leitores de tela e alternativas textuais para os gráficos. Os campos numéricos dos formulários usam controles deslizantes com valor e unidade visíveis, operáveis por teclado; campos opcionais ficam desativados até a pessoa escolher informá-los.
- Validação de entrada, mensagens de erro, limite de requisições de autenticação e isolamento das consultas por usuário.

As calorias, nutrientes, peso e demais medidas não são estimados automaticamente: são valores informados pelo usuário. O IMC é um indicador geral e não substitui orientação profissional.

### Trocar as ilustrações por imagens próprias

Coloque suas imagens PNG, JPG, WebP ou SVG em `web/public/images/training/` ou diretamente em `web/public/`. Para cada imagem, use o nome do treino, exercício ou modalidade, em letras minúsculas e sem acentos. Hífens e sublinhados são aceitos. Por exemplo:

| Tela | Arquivo de imagem |
| --- | --- |
| Exercício chamado "Supino reto" | `supino_reto.jpg` |
| Exercício chamado "Remada baixa" | `remada_baixa.svg` |
| Exercício chamado "Face pull" | `face_pull.svg` |
| Exercício chamado "Tríceps na polia" | `triceps_na_polia.svg` |
| Treino chamado "Treino pernas" | `treino-pernas.png` |
| Atividade "Corrida" | `corrida.png` |
| Foto da tela de acesso | `tela_inicial.jpg` |

O nome deve corresponder ao nome do exercício/treino depois de normalizado; treinos e exercícios personalizados também funcionam. Alguns exercícios da biblioteca têm aliases para nomes de arquivo mais curtos, como `deadbug.jpg` para "Dead bug" e `supino-inclinado.jpg` para "Supino inclinado com halteres". O app procura primeiro em `web/public/images/training/` e também encontra arquivos colocados diretamente em `web/public/`. A tela de acesso usa `tela_inicial.jpg` como fundo em tela cheia, com uma camada de contraste atrás do formulário. Para trocar a foto, substitua esse arquivo ou altere o caminho do fundo em `web/src/styles.css`. As imagens dos cartões usam `object-fit: cover`. Se não houver um arquivo correspondente, o app mantém a ilustração vetorial de reserva.

## Recuperação de senha e produção

Não há serviço de e-mail configurado. Em desenvolvimento, **Esqueci minha senha** gera um token temporário na própria interface, válido por 30 minutos; use-o para definir uma nova senha. Em `NODE_ENV=production`, a API informa explicitamente que a entrega de e-mail precisa ser configurada antes de habilitar a recuperação.

Para publicar, configure HTTPS, uma origem confiável, segredo/armazenamento de sessão compatível com sua infraestrutura e um provedor de e-mail. A configuração atual é direcionada a execução local e não substitui uma revisão operacional de produção. Use origem web/API de mesmo site para que o cookie `SameSite=Strict` funcione.

## Testes e build

```powershell
npm test
npm run build
```

O teste cria e migra automaticamente um banco isolado (`api/test.db`), sem alterar os dados de uso local. Verifica autenticação, persistência, validação, criação/conclusão de treino, dashboard, redefinição de senha e isolamento entre duas contas. O banco de teste pode ser removido após a execução.

## Limitações e integrações

Google Fit, Apple Health, relógios inteligentes, notificações remotas, análise por IA, vídeos demonstrativos e entrega de PDF como arquivo não estão conectados. Fotos de perfil são armazenadas no banco local; upload de fotos de evolução corporal ainda não está disponível. Os relatórios podem ser impressos/salvos em PDF pelo navegador; integrações externas exigem suas APIs, permissões e credenciais.

Os lembretes usam notificações do navegador e só disparam enquanto o aplicativo estiver aberto, em um navegador/contexto que ofereça suporte e após permissão do usuário.
