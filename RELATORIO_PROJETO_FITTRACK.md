# Relatório do projeto FitTrack

> **Status:** documento baseado na implementação atual. Os testes com participantes ainda precisam ser realizados e registrados; nenhum resultado ou participante foi inventado.

## 1. Identificação do projeto

- **Nome:** FitTrack
- **Tema:** aplicação web para organização de treinos e acompanhamento de atividades e hábitos relacionados à saúde.
- **Tecnologias:** React, TypeScript e Vite na interface; Node.js, Express, Prisma e SQLite na API e persistência local.

## 2. Introdução e problema

O FitTrack reúne em um só lugar registros que costumam ficar espalhados entre anotações, planilhas e aplicativos diferentes: treinos, atividades físicas, medidas corporais, metas, agenda, alimentação e hidratação. A proposta é facilitar a organização da rotina e permitir que cada pessoa acompanhe os próprios registros ao longo do tempo.

O sistema não prescreve exercícios nem substitui acompanhamento profissional. Medidas, calorias e nutrientes são informados pela pessoa usuária; o IMC é apresentado apenas como indicador geral.

## 3. Público-alvo

Pessoas que praticam atividade física ou desejam organizar uma rotina de exercícios, desde iniciantes até pessoas com experiência, e que querem registrar sua evolução. O público precisa conseguir:

- organizar treinos e consultar exercícios;
- registrar atividades e medidas sem depender de integrações externas;
- definir metas e acompanhar o progresso;
- usar a interface em computador ou celular;
- controlar preferências visuais e entender o que acontece com seus dados.

## 4. Requisitos

### 4.1 Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Permitir cadastro, login, logout, perfil e redefinição local de senha. |
| RF02 | Permitir criar e consultar treinos personalizados, selecionar exercícios, informar séries, repetições, carga e descanso, favoritar planos e registrar sessões. |
| RF03 | Exibir uma biblioteca de exercícios com descrições e instruções. |
| RF04 | Registrar e consultar atividades físicas. |
| RF05 | Registrar medidas corporais e apresentar o histórico, incluindo o cálculo de IMC quando houver dados suficientes. |
| RF06 | Criar metas e acompanhar o progresso com base nos registros. |
| RF07 | Agendar, reagendar e concluir sessões; oferecer lembretes do navegador quando habilitados. |
| RF08 | Registrar refeições e hidratação, com cálculo de nutrientes por porção a partir dos alimentos cadastrados pela pessoa. |
| RF09 | Apresentar um painel com resumos e histórico, além de relatórios exportáveis em CSV ou imprimíveis pelo navegador. |
| RF10 | Calcular sequência de atividade e conquistas a partir dos registros da conta. |
| RF11 | Permitir personalização de tema e preferências de acessibilidade disponíveis na interface. |

### 4.2 Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Adaptar a interface a diferentes larguras de tela, incluindo celulares a partir de 320 px. |
| RNF02 | Oferecer navegação por teclado, foco visível, atalho para o conteúdo principal e anúncios de estado para tecnologias assistivas. |
| RNF03 | Oferecer tema claro/escuro, alto contraste e ajuste do tamanho da interface; respeitar a preferência de movimento reduzido do sistema. |
| RNF04 | Persistir dados localmente em SQLite e restringir registros pessoais ao usuário autenticado. |
| RNF05 | Validar entradas e apresentar mensagens de erro em operações que não puderem ser concluídas. |
| RNF06 | Usar ilustrações locais e não depender de imagens remotas para a interface principal. |
| RNF07 | Executar localmente com Node.js 20.19+ ou 22.12+ e npm 10+, conforme o README. |
| RNF08 | Informar limitações de integrações: recuperação de senha não envia e-mail sem configuração; lembretes do navegador só funcionam enquanto o app estiver aberto e com permissão. |

## 5. Fluxo do usuário

### Fluxo principal

```text
Abrir o FitTrack
  → criar uma conta ou entrar
  → consultar a Visão geral
  → escolher uma área na navegação
  → registrar ou atualizar informações
  → consultar o painel, o histórico ou os relatórios
  → sair da conta
```

### Exemplo: registrar um treino

```text
Entrar
  → Meus treinos
  → selecionar ou criar um plano
  → incluir exercícios e configurar séries/repetições/carga
  → iniciar e registrar a sessão
  → salvar
  → conferir o registro na Visão geral ou nos Relatórios
```

## 6. Interface desenvolvida e telas

O protótipo foi implementado como aplicação navegável, não como arquivo separado do Figma. As telas autenticadas compartilham navegação, cabeçalho, componentes de formulário e identidade visual. Há mais de cinco telas relacionadas:

