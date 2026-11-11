# Atividade de UX e Acessibilidade - Aplicação das habilidades de IA

## 1. Objetivo da atividade

Nesta atividade, os grupos devem analisar um problema de uso, compreender as necessidades do usuário e propor uma solução de interface. O processo deve seguir etapas semelhantes ao desenvolvimento real de projetos de UX e design de interação: pesquisar, definir, projetar, testar e melhorar.

O foco desta proposta é usar habilidades de IA e princípios de acessibilidade para apoiar a análise e a idealização da interface.

---

## 2. Como as habilidades de IA podem ajudar no projeto

### 2.1 Pesquisa e entendimento do problema
A IA pode ajudar a:
- sintetizar reclamações e dores do usuário
- identificar padrões em falas e problemas repetidos
- transformar relatos em necessidades e oportunidades
- mapear problemas em categorias: navegação, clareza, confiança, tempo, acessibilidade

Exemplo de uso:
- "Usuários não conseguem encontrar notas e horários" → problema de organização da informação
- "A interface tem botões pouco claros" → problema de linguagem e sinais visuais
- "Não há confirmação clara da consulta" → problema de feedback e comunicação

### 2.2 Definição de personas e cenários
A IA pode ajudar a criar:
- personas com perfis diferentes
- objetivos, frustrações e necessidades de cada usuário
- cenários do dia a dia de uso do sistema

Exemplo de perfil:
- aluno do ensino médio que acessa o sistema pelo celular
- pai responsivo que quer acompanhar faltas e horários
- aluno com baixa visão que usa zoom e leitor de tela
- usuário idoso que precisa de clareza visual e textos simples

### 2.3 Geração de requisitos de interface
A IA pode transformar o problema em requisitos funcionais e de usabilidade, como:
- localizar informações em até 3 cliques
- clareza na navegação
- filtros simples por período, disciplina ou especialidade
- feedbacks visuais imediatos
- mensagens de erro compreensíveis
- design acessível e com contraste adequado

### 2.4 Prototipagem e melhoria
A IA pode ajudar a:
- sugerir layouts de baixa fidelidade
- propor fluxos de navegação
- identificar elementos que devem ser destacados
- apontar melhorias de acessibilidade em cada tela
- criar checklists antes da validação

### 2.5 Teste e refinamento
A IA pode auxiliar na análise de:
- facilidade de uso
- confusão em passos específicos
- pontos de fricção do fluxo
- conceitos que precisam de maior clareza
- problemas de acessibilidade e usabilidade

---

## 3. Estrutura de trabalho para os grupos

### Etapa 1 - Pesquisar
Objetivo: compreender o problema e as necessidades do usuário.

Atividades:
- identificar público-alvo
- listar dores e reclamações
- compreender contexto de uso
- registrar problemas observados

Saída esperada:
- lista de problemas
- necessidades do usuário
- objetivos da solução

### Etapa 2 - Definir
Objetivo: transformar a pesquisa em direções claras para a solução.

Atividades:
- criar uma ou mais personas
- definir objetivos e necessidades
- escrever user stories
- listar requisitos de interface e acessibilidade

Exemplo de user story:
- Como aluno, quero consultar minhas notas rapidamente para saber minha situação acadêmica sem perder tempo.

### Etapa 3 - Projetar
Objetivo: criar uma proposta de interface.

Atividades:
- desenhar fluxo principal
- definir telas principais
- escolher estrutura de navegação
- indicar elementos visuais importantes
- garantir acessibilidade desde o início

### Etapa 4 - Testar
Objetivo: verificar a clareza da interface.

Atividades:
- validar se o usuário consegue concluir a tarefa
- testar com teclado e zoom
- verificar contraste e legibilidade
- observar se há dúvidas na navegação
- avaliar mensagens de erro e confirmação

### Etapa 5 - Melhorar
Objetivo: ajustar a proposta com base no feedback.

Atividades:
- corrigir passos confusos
- simplificar informações
- melhorar textos e elementos de ação
- reforçar feedback visual
- revisar acessibilidade

---

## 4. Situação-problema 1: Sistema escolar

### Contexto
Uma instituição de ensino possui um sistema para que os alunos consultem notas, faltas e horários. Porém, os usuários reclamam que o sistema é confuso, demora para localizar informações e apresenta botões pouco claros.

### Desafio
Criar uma nova interface que facilite a consulta de notas e horários dos alunos.

### Possível solução

#### Persona principal
- Aluno do ensino médio ou universitário
- Acesso principalmente por celular
- Precisa consultar informações rapidamente
- Pode ter pouca paciência com menus complexos

#### Problemas principais
- excesso de informações na tela inicial
- dificuldade para encontrar notas e horários
- botões sem clareza
- falta de organização visual

