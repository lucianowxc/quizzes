### Roteiro para criação dos prompts que eu fiz para gerar um quiz do tema de sua preferência

# Passo 1: Contexto

O primeiro prompt deve especificar a tarefa e passar o contexto com os dados necessários para o quiz.

Texto:

Gostaria que você olhasse o conteúdo desse roteiro de instruções que vou te mandar:

```prompt
Vou dar uma sequência de instruções para você me ajudar a construir um quiz de personalidade. A primeira etapa está nesse prompt e darei mais instruções no próximo.

Etapa 1: Analise o template a seguir:
{
      "title": "Título do Quiz",
      "questions": [
         {
            "question": "Pergunta 1",
            "answers": [
                  { "text": "Resposta 1", "points": { "resultado1": 1, "resultado2": 0.5, "resultado3": 0.2, "resultado4": 0.8, "resultado5": 0.3, "resultado6": 0.7, "resultado7": 0.4, "resultado8": 0.6 } },
                  { "text": "Resposta 2", "points": { "resultado1": 0.5, "resultado2": 1, "resultado3": 0.8, "resultado4": 0.2, "resultado5": 0.6, "resultado6": 0.4, "resultado7": 0.7, "resultado8": 0.3 } },
                  { "text": "Resposta 3", "points": { "resultado1": 0.2, "resultado2": 0.8, "resultado3": 1, "resultado4": 0.5, "resultado5": 0.4, "resultado6": 0.6, "resultado7": 0.3, "resultado8": 0.7 } },
                  { "text": "Resposta 4", "points": { "resultado1": 0.8, "resultado2": 0.2, "resultado3": 0.5, "resultado4": 1, "resultado5": 0.7, "resultado6": 0.3, "resultado7": 0.6, "resultado8": 0.4 } }
            ]
         },
         // Adicione mais perguntas conforme necessário
      ],
      "descriptions": {
         "resultado1": {
            "title": "Nome do Resultado 1",
            "emoji": "🔴",
            "subtitle": "Subtítulo do Resultado 1",
            "text": "Descrição do Resultado 1"
         },
         // Adicione mais resultados conforme necessário
      }
}

Etapa 2:  **Instrução de Definições** gostaria que, dado um tema de quiz e algumas definições sobre tamanho do quiz (número de perguntas, número médio de alternativas, resultados diferentes), complexidade, aleatoriedade e "nível de atrevimento" (permitindo respostas que tirem sarro dos participantes), você gerasse um quiz exatamente no template do primeiro.

Etapa 3:  **Fornecimento de Definições**

> Tema do Quiz: [Tema do Quiz]

> Tamanho do Quiz:
- Número de perguntas: [Número]
- Número médio de alternativas por pergunta: [Número]
- Número de Resultados Diferentes: [Número]

> Complexidade: [Nível de Complexidade]

> Aleatoriedade: [Sim/Não]

> Nível de Atrevimento: [Nível de Atrevimento]

> Temas Visuais: [Sim/Não]

> Desafios: [Sim/Não]

Etapa 4:  **Criação de resultados**

Crie as descrições dos resultados com base no tema. Inclua título, emoji, subtítulo e descrição para cada resultado.
Valide o resultado e gere um arquivo json no template passado acima com o conteúdo parcial.

Etapa 5:  **Criação de Perguntas e Respostas**

Crie as perguntas e respostas. Inclua referências e mantenha um estilo divertido e criativo.
Valide o resultado e gere as alterações necessárias no arquivo json (perguntas e respostas) no template passado acima com o conteúdo parcial.

Etapa 6: **Verificação de Cobertura dos Resultados**

Verifique se todos os personagens/resultados listados são alcançáveis com as respostas dadas. Mostre uma sequência de respostas que gera cada resultado.

Etapa 7: **Listagem Completa e Revisão**:

Liste todos os prompts e resumos que utilizamos para criar o quiz, para que eu possa reutilizá-los em futuros temas.

Etapa 8: **Criação da Entrada do Quiz**:

Crie a entrada para o quiz com base na estrutura fornecida:
{ 
      "name": "Qual Algoritmo Clássico da Ciência da Computação Você é?", 
      "file": "quizzes/quizAlgoritmosClassicos.json",
      "description": "Descubra qual algoritmo clássico da Ciência da Computação mais se parece com você!"
}
```

# Passo 2: **Prompt com dados para o quiz**:

Para criar um novo quiz, siga os passos abaixo com os parâmetros desejados:

```prompt
Vamos seguir os passos para criar o quiz com os seguintes parâmetros:
Tema do quiz: Quem é você na festa da firma?
Tamanho do quiz: 10 perguntas, 4 alternativas, 8 resultados diferentes que são arquétipos do mercado de trabalho
Complexidade: média
Aleatoriedade: pode fazer perguntas muito abertas e existencialistas
Nível de atrevimento: altíssimo, pode fazer cutucadas pontuais nas alternativas
Temas visuais: Sim
```

Exemplo de outro quiz:

```prompt
Vamos seguir os passos para criar o quiz com os seguintes parâmetros:
Tema do quiz: Qual personagem de série você seria?
Tamanho do quiz: 12 perguntas, 4 alternativas, 6 resultados diferentes que são personagens de séries populares
Complexidade: alta
Aleatoriedade: não
Nível de atrevimento: médio, pode fazer algumas piadas leves
Temas visuais: Não
```

# Passo 3: **Execução do roteiro**:

O Copilot irá fazer a execução do roteiro passo-a-passo. Talvez exista uma limitação no tamanho de resposta, foi o passo que precisei repetir mais vezes para dar certo.

Para incluir o quiz na página web é possível testar se o arquivo json é válido usando a própria interface da página e após isso, basta um commit no repositório alterando o arquivo ```quizList.json``` com a entrada gerada pelo copilot e criando o arquivo json com o teste gerado pelo copilot na pasta ```quizzes```, validando o nome do arquivo gerado com a entrada na lista.