1. **Acesso:** cadastro, login e recuperação local de senha.
2. **Visão geral:** resumo dos registros, metas, agenda e conquistas.
3. **Meus treinos:** planos pessoais e sessões.
4. **Atividades:** registro e histórico de atividades.
5. **Evolução e metas:** medidas, indicadores e metas.
6. **Agenda:** organização e reagendamento de sessões.
7. **Alimentação:** refeições, alimentos e hidratação.
8. **Exercícios:** biblioteca de movimentos.
9. **Relatórios:** consulta e exportação/impressão dos dados.
10. **Meu perfil:** dados pessoais e preferências.

### Demonstração computador e celular

- **Computador:** navegação lateral fixa, cabeçalho e conteúdo central em cartões e painéis.
- **Tablet/celular:** regras responsivas reorganizam a navegação, o cabeçalho e as grades; os estilos incluem ajustes nos pontos de quebra de 1200 px, 920 px e 620 px.
- Para a apresentação, abrir as mesmas telas em uma janela ampla e em uma janela estreita do navegador e demonstrar a navegação e os formulários em ambas. A aplicação limita a largura mínima visual a 320 px.

## 7. Design, ergonomia e acessibilidade

A interface usa tipografia do sistema, fundo claro e superfícies brancas, azul como cor de ação principal e cores auxiliares para diferenciar informações. O tema escuro altera as cores de fundo, texto, bordas e ações. A hierarquia combina título da página, resumo, cartões e ações próximas ao conteúdo correspondente.

Recursos presentes na implementação:

- atalho “Pular para o conteúdo principal”;
- foco visível para controles e navegação por teclado;
- rótulos e estados anunciados por leitores de tela em elementos interativos relevantes;
- controles independentes para ajustar a escala da interface entre 80% e 200% (padrão de 120%) e o tamanho da fonte entre 80% e 200% (padrão de 100%);
- opção de alto contraste, tema claro/escuro e suporte à preferência de movimento reduzido;
- conteúdo e mensagens em português, com medidas apresentadas em unidades familiares.

**Limite da avaliação:** esses recursos não comprovam, por si só, conformidade integral com WCAG. Ainda é necessário medir o contraste de texto e componentes em cada tema, verificar as telas com leitor de tela e testar o zoom em conteúdo real.

## 8. Pesquisa com usuários

Aplicar as perguntas a pessoas que praticam atividade física ou têm interesse em organizar uma rotina. Não solicitar dados pessoais desnecessários.

1. Como você organiza atualmente seus treinos e atividades?
2. O que costuma ser mais difícil ao manter uma rotina de exercícios?
3. Que informações você gostaria de registrar depois de um treino?
4. Como você acompanha metas ou percebe sua evolução hoje?
5. Você prefere usar esse tipo de sistema no celular, no computador ou em ambos? Por quê?
6. Que recursos de acessibilidade ou personalização facilitariam o uso?
7. O que faria você voltar a usar um aplicativo como o FitTrack?

## 9. Teste de usabilidade com participantes

**Pendente de execução.** A documentação e os testes automatizados da API não substituem sessões de usabilidade. Para concluir este item, convidar pelo menos duas pessoas do público-alvo, obter consentimento, não registrar dados pessoais e preencher os campos abaixo após cada sessão.

### Participantes (identificação anônima)

| Código | Perfil relevante para a tarefa (sem dados pessoais) | Sessão realizada? |
|---|---|---|
| P01 | A preencher após convidar a pessoa | Não |
| P02 | A preencher após convidar a pessoa | Não |

### Tarefas propostas

1. Encontrar a biblioteca e localizar um exercício adequado a um treino.
2. Criar ou localizar um treino e identificar onde configurar séries e repetições.
3. Registrar uma atividade física.
4. Criar uma meta e localizar onde acompanhar seu progresso.
5. Encontrar um registro anterior e descobrir como consultar ou exportar o relatório.
6. Localizar no perfil os controles de acessibilidade e alterar o tamanho do texto.

Durante cada sessão, observar se a tarefa foi concluída sem ajuda, erros, hesitações, pedidos de ajuda e comentários espontâneos. Não orientar a pessoa antes de observar sua tentativa; ao final, perguntar o que foi fácil, difícil e o que mudaria.

### Registro dos resultados

| Participante | Tarefa | Concluiu sem ajuda? | Dificuldade observada (com evidência) | Severidade (baixa/média/alta) |
|---|---|---|---|---|
| P01 | A preencher | — | A preencher após o teste | — |
| P02 | A preencher | — | A preencher após o teste | — |

Não preencher esta tabela com suposições. Depois das sessões, resumir os padrões observados, priorizar os problemas por frequência e impacto e registrar as mudanças propostas na seção 11.

## 10. Inspeção heurística da interface

Avaliação preliminar por inspeção do código e da interface implementada; não equivale a teste com usuários.