#### Requisitos da solução
- página inicial com resumo rápido de notas, faltas e próximos horários
- filtros por período, disciplina e turma
- botões com textos claros: "Minhas notas", "Faltas", "Horários"
- destaque visual para informações mais importantes
- acesso simples em mobile
- contraste bom e leitura clara
- navegação por teclado e leitura com leitor de tela

#### Fluxo sugerido
1. Login
2. Tela inicial com cards de resumo
3. Escolha entre: notas, faltas ou horários
4. Visualização por disciplina ou período
5. Detalhamento da informação
6. Voltar para o painel principal

#### Acessibilidade a incluir
- contraste adequado entre texto e fundo
- textos curtos e objetivos
- foco visível em botões e links
- labels claros em campos de filtro
- navegação por teclado e toque
- uso de ícones com texto explicativo
- informações importantes sem depender só de cor

---

## 5. Situação-problema 2: Agendamento de consultas

### Contexto
Uma clínica popular possui um sistema de agendamento, mas os pacientes não conseguem encontrar horários disponíveis, confundem as especialidades e não recebem confirmação clara da consulta.

### Desafio
Criar uma interface que permita pesquisar especialidades, selecionar um horário e confirmar o agendamento de forma simples.

### Possível solução

#### Persona principal
- Paciente adulto, com pouco tempo e pouca experiência em sistemas digitais
- Pode estar em busca de consulta médica sem complicação
- Precisa receber feedback claro e seguro

#### Problemas principais
- dificuldade para localizar especialidades
- horários pouco legíveis
- confirmação insuficiente após o agendamento
- excesso de informações na etapa de seleção

#### Requisitos da solução
- busca por especialidade com filtro por data
- apresentação clara de disponibilidade em calendário
- indicação de horários livres e ocupados
- botão de confirmação visível e objetivo
- mensagem clara de "Consulta agendada com sucesso"
- opção de visualizar ou cancelar agendamento

#### Fluxo sugerido
1. Selecionar especialidade
2. Escolher data e horário disponível
3. Revisar os dados da consulta
4. Confirmar agendamento
5. Receber confirmação clara e resumo do agendamento

#### Acessibilidade a incluir
- botões com texto direto e compreensível
- campos com labels visíveis
- mensagens de erro e confirmação acessíveis
- seleção por teclado e por toque
- contraste forte para botões primários
- aviso visual e textual quando o agendamento for concluído

---

## 6. Situação-problema 3: Aplicativo de transporte público

### Contexto
Os usuários de uma cidade têm dificuldade para descobrir quais ônibus utilizar, em que ponto devem embarcar e quanto tempo falta para o próximo veículo. As informações estão espalhadas e os mapas são difíceis de interpretar.

### Desafio
Criar uma interface que ajude o usuário a encontrar uma rota, acompanhar o ônibus em tempo real e receber informações claras sobre horários e mudanças no trajeto.

### Possível solução

#### Persona principal
- Usuário urbano, pode estar em movimento
- Precisa de informação rápida, legível e útil no cotidiano
- Pode ter baixo tempo de atenção e uso em mobile

#### Problemas principais
- mapa difícil de interpretar
- rotas pouco claras
- informações dispersas
- demora para localizar o ônibus mais próximo

#### Requisitos da solução
- busca por origem e destino
- rota sugerida com opção de ônibus, caminhada e tempo estimado
- indicação clara do ponto de embarque
- status em tempo real do ônibus
- alerta de atrasos ou mudanças de trajeto
- botão de salvar rotas frequentes

#### Fluxo sugerido
1. Digitar origem e destino
2. Ver rota sugerida com tempo estimado
3. Visualizar ponto de embarque e linha
4. Acompanhar o ônibus em tempo real
5. Receber alertas de atraso ou mudança

#### Acessibilidade a incluir
- mapa com legenda clara e texto de apoio
- contraste adequado para as linhas e ícones
- mensagens de status legíveis e com linguagem simples
- botões grandes para uso em telas pequenas
- navegação em teclado e uso de leitores de tela
- opção de aumentar fontes e ajustar zoom
- evitar depender apenas de cor para diferenciar linhas

---

## 7. Situação-problema 4: Loja virtual de produtos

### Contexto
Uma loja virtual recebe reclamações porque os clientes não conseguem localizar produtos, comparar opções ou finalizar a compra. O carrinho desaparece após alguns passos e as mensagens de erro são pouco explicativas.

### Desafio
Criar uma interface que facilite a busca, a comparação de produtos, a inclusão no carrinho e a conclusão segura da compra.

### Possível solução

#### Persona principal
- Comprador online que deseja rapidez, clareza e confiança
- Pode estar usando celular ou computador
- Quer comparar opções sem confusão

