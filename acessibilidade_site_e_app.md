# Guia de Acessibilidade para Sites e Aplicativos

Este documento serve como base para desenvolver produtos digitais acessíveis para diferentes públicos e deficiências. Ele reúne leis, padrões, princípios e métodos práticos que podem ser usados no planejamento, design, desenvolvimento, testes e manutenção.

Importante: este material não substitui assessoria jurídica nem a leitura dos textos originais das normas aplicáveis ao seu país e ao seu tipo de produto.

## 1) Leis, normas e padrões relevantes

### 1.1 WCAG (W3C)

- Norma internacional mais usada para acessibilidade web.
- Documentos oficiais: W3C WAI / WCAG 2.2
- Base: 4 princípios: Perceptível, Operável, Compreensível e Robusto (POUR)
- Níveis de conformidade: A, AA e AAA
- Uso comum em lei, políticas públicas, contratos e requisitos de acessibilidade

Principais requisitos frequentemente exigidos:
- Textos e imagens com alternativa adequada
- Contraste suficiente entre texto e fundo
- Navegação por teclado
- Foco visível
- Legibilidade e estrutura semântica correta
- Formulários com labels, mensagens de erro claras e validações acessíveis
- Vídeos com legendas, áudios com transcrição quando relevante
- Evitar conteúdo que cause convulsão ou distração excessiva
- Compatibilidade com tecnologias assistivas
- Interfaces acessíveis em dispositivos móveis e com zoom

### 1.2 ADA (Estados Unidos)

- Americans with Disabilities Act
- Acessibilidade de sites e apps no contexto de serviços públicos e negócios abertos ao público
- Requisitos frequentemente referem-se a boas práticas de acessibilidade e ao uso de WCAG como referência técnica
- O objetivo é remover barreiras digitais para pessoas com deficiência

Exemplos de barreiras comuns:
- Falta de contraste
- Ícones sem texto ou sem contexto semântico
- Formulários sem label ou sem indicação clara de erro
- Navegação impossível por teclado
- Uso de cor como único meio de informação
- Vídeos sem legenda

### 1.3 Lei nº 13.146/2015 (Brasil)

- Estatuto da Pessoa com Deficiência
- Brasil: lei federal que fortalece a inclusão e a acessibilidade em serviços, produtos e ambientes
- A regra vale para atividades de Estado, empresas e serviços públicos/privados quando aplicáveis
- A acessibilidade digital considera uso de tecnologias assistivas, acessibilidade web, interface e conteúdo

Pontos relevantes para projeto digital:
- Acesso universal às tecnologias de informação e comunicação
- Eliminação de barreiras digitais em produtos e serviços
- Inclusão de pessoas com deficiência em todos os níveis de uso
- Atendimento a padrões técnicos e boas práticas de acessibilidade

### 1.4 NBR 9050 (Brasil)

- Norma brasileira da ABNT relacionada a acessibilidade
- Amplamente citada em projetos e requisitos de acessibilidade em espaços, mobiliário, ambientes e também em aspectos de tecnologia e uso
- Importante para orientar requisitos de acessibilidade e usabilidade em contextos digitais e híbridos

### 1.5 EAA / EN 301 549 (União Europeia)

- European Accessibility Act
- EN 301 549: requisitos de acessibilidade para produtos e serviços de TIC
- No contexto de sites e aplicativos, o WCAG costuma ser referência central para conformidade técnica

## 2) Princípios fundamentais da acessibilidade digital

### 2.1 POUR (WCAG)

1. Perceptível
   - O conteúdo deve ser percebido por todos os usuários
   - Ex.: text alternatives, contraste, legendas, áudio descritivo, layout claro

2. Operável
   - Usuários devem conseguir interagir com a interface
   - Ex.: navegação por teclado, foco visível, controle de tempo, sem traps de foco

3. Compreensível
   - A interface e a informação devem ser fáceis de entender
   - Ex.: linguagem simples, instruções claras, previsibilidade, mensagens de erro úteis

4. Robusto
   - O conteúdo deve funcionar com diferentes tecnologias assistivas e browsers
   - Ex.: uso correto de HTML semântico, compatibilidade com leitores de tela, ARIA quando necessário

## 3) Tipos de público e deficiências a considerar

### 3.1 Pessoas com deficiência visual

- Baixa visão, cegueira total, daltonismo
- Necessidades:
  - Alto contraste
  - Zoom sem perda de informação
  - Texto alternativo em imagens
  - Semântica correta em títulos, listas e botões
  - Leitores de tela
  - Nomes acessíveis em controles

### 3.2 Pessoas com deficiência auditiva