| Critério | Situação observada | Próxima verificação |
|---|---|---|
| Visibilidade do estado do sistema | Há estados de carregamento/erro e mensagens de retorno em operações. | Confirmar com participantes se o retorno é percebido e compreendido. |
| Correspondência com o mundo real | A interface usa português e termos de treino, agenda, alimentação e medidas. | Verificar se iniciantes compreendem todos os termos. |
| Controle e liberdade | Há navegação entre áreas e operações de edição/remoção em funcionalidades pertinentes. | Verificar recuperação de ações e se remoções importantes são claras. |
| Consistência e padrões | Cabeçalho, navegação e componentes reaparecem nas telas. | Comparar a experiência em celular e computador. |
| Prevenção de erros | A API valida entradas e há limites para operações de autenticação. | Testar campos inválidos, valores extremos e mensagens antes de salvar. |
| Reconhecimento em vez de memorização | A navegação nomeia as áreas e o painel oferece atalhos para conteúdo relacionado. | Verificar se a pessoa encontra as tarefas sem instruções. |
| Flexibilidade e eficiência | Há navegação por teclado e ajustes de tema, contraste e tamanho. | Testar com teclado, zoom e leitor de tela. |
| Estética e foco | Painéis e cartões agrupam dados por assunto. | Observar se o volume de informações do painel distrai ou sobrecarrega. |
| Prevenção e recuperação de erros | Erros são apresentados em mensagens; a API mantém validações. | Registrar se a mensagem explica como resolver o problema. |
| Ajuda e documentação | O README descreve instalação, funcionalidades e limitações; não foi confirmada ajuda contextual em todas as telas. | Avaliar se uma pessoa iniciante precisa de orientação adicional. |
| Contraste e legibilidade | Existem modos de alto contraste e ajuste de texto. | Medir contraste nas combinações normal/escuro e testar conteúdo ampliado. |

## 11. Problemas e proposta de melhoria

### Problemas observados na inspeção

- O contraste das combinações de cores não foi medido numericamente; a opção de alto contraste não substitui essa verificação.
- A clareza dos fluxos para iniciantes, a facilidade para localizar ações e a compreensão das mensagens ainda não foram validadas com participantes.
- A recuperação de senha depende de configuração de e-mail para uso em produção, e os lembretes locais dependem do aplicativo permanecer aberto.

### Melhorias priorizadas

1. **Prioridade alta — validar contraste e ampliar o acesso:** medir os estados claro/escuro e alto contraste com ferramenta WCAG e corrigir combinações abaixo dos critérios aplicáveis.
2. **Prioridade alta — executar os testes P01/P02:** observar as tarefas da seção 9 e usar os resultados para decidir quais mudanças realmente resolvem dificuldades.
3. **Prioridade média — orientar primeiras tarefas:** se os participantes tiverem dificuldade para criar o primeiro treino ou meta, incluir dicas curtas e dispensáveis nos pontos correspondentes.
4. **Prioridade média — revisar mensagens de erro:** se os testes indicarem dúvida, explicar a causa e o próximo passo sem depender de termos técnicos.
5. **Prioridade futura — integrações externas:** avaliar e-mail de recuperação e notificações remotas somente quando houver infraestrutura e requisitos de privacidade definidos.

As propostas 2 a 4 são hipóteses para validação, não resultados atribuídos a participantes.

## 12. Gamificação e motivação

O painel exibe a sequência atual e a maior sequência de atividade, além de conquistas com estado “Em progresso” ou “Conquistada”. Metas e barras de progresso oferecem feedback visual sem atribuir pontuação competitiva. Os indicadores são calculados a partir dos registros da própria pessoa; não há recompensas externas.

Na apresentação, demonstrar uma meta e a área de sequência/conquistas. Não criar registros fictícios de usuários para simular resultados.

## 13. Roteiro para apresentação oral

1. Apresentar o FitTrack e o problema de manter registros de treino espalhados.
2. Identificar o público-alvo e explicar os requisitos principais.
3. Demonstrar o fluxo de acesso, painel, treino, atividade, meta e relatório.
4. Repetir a navegação em largura de computador e celular.
5. Mostrar as decisões de acessibilidade e os elementos de motivação.
6. Apresentar os resultados reais dos testes P01 e P02 após realizá-los; até lá, informar que essa etapa está pendente.
7. Encerrar com as melhorias priorizadas e as limitações conhecidas.

## 14. Referências da implementação

- [README do projeto](./README.md): instalação, funcionalidades, limitações e testes.
- [Interface React](./web/src/App.tsx): telas, navegação, formulários e recursos da interface.
- [Estilos responsivos e acessibilidade](./web/src/styles.css): temas, pontos de quebra, foco e preferências visuais.
- [Testes automatizados da API](./api/src/app.test.ts): autenticação, persistência, validação e isolamento entre contas.