#### Problemas principais
- dificuldade para encontrar produtos
- carrinho não visível em etapas seguintes
- comparação pouco clara
- erros durante a compra sem explicações claras

#### Requisitos da solução
- busca e filtros por categoria, preço e valor
- comparação simples entre opções
- carrinho persistente e visível em todas as etapas
- passos claros do checkout
- mensagens de erro úteis e objetivas
- confirmação do pedido com resumo claro

#### Fluxo sugerido
1. Buscar ou navegar por categoria
2. Visualizar produto com detalhes relevantes
3. Comparar opções
4. Adicionar ao carrinho
5. Revisar pedido
6. Finalizar compra
7. Confirmar pedido com resumo e número do pedido

#### Acessibilidade a incluir
- filtros acessíveis e claramente rotulados
- imagens com texto alternativo relevante
- textos de avaliação e descrição com clareza
- botão de compra bem destacado
- avisos claros de erro em campos de endereço e pagamento
- confirmação sem depender só de cor
- suporte a zoom e leitura em telas pequenas

---

## 8. Modelo de documentação do grupo

Os grupos podem registrar o trabalho em uma estrutura simples como esta:

### 8.1 Identificação do problema
- Nome do projeto
- Situação-problema escolhida
- Contexto da instituição/empresa
- Público-alvo

### 8.2 Pesquisa inicial
- Dores do usuário
- Objetivos principais
- Problemas observados
- Conclusões da análise

### 8.3 Personas
- Nome
- Idade
- Contexto
- Necessidades
- Frustrações

### 8.4 User stories
- Como [usuário], quero [objetivo], para [benefício].

### 8.5 Requisitos da interface
- Funcionais
- de usabilidade
- de acessibilidade

### 8.6 Proposta de interface
- Fluxo principal
- Telas iniciais
- Componentes importantes
- Navegação

### 8.7 Teste e melhoria
- O que foi testado
- O que foi entendido
- O que precisa ser ajustado
- Melhorias sugeridas

---

## 9. Checklist de acessibilidade para a atividade

Use este checklist durante a criação da interface:

- [ ] O sistema pode ser usado sem mouse
- [ ] Foco visível em todos os elementos interativos
- [ ] Botões e links têm textos claros
- [ ] Contraste adequado entre texto e fundo
- [ ] Layout simples e organizado
- [ ] Textos curtos e compreensíveis
- [ ] Mensagens de erro e confirmação são claras
- [ ] A interface funciona bem em celular
- [ ] Há informações sem depender só de cor
- [ ] Ícones e imagens têm contexto
- [ ] Formulários possuem labels claros
- [ ] A navegação é lógica e previsível
- [ ] Usuários com baixa visão e leitores de tela conseguem usar o sistema

---

## 10. Como usar IA para apoiar a atividade

### Sugestão de prompts para IA

#### Prompt 1 - Identificar problemas
"Analise esta situação-problema e identifique as dores do usuário, os objetivos principais, as barreiras de usabilidade e os requisitos de acessibilidade para uma nova interface."

#### Prompt 2 - Criar personas
"Crie 3 personas para esse cenário, com perfil, necessidades, objetivos, frustrações e contexto de uso, incluindo necessidades de acessibilidade."

#### Prompt 3 - Transformar em requisitos
"Liste os requisitos funcionais, de experiência e de acessibilidade para esse projeto, incluindo exemplos de critérios de aceite."

#### Prompt 4 - Propor fluxo
"Sugira um fluxo de uso em 4 a 6 etapas para resolver esse problema, com foco em clareza, rapidez e acessibilidade."

#### Prompt 5 - Revisar acessibilidade
"Revise esta proposta de interface e indique possíveis problemas de acessibilidade, contraste, navegação por teclado, clareza de textos e feedback para o usuário."

---

## 11. Entrega esperada

A entrega pode ser feita em formato de:
- apresentação em slides
- protótipo de baixa ou média fidelidade
- relatório escrito
- storyboard ou fluxo de telas

O ideal é mostrar:
- problema identificado
- público-alvo
- persona
- fluxo da solução
- interface proposta
- justificativas de design
- acessibilidade aplicada
- melhorias feitas a partir do teste

---

## 12. Conclusão

Essa atividade pode ser muito rica quando os alunos usam as habilidades de IA para apoiar pesquisa, organização de ideias, proposta de solução e revisão de acessibilidade. A IA ajuda a estruturar o pensamento, mas a qualidade final depende da análise crítica do grupo, do entendimento do usuário e da aplicação real de princípios de UX e acessibilidade.

A combinação de:
- pesquisa
- definição de personas
- projeto de interfaces
- testes
- acessibilidade
- uso inteligente de IA

torna o trabalho mais próximo das práticas reais de design de produtos digitais.
