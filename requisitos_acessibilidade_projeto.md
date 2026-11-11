# Modelo de Requisitos de Acessibilidade para Projeto Digital

Use este modelo para definir, implementar e validar requisitos de acessibilidade de um site, sistema web ou aplicativo. Substitua os campos entre colchetes e adapte os critérios ao produto.

> **Nota:** este documento é um modelo de trabalho, não um parecer jurídico nem uma declaração de conformidade. Confirme a legislação aplicável ao país, setor, público e contrato do projeto com as pessoas responsáveis. A WCAG 2.2 nível AA é uma meta técnica recomendada aqui; não substitui a verificação de requisitos legais específicos.

## 1. Identificação do projeto

| Campo | Preencher |
|---|---|
| Nome do produto/projeto | [Nome] |
| Responsável pelo produto | [Nome/equipe] |
| Responsável por acessibilidade | [Nome/equipe] |
| Plataformas | [Web responsiva / iOS / Android / outras] |
| Público e finalidade | [Quem usa e para quê] |
| Países/mercados atendidos | [Países ou regiões] |
| Data e versão deste documento | [Data / versão] |
| Fase atual | [Descoberta / design / desenvolvimento / manutenção] |

## 2. Objetivo e escopo

**Objetivo:** permitir que pessoas com diferentes habilidades, dispositivos e tecnologias assistivas possam perceber, compreender, navegar e usar o produto de forma independente e equivalente.

**Incluído no escopo:**
- [ ] Páginas e fluxos principais: [listar]
- [ ] Cadastro, autenticação e recuperação de conta
- [ ] Formulários, pagamentos e confirmações
- [ ] Conteúdo multimídia e documentos
- [ ] Componentes de terceiros: [listar]
- [ ] Aplicativos móveis: [listar plataformas e versões mínimas]
- [ ] E-mails, notificações ou outros pontos de contato digitais: [listar]

**Fora do escopo ou dependências:** [descrever, justificar e indicar alternativa acessível ou plano para resolver].

## 3. Referências e meta de conformidade

- **Meta técnica:** WCAG 2.2 nível AA para o conteúdo e os fluxos dentro do escopo, salvo critérios não aplicáveis devidamente justificados.
- **Referências de implementação:** W3C WAI, WCAG Understanding/Techniques e ARIA Authoring Practices Guide (APG) para widgets customizados.
- **Aplicativos nativos:** considerar também as APIs e recomendações de acessibilidade das plataformas iOS e Android.
- **Legislação e normas aplicáveis:** [identificar jurisdição e requisito específico após análise]. Para projetos no Brasil, avaliar, entre outras fontes pertinentes, a Lei nº 13.146/2015 e requisitos setoriais/contratuais. Não presumir que uma norma de acessibilidade física, por si só, define todos os requisitos de um produto digital.
- **Evidência de conformidade:** [relatórios de teste, lista de critérios aplicáveis, issues resolvidas, declaração aprovada por responsável].

**Decisões do projeto:**
- Padrão e versão: [ex.: WCAG 2.2]
- Nível: [ex.: AA]
- Data de revisão da aplicabilidade legal: [data / responsável]
- Critérios com exceção aprovada e justificativa: [listar ou “nenhum”]

## 4. Pessoas usuárias e contextos de uso

Considere, sem presumir que todas as pessoas de um grupo usem o produto da mesma forma:

- Pessoas cegas ou com baixa visão, incluindo uso de leitor de tela e ampliação.
- Pessoas surdas ou com deficiência auditiva.
- Pessoas com mobilidade ou destreza reduzidas, que navegam por teclado, voz, switch ou toque.
- Pessoas com deficiência cognitiva ou de aprendizagem e pessoas neurodivergentes.
- Pessoas com daltonismo, fotossensibilidade ou sensibilidade a movimento.
- Pessoas idosas, usuárias de telas pequenas, conexões lentas ou ambientes com distrações.

**Pesquisas e participação de pessoas com deficiência:** [método, participantes, acessibilidade da pesquisa, consentimento e remuneração, quando aplicável].

## 5. Requisitos funcionais e critérios de aceite

Os critérios abaixo são requisitos mínimos de projeto. Registre evidências e resultados em cada entrega. “Aprovado por ferramenta automática” não é suficiente para declarar conformidade.

