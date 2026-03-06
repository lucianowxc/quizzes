# 📜 Roteiro Padrão para Criação de Quizzes — Versão 2.0

**Princípios Fundamentais:**
1. **Diversão > Óbvio** — respostas surpreendentes engajam mais que as previsíveis
2. **Surpresa Controlada** — o resultado deve fazer sentido em retrospecto
3. **Personalização Temática** — cada quiz tem voz e estilo próprios
4. **Valide antes de publicar** — problemas estruturais são invisíveis sem checagem

---

## 🔧 Seção 1: Template JSON

### Quiz Linear (sem branching)

```json
{
  "title": "Título Criativo",
  "subtitle": "Subtítulo Engajador",
  "questions": [
    {
      "question": "Texto da pergunta",
      "answers": [
        {
          "text": "🎲 Resposta 1",
          "points": {
            "resultado1": 0.7,
            "resultado3": 0.3
          }
        }
      ]
    }
  ],
  "descriptions": {
    "resultado1": {
      "title": "Nome do Resultado",
      "emoji": "🔮",
      "subtitle": "Subtítulo chamativo resumido",
      "text": "Descrição personalizada do resultado"
    }
  }
}
```

### Quiz com Branching Condicional

Quizzes onde a próxima pergunta depende da resposta anterior. Use quando o tema tem subgrupos muito distintos — por exemplo, arquétipos de gameplay que levam a perguntas completamente diferentes.

```json
{
  "title": "Título do Quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Pergunta inicial de ramificação",
      "answers": [
        {
          "text": "🏔️ Opção A",
          "points": { "resultado1": 0.4, "resultado2": 0.3 },
          "nextQuestion": "q2a"
        },
        {
          "text": "🏛️ Opção B",
          "points": { "resultado3": 0.4, "resultado4": 0.3 },
          "nextQuestion": "q2b"
        }
      ]
    },
    {
      "id": "q2a",
      "question": "Pergunta específica do caminho A",
      "answers": [
        {
          "text": "Resposta",
          "points": { "resultado1": 0.9 },
          "nextQuestion": "q_final"
        }
      ]
    },
    {
      "id": "q_final",
      "question": "Pergunta de encerramento (todos os caminhos chegam aqui)",
      "answers": [
        { "text": "Opção 1", "points": {} },
        { "text": "Opção 2", "points": {} }
      ]
    }
  ],
  "descriptions": { }
}
```

**⚠️ Regras críticas do branching:**

- Toda pergunta de branching deve ter um `"id"` único
- **Toda resposta deve ter `"nextQuestion"` explícito** — inclusive as do último nível, que devem apontar para uma pergunta de encerramento (`q_final`). Se `nextQuestion` estiver ausente, o sistema avança linearmente para a próxima pergunta no array, o que causa comportamento inesperado
- A pergunta de encerramento pode ter `"points": {}` em todas as respostas — serve apenas como terminal limpo
- Quizzes sem `id` nas perguntas funcionam linearmente (sem branching)
- Todos os pontos somados ao longo do caminho são considerados no resultado final

---

## 🎨 Seção 2: Diretrizes de Design

### Emojis das Respostas
- **Diversificar categorias:** 30% natureza 🌊, 30% objetos 🎪, 20% ações 🤹, 20% abstratos 🌀
- **Evitar literalismos:** não usar 🔥 para "paixão" ou 💡 para "ideias"
- **Sem repetição:** nenhum emoji deve aparecer duas vezes na mesma pergunta
- **Quebrar padrões:** o mesmo conceito pode ter emojis diferentes em perguntas distintas

### Pontuação
- **Máximo 0.9** por resposta para evitar determinismo total
- **25% das respostas** devem ter pontos para múltiplos resultados
- **Distribuição não linear:** respostas aparentemente similares podem levar a resultados diferentes
- **Perguntas de navegação (branching):** pontos nessas perguntas devem ser baixos (0.2–0.4), pois as perguntas terminais têm os pesos definitivos (0.7–0.9)
- **Pontos de navegação devem sempre referenciar resultados finais** — nunca use chaves intermediárias como `"aggro"` ou `"control"` que não existem em `descriptions`