- Surdez total ou parcial
- Necessidades:
  - Legendas em vídeos
  - Transcrições de áudio
  - Conteúdo textual equivalente
  - Avisos visuais para sons importantes

### 3.3 Pessoas com deficiência motora

- Dificuldade para usar mouse ou touchscreen
- Necessidades:
  - Navegação completa por teclado
  - Foco visível
  - Botões com área adequada
  - Tempo suficiente para interações
  - Evitar gestos complexos ou dependência de precisão

### 3.4 Pessoas com deficiência cognitiva e de aprendizagem

- Dificuldade de atenção, memória, leitura e compreensão
- Necessidades:
  - Linguagem simples e direta
  - Estruturas consistentes
  - Menos distrações
  - Mensagens claras e feedbacks visuais
  - Sequências de passos previsíveis
  - Evitar sobrecarga de informação

### 3.5 Pessoas com neurodiversidade

- Autismo, TDAH, ansiedade, dificuldades sensoriais
- Necessidades:
  - Layout consistente
  - Sem excesso de movimento ou brilho forte
  - Botões e fluxos simples
  - Menos elementos disputando atenção
  - Opções para reduzir ruído visual

### 3.6 Idosos e público em contexto de uso diversificado

- Diminuição de visão, mobilidade e atenção
- Necessidades:
  - Tipografia legível
  - Tamanho de touch targets adequado
  - Navegação simples e previsível
  - Contraste e espaçamento adequados

## 4) Métodos de design inclusivo

### 4.1 Design Universal

- Criar soluções úteis para o maior número possível de pessoas
- Evitar adaptar depois; incluir acessibilidade desde o início
- Focar em jornada, clareza e contexto de uso

### 4.2 Design centrado no usuário

- Testar com pessoas de perfis diferentes
- Coletar feedback real de uso com tecnologias assistivas
- Considerar diferentes velocidades, dispositivos e condições ambientais

### 4.3 Design para contexto real

- Considerar luz solar forte, telas pequenas, rede lenta, baixa experiência com tecnologia, pessoas em movimento
- Aplicativo e site devem funcionar em diferentes condições de uso

### 4.4 Linguagem e comunicação

- Preferir linguagem simples e direta
- Usar textos curtos, instruções claras, feedback explícito
- Evitar jargões e ambiguidade

## 5) Métodos de desenvolvimento acessível

### 5.1 HTML semântico

Use elementos semânticos corretamente:
- h1, h2, h3 para títulos
- nav, main, header, footer, section, article
- button para ações interativas
- a para navegação
- form, label, fieldset, legend para formulários
- ul/ol/li para listas
- img com alt apropriado, ou alt vazio quando a imagem for decorativa

### 5.2 Atributos e nomes acessíveis

- Labels visuais e programáticos claros
- aria-label, aria-labelledby e aria-describedby quando necessário
- Garantir nome acessível para componentes complexos
- Não usar ARIA como substituto de HTML semântico básico

### 5.3 Navegação por teclado

- Todos os controles interativos devem receber foco
- Ordem lógica de tabulação
- Foco visível e forte
- Teclas Esc, Enter, Space e setas devem funcionar conforme padrão
- Evitar “focus trap” e comportamento estranho de teclado

### 5.4 Formulários acessíveis

- Labels associadas corretamente
- Mensagens de erro claras e próximas ao campo
- Indicador de erro sem depender apenas de cor
- Validações com retorno explícito e acessível
- Campo obrigatório sinalizado de forma textual e visual

### 5.5 Imagens, mídia e conteúdos multimídia

- Imagens: alt text relevante
- Ícones e botões: sempre com texto acessível ou aria-label
- Vídeos: legendas, transcrição e, quando necessário, audiodescrição
- Áudio: botão de pausa, controle de volume e transcrição

### 5.6 Contraste e tipografia

- Texto com contraste mínimo adequado (geralmente 4.5:1 para texto normal e 3:1 para textos grandes)
- Evitar texto muito pequeno ou muito leve
- Dar atenção a links, botões, estados hover, focus e disabled

### 5.7 Scroll, movimento e animação

- Evitar efeitos que causem tontura, distração ou desorientação
- Permitir reduzir movimento quando o usuário preferir
- Não depender de animações para transmitir informação

### 5.8 Componentes complexos

Para widgets customizados (menu, modal, tabs, accordion, combobox, carousel):
- implementar teclado conforme padrões
- atribuir roles e estados ARIA quando apropriado
- manter foco na lógica do componente
- informar status e mudanças para leitores de tela

### 5.9 Responsividade e acessibilidade em mobile

