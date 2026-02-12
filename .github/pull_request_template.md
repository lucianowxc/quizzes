## 📝 Descrição

<!-- Descreva brevemente o que este PR adiciona/muda -->

Tipo de mudança:
- [ ] 🎯 Novo quiz
- [ ] 🔧 Bugfix no código
- [ ] 🎨 Melhoria de UI/UX
- [ ] 📚 Documentação
- [ ] 🚀 Nova feature

---

## ✅ Checklist de Validação

### **Estrutura do Quiz (Obrigatório para novos quizzes)**

- [ ] **Arquivo JSON válido**
  - [ ] Sem erros de sintaxe (teste em `https://jsonlint.com/`)
  - [ ] Nomes de arquivo: `quiz` + descrição em camelCase (ex: `quizDragonBallZ.json`)

- [ ] **Campos obrigatórios presentes**
  - [ ] `title` (string, não vazio)
  - [ ] `questions` (array com ≥3 itens)
  - [ ] `descriptions` (objeto com ≥2 resultados)
  - [ ] `subtitle` (string, opcional mas recomendado)

- [ ] **Integridade de Dados**
  - [ ] ✅ Cada pergunta tem `question` (string) e `answers` (array)
  - [ ] ✅ Cada resposta tem `text` (string) e `points` (objeto)
  - [ ] ✅ Todos os result-keys em `points` existem em `descriptions`
  - [ ] ✅ Nenhum `points` ultrapassa 1.0 (máx 0.9 por resposta)

### **Qualidade do Conteúdo**

- [ ] **Acessibilidade de Respostas**
  - [ ] Respostas têm 5-100 caracteres cada
  - [ ] Emojis são relevantes e diversos (não repetir na mesma pergunta)
  - [ ] Linguagem é clara e divertida

- [ ] **Cobertura de Resultados**
  - [ ] ✅ Todos os ≥2 resultados são alcançáveis
  - [ ] ✅ Nenhum resultado "impossível" de obter
  - [ ] ✅ Documentação: deixe comentário listando caminho para cada resultado
    ```json
    // Caminho para "herói": Respostas 1, 2, 1 → hero: 3.0 pontos
    // Caminho para "vilão": Respostas 2, 1, 2 → villain: 3.5 pontos
    ```

- [ ] **Diversão & Tema**
  - [ ] Quiz mantém tom consistente (sarcástico, sério, leve, etc.)
  - [ ] Tem pelo menos 1 pergunta "criativa" ou "ousada"
  - [ ] Descrições dos resultados têm personalidade

### **Integração (Obrigatório se adicionando à lista)**

- [ ] **Entrada em `quizList.json`**
  - [ ] Adicionada no **final da array** (para aparecer primeira na UI)
  - [ ] Estrutura: `{ "name": "...", "file": "quizzes/nomeArquivo.json", "description": "..." }`
  - [ ] Descrição é atraente e menciona tipos de resultados

- [ ] **Testes Locais**
  - [ ] [ ] Rodou localmente: `python3 -m http.server 8000`
  - [ ] [ ] Quiz carrega sem erros no console do navegador
  - [ ] [ ] Todas as respostas funcionam
  - [ ] [ ] Todos os resultados aparecem quando selecionados

### **Branching Condicional (Se aplicável)**

- [ ] Quiz usa `id` + `nextQuestion` para branching? (veja `EVOLUTION.md`)
  - [ ] [ ] Cada pergunta tem `id` único
  - [ ] [ ] `nextQuestion` sempre aponta para um `id` válido
  - [ ] [ ] Sem loops infinitos de perguntas
  - [ ] [ ] Fluxo testado: começo → fim seguindo cada caminho

---

## 📊 Estatísticas do Quiz

<!-- Preencha para facilitar review -->

- **Número de perguntas:** X
- **Número de alternativas médio:** X
- **Número de resultados:** X
- **Usa branching condicional?** Sim / Não
- **Tamanho do arquivo:** ~X KB

---

## 🎯 Resultado

<!-- Se testou manualmente, qual resultado você recebeu? -->

Testei o quiz e recebi: **[Nome do resultado]** 🎉

---

## 📝 Notas Adicionais

<!-- Contexto sobre o quiz, inspirações, referências, etc. -->

---

## 🤖 Validação Automática

<!-- O script abaixo será rodado automaticamente (se GitHub Actions estiver configurado) -->

Para rodar validação local antes de fazer push:
```bash
node scripts/validate-quiz.js quizzes/nomeDoSeuQuiz.json
```

---

**Obrigado por contribuir! 🙌**