### Comprimento das Respostas
- **Limite recomendado: 80 caracteres por resposta** — textos maiores ficam desconfortáveis visualmente na maioria das interfaces
- Prefira frases diretas e coloquiais a descrições longas

### Arquétipos de Resultado
- Organizar resultados em ordem progressiva quando houver hierarquia
- Posições iniciais: **fundamentos** — posições intermediárias: **transição** — posições finais: **transformação**

---

## 💡 Seção 3: Técnicas Avançadas

### Camuflagem de Padrões
- Associar o mesmo emoji a resultados distintos em perguntas diferentes
- Usar **pontos decimais variados** (0.3, 0.7, 0.5) em vez de inteiros redondos

### Mix de Perguntas Engajadoras
- 40% situações cotidianas ("Num dia livre...")
- 30% preferências pessoais ("Seu presente ideal...")
- 20% existenciais ("Qual frase te define?")
- 10% aleatoriedade controlada ("Se você fosse um animal...")

### Resultados Memoráveis
- Emoji único por resultado
- Subtítulo com posição ou essência em poucas palavras
- Descrição com:
  - 1ª frase: **afirmação direta** ("Você é X!")
  - 2ª frase: **metáfora ou caracterização** que contextualiza
  - Restante: **aplicação prática** ou **piada temática** conforme o nível de atrevimento

### Nível de Atrevimento
- **Baixo:** descrições acolhedoras, sem cutucadas
- **Médio:** uma ou duas piadas sutis por resultado, geralmente na última frase
- **Alto:** cutucadas diretas nas alternativas e nas descrições; ironia como regra, não exceção

---

## 🌳 Seção 4: Planejamento para Quizzes Complexos

Para quizzes com **mais de 8 resultados** ou **branching condicional**, planeje a estrutura antes de gerar o JSON:

1. **Desenhe a árvore de caminhos** — liste perguntas por nível e resultados por galho
2. **Confirme cobertura** — todo resultado deve ser alcançável por pelo menos um caminho
3. **Identifique a pergunta de encerramento** — todos os galhos devem convergir para ela
4. **Estime o número de perguntas por caminho** — o ideal é que todos os caminhos tenham o mesmo número de perguntas (experiência uniforme)

Exemplo de esboço para quiz com branching:
```
Q1: Arquétipo principal → 4 galhos (aggro / midrange / control / combo)
Q2_*: Subtipo por galho → 3 opções cada
Q3_*: Refinamento → leva a Q4 específica
Q4_*: Escolha de cor/detalhe final → aponta para q_final
Q_FINAL: Pergunta de encerramento neutra
```

---

## ✅ Seção 5: Checklist de Validação

### Validação Semântica (manual)
- [ ] Todos os resultados são alcançáveis com as respostas disponíveis
- [ ] Nenhum emoji se repete na mesma pergunta
- [ ] Pontuação máxima por resposta ≤ 0.9
- [ ] 20–30% das respostas estão associadas a múltiplos resultados
- [ ] Subtítulos indicam a essência do resultado de forma clara
- [ ] Respostas têm no máximo ~80 caracteres

### Validação Técnica (script recomendado)
- [ ] Todos os valores de `points` referenciam chaves existentes em `descriptions`
- [ ] Todos os valores de `nextQuestion` referenciam `id`s existentes em `questions`
- [ ] Todos os resultados em `descriptions` têm pelo menos um caminho terminal que os alcança
- [ ] Nenhuma pergunta é inacessível na árvore (sem `nextQuestion` apontando para ela)
- [ ] Toda resposta em quiz com branching tem `nextQuestion` explícito

O script abaixo realiza essas verificações automaticamente:

