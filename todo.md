# 🛠️ Todo List — lucianowxc/quizzes

## 🐛 Bugs (atacar primeiro)

- [ ] **`script.js` carregado duas vezes no `index.html`**
  - Remover a tag `<script src="script.js">` do `<head>` (linha 7)
  - Manter apenas a que está antes do `</body>`
  - _Risco atual: `DOMContentLoaded` dispara em duplicata, podendo causar comportamento imprevisível_

- [ ] **Dark mode via JS é frágil**
  - Remover a função `updateDarkModeStyles()` e todas as suas chamadas em `script.js`
  - Substituir todas as regras `.elemento.dark-mode { }` no CSS por `body.dark-mode .elemento { }`
  - _Resultado: dark mode propaga automaticamente para elementos criados dinamicamente_

- [ ] **`previousQuestion` em `decision-tree.js` ignora branching**
  - Substituir `currentQuestionIndex--` por uma lógica de histórico como já existe em `script.js` (`questionHistory`)
  - _Risco atual: em quizzes com branching, "Anterior" volta para a pergunta errada_

---

## ⚠️ Qualidade e Robustez

- [ ] **`loadUploadedQuiz` não trata JSON malformado**
  - Adicionar try/catch no `JSON.parse` dentro do `FileReader.onload`
  - Exibir mensagem amigável em caso de erro (igual ao `loadQuizFromPost`)

- [ ] **`validate-quiz.js` não verifica `nextQuestion` obrigatório em branching**
  - Após detectar `hasBranching = true`, checar se toda resposta tem `nextQuestion` explícito
  - Adicionar como `warning` (não `error`) para não quebrar quizzes lineares

- [ ] **`auto-add-quiz.js` usa `subtitle` como descrição na lista**
  - Gerar descrição automática mais informativa, ex:
    `"${quizData.questions.length} perguntas, ${Object.keys(quizData.descriptions).length} resultados possíveis"`
  - Ou adicionar suporte a campo `listDescription` dedicado no JSON do quiz

- [ ] **`updateProgress()` definida mas nunca chamada em `script.js`**
  - Chamar `updateProgress()` dentro de `showQuestion()`
  - Ou remover a função se não for usar

---

## 🧹 Organização

- [ ] **Duplicação entre `script.js` e `decision-tree.js`**
  - Criar `quiz-utils.js` com as funções compartilhadas:
    - `generateQuestionIds(quizData)`
    - `getQuestionIndexById(quizData, id)`
    - lógica de branching do `selectAnswer`
  - Importar nos dois arquivos com `<script src="quiz-utils.js">`

- [ ] **Variáveis globais em `script.js`**
  - Agrupar `quizData`, `currentQuestionIndex`, `scores`, `selectedAnswers`, `questionHistory` em um objeto `quizState`, igual ao padrão já adotado em `decision-tree.js`

- [ ] **`sendSuggestion` tenta anexar arquivo via `mailto:`**
  - `attachment` em `mailto:` não é suportado por nenhum cliente moderno — o arquivo é silenciosamente ignorado
  - Alternativas simples: GitHub Issue template ou Google Form linkado no footer

---

## ⚡ Funcionalidades Novas Sugeridas

- [ ] **Barra de progresso visual durante o quiz**
  - Mostrar `Pergunta X de Y` com uma barra de progresso (já existe função `updateProgress()` mas sem UI)
  - Em quizzes com branching, mostrar progresso estimado (ex: profundidade na árvore)

- [ ] **Resultado com top 3, não só o 1º lugar**
  - Mostrar os 3 resultados com maior pontuação e suas porcentagens relativas
  - Útil para quizzes onde o usuário fica "no limite" entre dois resultados

- [ ] **Busca/filtro na lista de quizzes**
  - Campo de texto que filtra os cards em tempo real por nome ou descrição
  - Especialmente útil agora que o acervo está crescendo bastante

- [ ] **Tags por categoria nos quizzes**
  - Adicionar campo opcional `tags: ["mtg", "pop", "games"]` no JSON
  - Filtro por tag na listagem

- [ ] **Tempo estimado de quiz**
  - Calcular automaticamente a partir do número de perguntas (ex: ~2 min para 10 perguntas)
  - Mostrar no card antes de começar

- [ ] **`validate-quiz.js` com flag `--strict` para checar cobertura de branching**
  - Verificar que todos os caminhos possíveis chegam à pergunta final
  - Detectar resultados inalcançáveis em quizzes com branching

---

## 🎨 Aparência e Navegabilidade

- [ ] **Botões de configuração (dark mode / animação) com visual de toggle**
  - Atualmente são links de texto com ❌/✅ — pouco intuitivo
  - Substituir por um toggle switch CSS (sem dependência externa)

- [ ] **Cards de quiz com tamanho uniforme**
  - Usar `grid` com `align-items: stretch` para que todos os cards tenham a mesma altura independente do tamanho da descrição

- [ ] **Animação de entrada nos cards da lista**
  - Fade-in escalonado ao carregar a lista (`animation-delay` crescente por card)
  - Leve e não invasivo, combinaria bem com o estilo atual

- [ ] **Feedback visual ao copiar link (share)**
  - Atualmente usa `alert()` — trocar por um toast/snackbar temporário que aparece e some sozinho

- [ ] **Estado de foco mais visível nos botões de resposta**
  - Acessibilidade: o outline atual está desabilitado no CSS (`:focus { outline: none }`)
  - Adicionar um outline estilizado compatível com o tema, especialmente para navegação por teclado

- [ ] **Meta tags de compartilhamento (Open Graph)**
  - Adicionar `<meta property="og:title">`, `og:description` e `og:image>` dinâmicos
  - Quando alguém compartilha o link de um quiz, o preview no WhatsApp/Twitter fica mais rico
