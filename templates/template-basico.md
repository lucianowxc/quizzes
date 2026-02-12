**📜 Roteiro Otimizado para Criação de Quizzes com Branching (Versão 3.0)**  

*Elimina redundâncias, integra as melhores práticas criativas e adiciona suporte nativo a caminhos condicionais.*

---

### 🧠 **Objetivo**  
Este roteiro deve ser seguido **integralmente** sempre que você (IA) receber a tarefa de criar um quiz de personalidade. Ele substitui as versões anteriores, sendo mais enxuto, focado em criatividade e compatível com quizzes lineares ou com **branching**.

---

### 1️⃣ **Template JSON Unificado**  
Use esta estrutura. Os campos `id` e `nextQuestion` são **opcionais** – só os utilize se o quiz exigir caminhos diferentes conforme a resposta.

```json
{
  "title": "Título Criativo e Instigante",
  "subtitle": "Subtítulo que desperta curiosidade",
  "questions": [
    {
      "id": "q1",                      // opcional, obrigatório apenas em branching
      "question": "Texto da pergunta",
      "answers": [
        {
          "text": "🎲 Resposta concisa (máx 60 caracteres)",
          "emoji": "🎲",              // emoji único na resposta (não se repete na mesma pergunta)
          "points": {
            "resultado_id": 0.7,      // máximo 0.9 por resposta
            "outro_id": 0.2           // 20-30% das respostas com múltiplos pontos
          },
          "nextQuestion": "q2a"       // opcional, aponta para o ID da próxima pergunta
        }
      ]
    }
  ],
  "descriptions": {
    "resultado_id": {
      "title": "Nome Memorável",
      "emoji": "🔮",                 // emoji exclusivo do resultado
      "subtitle": "Frase curta que resume o arquétipo",
      "text": "Descrição com 2 frases: 1ª metáfora impactante, 2ª aplicação prática."
    }
  }
}
```

---

### 2️⃣ **Fluxo de Criação – Passo a Passo**

#### 🟢 **Passo 1 – Receber os Parâmetros**  
O usuário fornecerá (ou você deve solicitar) os seguintes dados:

- **Tema do quiz**  
- **Número de perguntas**  
- **Número de alternativas por pergunta** (padrão: 4)  
- **Número de resultados** (arquétipos)  
- **Complexidade** (baixa / média / alta) – influencia o tipo de pergunta  
- **Nível de atrevimento** (baixo / médio / altíssimo) – permite humor, ironia, cutucadas  
- **Usa branching?** (sim / não) – se sim, descreva superficialmente a lógica dos caminhos  

Caso algum parâmetro não seja informado, **sugira valores padrão criativos** (ex: 8 resultados, 10 perguntas, nível médio).

---

#### 🟢 **Passo 2 – Criar os Resultados (Arquétipos)**  
Gere os `descriptions` seguindo **rigorosamente** estas regras criativas:

✅ **Ordem progressiva** – organize os resultados do mais “fundamental” ao mais “transformador”.  
✅ **Título + emoji exclusivo** – emoji deve representar o arquétipo de forma **não óbvia** (ex: para “líder” não use 👑, use 🧭 ou ⚙️).  
✅ **Subtítulo** – uma posição ou característica marcante (ex: “O Iniciante Corajoso”, “A Mente Estratégica”).  
✅ **Descrição** – exatamente 2 frases:  
   1. Metáfora impactante (“Você é uma bússola que aponta para o impossível.”)  
   2. Aplicação prática (“No trabalho, é quem transforma caos em roteiro.”)  

🔁 **Exemplo pronto** (tema: instrumentos musicais):
```json
"violino": {
  "title": "Violino Eletrizante",
  "emoji": "🌀",
  "subtitle": "A Melodia Inesperada",
  "text": "Você é a faísca que ninguém viu chegar. Capaz de emocionar e surpreender até nos momentos mais técnicos."
}
```

---

#### 🟢 **Passo 3 – Criar Perguntas e Respostas (em blocos de 3)**  
Para evitar estouro de tokens, **gere as perguntas em grupos de 3**. A cada grupo, forneça o JSON parcial atualizado.

**Diretrizes obrigatórias para perguntas:**  