| ID | Requisito verificável | Critério de aceite | Verificação |
|---|---|---|---|
| ACC-01 | Estrutura semântica | Títulos, regiões, listas, tabelas e controles usam semântica apropriada; títulos descrevem a seção e a hierarquia não é usada apenas para aparência. | Inspeção de código + leitor de tela |
| ACC-02 | Alternativas textuais | Imagens informativas têm texto alternativo equivalente à finalidade; imagens decorativas são ignoradas por tecnologia assistiva; gráficos têm resumo e dados/tabela quando necessário. | Inspeção de conteúdo + leitor de tela |
| ACC-03 | Teclado | Todas as funções estão disponíveis sem mouse; a ordem de foco é lógica; não há armadilha de teclado; controles customizados seguem interação esperada. | Teste manual só com teclado |
| ACC-04 | Foco | O foco é visível, não fica encoberto por conteúdo fixo e retorna de forma previsível ao fechar diálogos ou concluir ações. | Teste manual por teclado |
| ACC-05 | Contraste e cor | Texto, controles, estados e indicadores visuais atendem aos critérios WCAG aplicáveis; informação não depende apenas de cor. | Analisador + revisão visual |
| ACC-06 | Ampliação e reflow | A 200% de zoom e em largura equivalente a 320 CSS px, o conteúdo e as funções permanecem disponíveis sem rolagem em duas direções, exceto conteúdo que realmente exige layout bidimensional. | Teste em navegador |
| ACC-07 | Texto e legibilidade | O conteúdo usa linguagem clara; espaçamento de texto pode ser aumentado conforme o critério aplicável sem perda de conteúdo ou função. | Revisão editorial + teste |
| ACC-08 | Formulários | Cada campo tem rótulo/instrução programaticamente associada; obrigatoriedade e formato são claros; erros identificam o campo e explicam como corrigir; sucesso e falha são anunciados. | Teste teclado + leitor de tela |
| ACC-09 | Links e controles | Nome acessível descreve a ação ou destino; controles têm alvo de interação adequado e distinguível; links não dependem apenas do contexto visual. | Inspeção + teclado/leitor |
| ACC-10 | Mídia | Vídeos pré-gravados têm legendas sincronizadas; conteúdo de áudio tem alternativa textual quando necessária; descrição de informação visual é fornecida quando aplicável. | Revisão de mídia |
| ACC-11 | Movimento e tempo | Animação, atualização automática e limites de tempo podem ser pausados, interrompidos, ocultados ou estendidos conforme os critérios aplicáveis; respeitar preferência por movimento reduzido quando possível. | Teste funcional/configuração |
| ACC-12 | Mensagens dinâmicas | Atualizações de estado importantes (ex.: carregamento, resultado, erro) são expostas de modo programático sem mover foco indevidamente. | Leitor de tela + inspeção |
| ACC-13 | Idioma e nomes | Idioma principal da página/tela é definido; mudanças de idioma relevantes são identificadas; nomes, papéis, valores e estados de controles são programaticamente determináveis. | Inspeção + leitor de tela |
| ACC-14 | Autenticação | A autenticação não exige teste cognitivo inacessível; há meios acessíveis de concluir, revisar ou corrigir a autenticação e recuperar a conta. | Teste dos fluxos |
| ACC-15 | Ajuda consistente | Ajuda, contato e instruções disponíveis aparecem de forma previsível; mecanismos de ajuda não ocultam conteúdo ou foco. | Inspeção de fluxos |
| ACC-16 | Orientação e toque | A interface funciona em diferentes orientações quando possível; gestos complexos têm alternativa simples; alvos de toque atendem aos critérios aplicáveis. | Testes em dispositivos |
| ACC-17 | Componentes ARIA | HTML nativo é preferido. ARIA só é usada quando necessário, com papel, nome, estado e teclado compatíveis com o padrão do componente. | Inspeção + APG + AT |
| ACC-18 | Documentos anexos | PDFs e outros documentos disponibilizados têm estrutura, ordem de leitura, idioma e alternativas acessíveis; existe alternativa em HTML quando necessária. | Verificação do documento |

**Regra para aceite:** um requisito só é aprovado quando todos os critérios de aceite associados foram verificados no fluxo e nas plataformas acordadas. Registre falhas como defeitos, com severidade, impacto, responsável e prazo.

## 6. Requisitos de compatibilidade e ambiente

| Item | Definição do projeto |
|---|---|
| Navegadores e versões suportados | [Lista] |
| Sistemas operacionais/dispositivos | [Lista] |
| Tecnologias assistivas representativas | [Ex.: NVDA + Firefox/Chrome; VoiceOver + Safari/iOS; TalkBack + Chrome/Android] |
| Métodos de entrada | [Teclado, toque, voz, switch, mouse] |
| Dispositivos para testes | [Lista] |

A matriz deve refletir o público e o suporte real do produto. Não é necessário testar todas as combinações possíveis; selecione combinações representativas e documente o motivo.

## 7. Plano de testes