- Botões com tamanho apropriado
- Touch targets confortáveis
- Texto sem zoom forçado
- Layout adaptável sem perda de leitura
- Navegação por voz, teclado externo e tecnologias assistivas mobile

## 6) Checklist de validação e testes

### Testes manuais

- Navegação completa por teclado
- Verificação de foco em todos os elementos
- Leitura com leitores de tela
- Zoom 200% e 400%
- Uso em mobile por voz e teclado
- Validação de contraste
- Teste com formulário e estados de erro
- Verificação de legendas e textos alternativos

### Testes automáticos

- Lighthouse
- axe DevTools
- WAVE
- Pa11y
- ESLint / plugins de acessibilidade quando aplicável

### Testes com tecnologias assistivas

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- Narrator (Windows)
- TalkBack (Android)
- ChromeVox / Orca em Linux

### Testes com representatividade real

- Usuários com baixa visão
- Usuários cegos
- Usuários com mobilidade reduzida
- Usuários surdos e com deficiência auditiva
- Usuários com dificuldades cognitivas

## 7) Checklist de projeto e desenvolvimento

### Design

- Contraste adequado
- Tipografia legível
- Espaçamento suficiente
- Ícones com contexto
- Foco visível
- Elementos consistentes
- Facilitar leitura e compreensão
- Menos excesso visual
- Feedback claro para ações

### Desenvolvimento

- HTML semântico
- Labels e nomes acessíveis
- Boas práticas de ARIA
- Navegação por teclado
- Estado de foco e validação visível
- Redução de movimento
- Texto alternativo e legendas
- Mensagens acessíveis em formulários
- Compatibilidade com leitor de tela

## 8) Boas práticas para implementação em apps e sites

### Para sites

- Estrutura HTML clara
- Cabeçalhos bem organizados
- Navegação consistente
- Menus acessíveis
- Forms acessíveis
- Conteúdo em texto e não só imagens
- Sem conteúdo dependente apenas de clique ou hover

### Para apps mobile

- Definir “talkback”/VoiceOver labels
- Botões com área de toque adequada
- Ordem de foco e leitura acessível
- Estados de tela explicitamente anunciados
- Informações de erro legíveis por leitor de tela
- Suporte a acessibilidade do sistema operacional

## 9) Regras práticas para planejamento

- Incluir acessibilidade desde a ideia inicial, não como correção final
- Definir critérios-chave de aceitação para a equipe
- Incluir testes em cada sprint ou entrega
- Exigir revisão de acessibilidade em componentes reutilizáveis
- Treinar equipe de design, produto e desenvolvimento
- Documentar padrões de acessibilidade para o projeto

## 10) Resumo de referência rápida

Se você quiser começar com o essencial, siga estas prioridades:

1. Estrutura semântica correta
2. Conteúdo textual claro e legível
3. Contraste adequado
4. Navegação por teclado
5. Foco visível
6. Labels e mensagens de erro em formulários
7. Alternativas para imagens e mídias
8. Legendas e transcrições
9. Testes com leitores de tela e teclado
10. Validação com usuários reais

## 11) Fontes e referências úteis

- W3C – WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C – WCAG Overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- W3C – ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- ADA – Web Guidance: https://www.ada.gov/resources/web-guidance/
- MDN – Accessibility: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
- Lei nº 13.146/2015 (Brasil): Estatuto da Pessoa com Deficiência
- NBR 9050 (ABNT)
- EN 301 549 / EAA (UE)

## 12) Modelo de checklist para uso em projetos

### Checklist mínimo por entrega

- [ ] Conteúdo e interface acessíveis com navegação por teclado
- [ ] Foco visível em todos os elementos interativos
- [ ] Contraste adequado
- [ ] Labels e textos alternativos corretos
- [ ] Formulários com mensagens de erro claras
- [ ] Vídeos com legenda e áudios com transcrição quando necessário
- [ ] Layout responsivo e legível em mobile
- [ ] Sem dependência exclusiva de mouse
- [ ] Redução de movimento e ausência de distrações excessivas
- [ ] Testes com leitor de tela e teclado realizados

## 13) Conclusão

Acessibilidade não é um detalhe opcional. Ela é parte de qualidade, inclusão, conformidade legal e experiência de uso. A melhor abordagem é tratar acessibilidade como requisito do produto desde o início, e não como etapa final. Em projetos digitais, o mais eficiente é combinar:

- padrões internacionais (WCAG)
- legislação local aplicável
- design inclusivo
- desenvolvimento semântico e acessível
- testes reais com pessoas e tecnologias assistivas

Com essas bases, é possível criar soluções digitais que atendam a públicos diversos e reduzam barreiras de uso de forma consistente.
