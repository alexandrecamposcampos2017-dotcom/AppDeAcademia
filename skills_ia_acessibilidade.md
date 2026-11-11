# Skills de IA para apoiar projetos de acessibilidade digital

Este documento reúne competências, práticas e ferramentas que ajudam uma IA (ou uma equipe usando IA) a apoiar melhor projetos de acessibilidade para sites, sistemas web e aplicativos.

## 1) Skills técnicas essenciais

### 1.1 Compreensão de requisitos acessíveis
- Entender leis e padrões relevantes: WCAG, ADA, Lei nº 13.146/2015, NBR 9050, EN 301 549.
- Converter requisitos legais em critérios de aceite de produto.
- Identificar público-alvo, necessidades e cenários reais de uso.
- Diferenciar acessibilidade de usabilidade e de conformidade legal.

### 1.2 Análise de interfaces e UX
- Avaliar contraste, hierarquia visual, legibilidade, foco, navegação e clareza.
- Identificar barreiras em menus, formulários, modais, cards, tabelas e fluxos de cadastro.
- Reconhecer dependência excessiva de mouse, cor, gestos ou texto em imagem.
- Propor alternativas para acesso por teclado, leitor de tela e toque.

### 1.3 HTML, semântica e ARIA
- Usar elementos semânticos corretamente: headings, landmaks, formulários, listas, botões, links, tables.
- Entender quando usar aria-label, aria-labelledby, aria-describedby, roles e states.
- Evitar misuse de ARIA e garantir que o HTML nativo seja preferido.
- Avaliar componentes customizados (accordion, tabs, modal, combobox, menu, dialogo).

### 1.4 Validação e testes
- Executar testes manuais com teclado, zoom e leitor de tela.
- Validar foco visível e ordem de tabulação.
- Testar fluxos críticos em mobile, desktop e telas pequenas.
- Identificar problemas em campos, erros de validação e mensagens dinâmicas.
- Usar ferramentas de análise automatizadas como Lighthouse, axe, WAVE e Pa11y.

### 1.5 Acessibilidade em app mobile
- Conhecer práticas do Android e iOS para labels, foco, ordem de leitura, toque, estados e feedback.
- Entender a importância de TalkBack, VoiceOver e suporte do sistema operacional.
- Avaliar acessibilidade de telas, notificações, formulários e componentes nativos.

## 2) Skills de conteúdo e comunicação

- Criar textos claros, curtos e objetivos.
- Identificar necessidade de alternativas textuais para imagens, infográficos e vídeos.
- Produzir legendas, transcrições e descrições adequadas.
- Redigir mensagens de erro e instruções acessíveis.
- Reformular linguagem para públicos com diferentes níveis de leitura e compreensão.

## 3) Skills de design inclusivo

- Trabalhar com contraste e contraste mínimo aplicável.
- Propor interfaces com foco visível, espaço adequado e layouts consistentes.
- Considerar público com baixa visão, daltonismo, mobilidade reduzida e neurodiversidade.
- Criar padrões visuais que evitem sobrecarga sensorial.
- Projetar para uso em diferentes dispositivos, tamanhos de tela e condições ambientais.

## 4) Skills de revisão e código

- Revisar código para detectar problemas de acessibilidade antes da entrega.
- Sugerir correções em HTML, CSS e JavaScript sem quebrar o comportamento funcional.
- Verificar que elementos interativos são focáveis, visíveis e operáveis por teclado.
- Analisar compatibilidade com tecnologias assistivas.
- Validar que o estado de loading, erro e sucesso é percebido por usuários que dependem de leitor de tela.

## 5) Skills de documentação e gestão

- Criar checklists e critérios de aceite para acessibilidade.
- Registar defeitos com severidade, impacto, rastreio e prioridade.
- Produzir documentação de critérios para design, desenvolvimento e QA.
- Estabelecer Definition of Done com acessibilidade integrada.
- Preparar backlog com itens de acessibilidade priorizados por negócio e impacto.

## 6) Habilidades de IA para apoiar esses objetivos

### 6.1 Pesquisa e organização
- Buscar padrões, normas e exemplos atualizados.
- Extrair regras relevantes para um projeto específico.
- Organizar referências por escopo, público e etapa do projeto.

### 6.2 Tradução de requisitos em tarefas
- Transformar requisitos legais e técnicos em itens de backlog.
- Criar critérios de aceite claros e verificáveis.
- Identificar dependências entre design, desenvolvimento, QA e conteúdo.

### 6.3 Revisão planejada
- Revisar continuamente páginas, fluxos e componentes em busca de falhas.
- Sugerir melhorias com foco em acessibilidade real, não apenas em ferramentas automáticas.
- Priorizar correções por impacto e risco.

### 6.4 Geração de documentação útil
- Produzir checklists, guias e modelos de requisitos.
- Resumir leis e padrões em linguagem prática para equipes.
- Criar materiais de referência para uso em projetos futuros.

## 7) Ferramentas e fontes relevantes

### Padronização e referência
- WCAG 2.2
- W3C WAI
- ARIA Authoring Practices Guide
- MDN Accessibility
- ADA Web Guidance
- Lei nº 13.146/2015 (Brasil)
- NBR 9050 / EN 301 549

### Ferramentas de teste
- Lighthouse
- axe DevTools
- WAVE
- Pa11y
- NVDA, VoiceOver, TalkBack, Narrator

## 8) Fluxo de trabalho ideal para IA

1. Coletar requisitos do projeto e do público.
2. Mapear telas/fluxos e pontos críticos.
3. Verificar uso de semântica, foco, contraste e teclado.
4. Avaliar conteúdo multimídia e formulários.
5. Gerar sugestões de correção e critérios de aceite.
6. Validar com testes automáticos e manuais.
7. Documentar risco, exceções e próximos passos.

## 9) Resumo prático

Uma IA pode ajudar muito em projetos de acessibilidade quando ela domina:
- padrões e leis
- UX inclusiva
- semântica e acessibilidade técnica
- revisão de código e testes
- documentação e planejamento

Essas competências ajudam a transformar acessibilidade em um processo contínuo, e não apenas em uma etapa final.