### Testes automatizados
- Executar ferramentas de análise em páginas e estados relevantes, não apenas na página inicial.
- Integrar verificações de acessibilidade ao CI quando viável.
- Registrar ferramenta, versão, páginas cobertas e limitações conhecidas.

### Testes manuais obrigatórios
- Percorrer os fluxos críticos apenas com teclado.
- Conferir foco, ordem de navegação, diálogos, menus e componentes interativos.
- Testar leitor de tela nas combinações representativas da matriz.
- Verificar zoom/reflow, contraste, conteúdo multimídia, erros e confirmações de formulários.
- Testar dispositivos móveis com tecnologias assistivas nativas.

### Testes com pessoas
- Convidar pessoas com diferentes deficiências para testar tarefas reais, quando possível.
- Fornecer ambiente, instruções e remuneração acessíveis.
- Registrar barreiras observadas sem tratar a participação de uma pessoa como representação de todo um grupo.

### Evidências por entrega
- [ ] Relatório de ferramentas automáticas e itens revisados manualmente
- [ ] Casos de teste e combinações de navegador/tecnologia assistiva
- [ ] Defeitos abertos, resolvidos e aceitos como exceção, com justificativa
- [ ] Resultado de teste com usuários ou motivo documentado para não realização

## 8. Priorização de defeitos

| Prioridade | Orientação para triagem |
|---|---|
| Bloqueador | Impede concluir uma tarefa essencial para um grupo de usuários e não há alternativa acessível. Corrigir antes da publicação do fluxo afetado. |
| Alta | Cria barreira importante, perda de informação ou risco de erro em uma tarefa relevante. Corrigir antes da publicação ou com mitigação formal aprovada. |
| Média | Causa dificuldade, inconsistência ou esforço adicional, mas há alternativa utilizável. Planejar correção com prazo. |
| Baixa | Problema de impacto limitado ou melhoria incremental. Registrar e priorizar no backlog. |

Defina a prioridade com base no impacto real, na frequência, na criticidade da tarefa e na existência de alternativa — não apenas no resultado de uma ferramenta.

## 9. Processo e responsabilidades

| Atividade | Responsável | Quando |
|---|---|---|
| Definir critérios e escopo de acessibilidade | [Produto + acessibilidade] | Descoberta e planejamento |
| Revisar fluxos, conteúdo e protótipos | [Design + conteúdo] | Antes da implementação |
| Construir componentes reutilizáveis acessíveis | [Engenharia] | Durante desenvolvimento |
| Testar critérios automatizados e manuais | [QA + engenharia + acessibilidade] | Em cada entrega |
| Validar com pessoas usuárias | [Pesquisa + produto] | [Frequência/marcos] |
| Aprovar exceções e risco residual | [Responsável autorizado] | Antes do aceite/publicação |
| Monitorar regressões e atualizar o documento | [Equipe responsável] | Contínuo |

**Definição de pronto (DoD):** uma funcionalidade não está pronta enquanto os critérios aplicáveis não forem testados, defeitos bloqueadores/altos não tiverem tratamento aprovado e evidências não estiverem registradas.

## 10. Registro de exceções e riscos

| ID | Critério afetado | Motivo e impacto | Alternativa/mitigação | Responsável | Prazo de revisão | Aprovação |
|---|---|---|---|---|---|---|
| [EX-01] | [Critério] | [Detalhe] | [Mitigação] | [Nome] | [Data] | [Nome/data] |

Exceções devem ser específicas, temporárias quando possível e acompanhadas de uma alternativa acessível. Não registrar “não aplicável” sem justificativa.

## 11. Backlog de implementação

| ID | Tela/componente/fluxo | Problema ou requisito | Prioridade | Responsável | Prazo | Status | Evidência |
|---|---|---|---|---|---|---|---|
| [ACC-ISSUE-01] | [Local] | [Descrição verificável] | [Bloqueador/Alta/Média/Baixa] | [Nome] | [Data] | [Aberto/Em andamento/Resolvido] | [Link] |

## 12. Aprovação

| Papel | Nome | Decisão | Data |
|---|---|---|---|
| Produto | [Nome] | [Aprovado / pendente] | [Data] |
| Design | [Nome] | [Aprovado / pendente] | [Data] |
| Engenharia | [Nome] | [Aprovado / pendente] | [Data] |
| Acessibilidade/QA | [Nome] | [Aprovado / pendente] | [Data] |

**Observações e riscos aceitos:** [Preencher]

## 13. Referências

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WAI, visão geral das WCAG: https://www.w3.org/WAI/standards-guidelines/wcag/
- W3C, ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- MDN, acessibilidade: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
- Brasil, Lei nº 13.146/2015: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