| Tipo                    | % aproximada | Exemplo                                                                 |
|-------------------------|--------------|-------------------------------------------------------------------------|
| Cotidiano/situacional   | 40%          | “Num happy hour inesperado, você…”                                      |
| Preferência pessoal     | 30%          | “Seu superpoder dos sonhos?”                                            |
| Existencial / filosófico| 20%          | “O que te faz perder a noção do tempo?”                                 |
| Aleatório lúdico        | 10%          | “Se você fosse um animal totem, qual seria?”                            |

**Regras para as respostas:**  

- **Emoji não literal**: Evite associações óbvias. Para “criatividade” não use 💡, use 🧩, 🎨, 🌪️.  
- **Texto curto**: Máximo 60 caracteres, ideal 40.  
- **Pontuação fracionada**:  
  - Nenhuma resposta pode ter soma de pontos > **0.9**.  
  - **20 a 30% das respostas** devem pontuar em **múltiplos resultados** (ex: 0.5 + 0.3).  
  - Varie os decimais (0.3, 0.7, 0.6, 0.2) – evite usar sempre 0.5 ou 1.0.  
- **Branching**: Se o quiz tiver caminhos diferentes, defina `id` na pergunta e `nextQuestion` na resposta.  
  - Os IDs devem seguir um padrão legível (q1, q2a, q2b, q3a1, q3a2…).  
  - Todo ID referenciado em `nextQuestion` **precisa existir** no array `questions`.  
  - Não crie loops infinitos (grafos acíclicos).  

---

#### 🟢 **Passo 4 – Validar Cobertura dos Resultados**  
Após todas as perguntas prontas, **comprove que cada resultado é alcançável**:

- **Quiz linear**: Apresente uma combinação de respostas (ex: 1A, 2C, 3B…) que maximize a pontuação daquele resultado.  
- **Quiz com branching**: Apresente um **caminho válido** (sequência de `nextQuestion`) que leve à maior pontuação para o resultado.  

Se algum resultado ficar com pontuação máxima muito baixa ou inalcançável, **ajuste os pontos** de algumas respostas.

---

#### 🟢 **Passo 5 – Montar o JSON Final e a Entrada para a Lista**  
1. **JSON do quiz**: Combine `title`, `subtitle`, `questions` e `descriptions` em um único objeto.  
2. **Nome do arquivo**: Use o formato `quizzes/temaSemEspacos.json` (ex: `quizzes/quemEVoceNaFesta.json`).  
3. **Entrada para quizList.json**:  
   ```json
   {
     "name": "Título do Quiz",
     "file": "caminho/do/arquivo.json",
     "description": "Frase instigante que mencione a variedade de resultados (ex: 'Descubra qual arquétipo rege sua carreira!')"
   }
   ```

---

### 3️⃣ **Check‑List de Qualidade (obrigatório)**  

Antes de entregar, verifique:

- [ ] **Resultados**: todos têm emoji único, subtítulo e descrição de 2 frases.  
- [ ] **Perguntas**: mix de tipos, sem repetição de emoji na mesma questão.  
- [ ] **Pontuação**: soma por resposta ≤ 0.9, 20-30% com múltiplos destinos.  
- [ ] **Cobertura**: todos os resultados têm caminho válido demonstrado.  
- [ ] **Branching**: se usado, IDs são únicos, `nextQuestion` existe e não há loops.  
- [ ] **Arquivo**: nome consistente e entrada `quizList.json` gerada.  

---

### 🧪 **Exemplo Rápido de Branching**  

**Tema:** “Qual seu destino de férias?”  
**Resultados:** `praia`, `montanha`, `cidade`  
**Pergunta 1 (id: q1):**  
- “Quero relaxar” → `nextQuestion: q2_praia`  
- “Quero aventura” → `nextQuestion: q2_montanha`  
- “Quero cultura” → `nextQuestion: q2_cidade`  

**Pergunta 2_praia (id: q2_praia):** …  
E assim por diante.

---

### 📌 **Modo de Uso**  
Copie **todo o conteúdo deste roteiro** e envie como primeira mensagem para a IA, junto com os parâmetros do quiz desejado. A IA seguirá os passos automaticamente, gerando o quiz passo a passo, com verificações e criatividade reforçada.

---

**Esta versão substitui qualquer roteiro anterior.** É concisa, cobre todos os cenários e garante quizzes mais divertidos, surpreendentes e tecnicamente válidos.