```python
import json
from collections import defaultdict

with open('quiz.json') as f:
    quiz = json.load(f)

desc_keys = set(quiz['descriptions'].keys())
all_ids = set(q.get('id', '') for q in quiz['questions'])

print("=== Validação de pontos ===")
invalid_points = []
for q in quiz['questions']:
    for a in q['answers']:
        for k in a.get('points', {}):
            if k not in desc_keys:
                invalid_points.append((q.get('id', '?'), k))
if invalid_points:
    for qid, k in invalid_points:
        print(f"  ⚠️  [{qid}] ponto '{k}' sem description")
else:
    print("  ✅ Todos os pontos têm description")

print("\n=== Validação de nextQuestion ===")
broken_nq = []
for q in quiz['questions']:
    for a in q['answers']:
        nq = a.get('nextQuestion')
        if nq and nq not in all_ids:
            broken_nq.append((q.get('id', '?'), nq))
if broken_nq:
    for qid, nq in broken_nq:
        print(f"  ⚠️  [{qid}] nextQuestion '{nq}' não existe")
else:
    print("  ✅ Todos os nextQuestion são válidos")

print("\n=== Resultados alcançáveis ===")
terminal_results = set()
for q in quiz['questions']:
    for a in q['answers']:
        if 'nextQuestion' not in a:
            terminal_results.update(a.get('points', {}).keys())

# Para quiz linear, considerar todos os pontos
if not any(q.get('id') for q in quiz['questions']):
    for q in quiz['questions']:
        for a in q['answers']:
            terminal_results.update(a.get('points', {}).keys())

unreachable = desc_keys - terminal_results
if unreachable:
    for r in unreachable:
        print(f"  ⚠️  '{r}' não tem caminho terminal")
else:
    print("  ✅ Todos os resultados são alcançáveis")

print("\n=== Totais por resultado (caminho ótimo) ===")
for result in sorted(desc_keys):
    total = sum(
        max(a.get('points', {}).get(result, 0) for a in q['answers'])
        for q in quiz['questions']
    )
    status = "✅" if total >= 3.0 else "⚠️ BAIXO"
    print(f"  {status} {result}: {total:.1f}")
```

---

## 📌 Exemplo Aplicado

**Tema:** "Qual Instrumento Musical Você Seria?"

```json
{
  "question": "Como você reage a imprevistos?",
  "answers": [
    {
      "text": "🤸 Improviso soluções criativas",
      "points": { "violino": 0.7, "bateria": 0.3 }
    },
    {
      "text": "🌊 Mantenho o ritmo natural",
      "points": { "violao": 0.9 }
    }
  ]
}
```

---

## 📂 Modelo de Entrada para quizList.json

```json
{
  "name": "Tema do Quiz",
  "file": "quizzes/nomeDoArquivo.json",
  "description": "Frase de chamada que menciona a diversidade de resultados!"
}
```

---

## 🔁 Fluxo Completo de Criação

```
1. Definir parâmetros
   → Tema, tamanho, número de resultados, complexidade,
     aleatoriedade, nível de atrevimento

2. Planejar estrutura (obrigatório para quizzes com 8+ resultados ou branching)
   → Desenhar árvore de caminhos
   → Listar todos os resultados e confirmar cobertura
   → Identificar pergunta de encerramento (branching)

3. Criar descriptions
   → Título, emoji, subtítulo e descrição para cada resultado
   → Validar: todos os resultados têm description?

4. Criar perguntas e respostas
   → Seguir mix de tipos (cotidiano / preferência / existencial / aleatório)
   → Respostas com no máximo ~80 caracteres
   → Pontos sempre referenciando chaves de descriptions
   → Em branching: toda resposta com nextQuestion explícito

5. Executar script de validação técnica
   → Corrigir pontos inválidos, nextQuestion quebrados e resultados inalcançáveis

6. Verificar cobertura semântica
   → Confirmar sequência de respostas que gera cada resultado
   → Ajustar pesos se algum resultado tiver total muito baixo (< 3.0)

7. Gerar entrada para quizList.json
```
