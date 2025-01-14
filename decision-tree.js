const quizState = {
    currentQuestionIndex: 0,
    scores: {},
    selectedAnswers: [],
    currentQuiz: null
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizFile = urlParams.get('quiz');
    loadQuizList();
    if (quizFile) {
        loadQuiz(quizFile);
    }
});

async function loadQuizList() {
    try {
        const response = await fetch('quizList.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        populateQuizSelect(data.quizzes);
    } catch (error) {
        console.error('Erro ao carregar a lista de quizzes:', error);
        alert('Erro ao carregar a lista de quizzes. Por favor, tente novamente mais tarde.');
    }
}

function populateQuizSelect(quizzes) {
    const quizSelect = document.getElementById('quiz-select');
    quizzes.forEach(quiz => {
        const option = document.createElement('option');
        option.value = quiz.file;
        option.textContent = quiz.name;
        quizSelect.appendChild(option);
    });
}

function loadSelectedQuiz() {
    const quizSelect = document.getElementById('quiz-select');
    const selectedFile = quizSelect.value;
    if (selectedFile) {
        // Limpar todas as áreas do quiz
        const questionArea = document.getElementById('question-area');
        const scoresArea = document.getElementById('scores-area');
        const analysisResults = document.getElementById('analysis-results');
        
        if (questionArea) questionArea.innerHTML = '';
        if (scoresArea) scoresArea.innerHTML = '';
        if (analysisResults) analysisResults.innerHTML = '';

        // Resetar o estado
        quizState.currentQuestionIndex = 0;
        quizState.scores = {};
        quizState.selectedAnswers = [];
        quizState.currentQuiz = null;

        // Carregar o novo quiz
        loadQuiz(selectedFile);
    }
}

async function loadQuiz(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error('Network response was not ok');
        const quizData = await response.json();
        initializeQuiz(quizData);
    } catch (error) {
        console.error('Erro ao carregar o quiz:', error);
        alert('Erro ao carregar o quiz. Por favor, tente novamente mais tarde.');
    }
}

function initializeQuiz(quizData) {
    quizState.currentQuestionIndex = 0;
    quizState.selectedAnswers = [];
    quizState.currentQuiz = quizData;
    quizState.scores = Object.keys(quizData.descriptions).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

    // Mostrar a seção interativa
    switchTab('interactive');
    
    // Inicializar interface apenas se necessário
    const questionArea = document.getElementById('question-area');
    if (!questionArea.hasChildNodes()) {
        showQuestion(quizData);
        displayScoreBars(quizData);
    }
}

function displayScoreBars(quizData) {
    const scoreContainer = document.getElementById('scores-area');
    scoreContainer.innerHTML = ''; // Clear existing score bars
    scoreContainer.className = 'scores-area';

    Object.keys(quizData.descriptions).forEach(result => {
        const scoreBar = document.createElement('div');
        scoreBar.className = 'score-bar';
        scoreBar.id = `score-${result}`;
        scoreBar.innerHTML = `
            <span>${quizData.descriptions[result].title}</span>
            <div class="score-bar-container">
                <div class="score-bar-inner" style="width: 0%"></div>
                <span class="score-value">0%</span>
            </div>
        `;
        scoreContainer.appendChild(scoreBar);
    });
}

function showQuestion(quizData) {
    const questionArea = document.getElementById('question-area');
    const oldQuestionContainer = questionArea.querySelector('.question-container');
    const newQuestionContainer = document.createElement('div');
    newQuestionContainer.className = 'question-container';
    
    // Prepare new question content
    newQuestionContainer.innerHTML = `
        <p class="progress-text">Pergunta ${quizState.currentQuestionIndex + 1} de ${quizData.questions.length}</p>
        <h2>${quizData.questions[quizState.currentQuestionIndex].question}</h2>
        <div class="buttons-container">
            ${quizData.questions[quizState.currentQuestionIndex].answers.map((answer, index) => `
                <button class="option-button" onclick="selectAnswer(quizState.currentQuiz, ${index})">${answer.text}</button>
            `).join('')}
        </div>
        ${quizState.currentQuestionIndex > 0 ? `
            <div class="navigation-buttons">
                <button class="previous-button" onclick="previousQuestion(quizState.currentQuiz)">Anterior</button>
            </div>
        ` : ''}
    `;

    // Set initial state for transition
    newQuestionContainer.style.opacity = '0';
    newQuestionContainer.style.transform = 'translateX(20px)';
    
    if (oldQuestionContainer) {
        // Fade out old question
        oldQuestionContainer.style.opacity = '0';
        oldQuestionContainer.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            oldQuestionContainer.remove();
            questionArea.appendChild(newQuestionContainer);
            
            // Trigger reflow
            newQuestionContainer.offsetHeight;
            
            // Fade in new question
            newQuestionContainer.style.transition = 'all 0.4s ease-out';
            newQuestionContainer.style.opacity = '1';
            newQuestionContainer.style.transform = 'translateX(0)';
        }, 300);
    } else {
        questionArea.appendChild(newQuestionContainer);
        
        // Trigger reflow
        newQuestionContainer.offsetHeight;
        
        // Fade in new question
        newQuestionContainer.style.transition = 'all 0.4s ease-out';
        newQuestionContainer.style.opacity = '1';
        newQuestionContainer.style.transform = 'translateX(0)';
    }
}

function previousQuestion(quizData) {
    if (quizState.currentQuestionIndex > 0) {
        quizState.currentQuestionIndex--;
        // Recalculate scores up to current question
        recalculateScores(quizData);
        showQuestion(quizData);
    }
}

function recalculateScores(quizData) {
    // Reset scores
    quizState.scores = Object.keys(quizData.descriptions).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

    // Recalculate scores up to current question
    for (let i = 0; i < quizState.currentQuestionIndex; i++) {
        const answerIndex = quizState.selectedAnswers[i];
        const points = quizData.questions[i].answers[answerIndex].points;
        for (const key in points) {
            quizState.scores[key] = (quizState.scores[key] || 0) + points[key];
        }
    }

    updateScoreBars();
}

function selectAnswer(quizData, answerIndex) {
    quizState.selectedAnswers[quizState.currentQuestionIndex] = answerIndex;
    const points = quizData.questions[quizState.currentQuestionIndex].answers[answerIndex].points;
    
    // Update scores
    for (const key in points) {
        quizState.scores[key] = (quizState.scores[key] || 0) + points[key];
    }
    
    // Update score bars immediately after adding points
    updateScoreBars();
    
    // Show next question or result
    quizState.currentQuestionIndex++;
    if (quizState.currentQuestionIndex < quizData.questions.length) {
        showQuestion(quizData);
    } else {
        showResult(quizData);
    }
}

function updateScoreBars() {
    // Find the maximum score for percentage calculation
    const maxScore = Math.max(...Object.values(quizState.scores));
    
    // Update each score bar
    for (const key in quizState.scores) {
        const scoreBar = document.querySelector(`#score-${key}`);
        if (scoreBar) {
            const scoreBarInner = scoreBar.querySelector('.score-bar-inner');
            const scoreValue = scoreBar.querySelector('.score-value');
            const percentage = maxScore > 0 ? (quizState.scores[key] / maxScore) * 100 : 0;
            
            scoreBarInner.style.width = `${percentage}%`;
            scoreValue.textContent = `${Math.round(percentage)}%`;
        }
    }
}

function showResult(quizData) {
    const questionArea = document.getElementById('question-area');
    const scoresArea = document.getElementById('scores-area');
    
    // Limpar áreas existentes
    questionArea.innerHTML = '';
    scoresArea.innerHTML = '';

    // Encontrar o resultado com maior pontuação
    const result = Object.keys(quizState.scores).reduce((a, b) => 
        quizState.scores[a] > quizState.scores[b] ? a : b
    );
    const { emoji, title, subtitle, text } = quizData.descriptions[result];

    // Calcular porcentagens finais
    const maxScore = Math.max(...Object.values(quizState.scores));
    const finalScores = Object.entries(quizState.scores).map(([key, value]) => ({
        title: quizData.descriptions[key].title,
        emoji: quizData.descriptions[key].emoji,
        percentage: maxScore > 0 ? (value / maxScore * 100).toFixed(2) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.innerHTML = `
        <h2 id="result-title">Você é <span id="result-subtitle" class="bold">${title} ${emoji}</span></h2>
        <div id="result-details">
            <h3>${subtitle}</h3>
            <p>${text}</p>
            
            <div class="final-scores">
                <h3>Pontuações Finais:</h3>
                <div class="score-list">
                    ${finalScores.map(score => `
                        <div class="score-item">
                            <span>${score.title} ${score.emoji}</span>
                            <div class="score-bar-container">
                                <div class="score-bar-inner" style="width: ${score.percentage}%"></div>
                                <span class="score-value">${score.percentage}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="result-buttons">
                <button onclick="resetQuiz()">Recomeçar</button>
                <button class="analysis-button" onclick="switchTab('analysis')">Ver Análise Estatística</button>
            </div>
        </div>
    `;

    questionArea.appendChild(resultContainer);

    // Adicionar animação se estiver habilitada
    if (window.animationEnabled) {
        resultContainer.style.opacity = '0';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
            resultContainer.classList.add('show');
            const resultSubtitle = document.getElementById('result-subtitle');
            resultSubtitle.classList.add('highlight');
        }, 100);
    } else {
        resultContainer.classList.add('show');
    }
}

// Nova função para resetar o quiz
function resetQuiz() {
    if (quizState.currentQuiz) {
        // Reset do estado
        quizState.currentQuestionIndex = 0;
        quizState.selectedAnswers = [];
        quizState.scores = Object.keys(quizState.currentQuiz.descriptions).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {});

        // Limpar áreas antigas e mostrar nova interface
        const questionArea = document.getElementById('question-area');
        const scoresArea = document.getElementById('scores-area');
        questionArea.innerHTML = '';
        scoresArea.innerHTML = '';

        showQuestion(quizState.currentQuiz);
        displayScoreBars(quizState.currentQuiz);
    }
}

function returnToQuizSelection() {
    // Limpar todas as áreas do quiz
    const questionArea = document.getElementById('question-area');
    const scoresArea = document.getElementById('scores-area');
    const analysisResults = document.getElementById('analysis-results');
    
    if (questionArea) questionArea.innerHTML = '';
    if (scoresArea) scoresArea.innerHTML = '';
    if (analysisResults) analysisResults.innerHTML = '';

    // Resetar o estado
    quizState.currentQuestionIndex = 0;
    quizState.scores = {};
    quizState.selectedAnswers = [];
    quizState.currentQuiz = null;

    // Limpar cache de análise
    analysisCache.clear();

    // Redirecionar para a página inicial
    window.location.href = 'index.html';
}

function createNode(text) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.textContent = text;
    return node;
}

// Modificar a estrutura do cache para remover dados desnecessários
const analysisCache = new Map();

function analyzeAllCombinations(quizData) {
    if (!quizData) return;
    
    const analysisResults = document.getElementById('analysis-results');
    const totalCombinations = quizData.questions.reduce((acc, q) => acc * q.answers.length, 1);
    
    const quizId = quizData.title;
    if (analysisCache.has(quizId)) {
        const cachedData = analysisCache.get(quizId);
        if (shouldUseCache(cachedData, quizState.selectedAnswers)) {
            displayCachedAnalysis(quizData, cachedData);
            return;
        }
    }

    // Estrutura de cache simplificada
    const cacheData = {
        resultCounts: {},
        totalCombinations: 0,
        resultsByPath: new Map(),
        timestamp: Date.now()
    };

    analysisResults.innerHTML = `
        <div class="analysis-container">
            <h2>Analisando Combinações...</h2>
            <div class="analysis-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">0 de ${totalCombinations} combinações analisadas (0%)</p>
            </div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Resultado</th>
                        <th>Ocorrências</th>
                        <th>Porcentagem</th>
                        <th>Exemplo de Caminho</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button onclick="closeAnalysis()" class="close-button">Voltar ao Quiz</button>
        </div>
    `;

    const progressFill = analysisResults.querySelector('.progress-fill');
    const progressText = analysisResults.querySelector('.progress-text');
    const tableBody = analysisResults.querySelector('.results-table tbody');

    const resultCounts = {};
    Object.keys(quizData.descriptions).forEach(key => {
        resultCounts[key] = 0;
    });

    const combinations = getCombinations(quizData);
    const chunkSize = 500; // Aumentado devido à menor necessidade de memória
    let processed = 0;

    cacheData.totalCombinations = totalCombinations;

    function processChunk() {
        const chunk = combinations.slice(processed, processed + chunkSize);
        
        chunk.forEach(combination => {
            const combinationKey = combination.join(',');
            const scores = calculateScoresForCombination(quizData, combination);
            const result = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            
            resultCounts[result]++;
            cacheData.resultsByPath.set(combinationKey, result);
        });

        processed += chunk.length;
        
        const progress = (processed / totalCombinations) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${processed} de ${totalCombinations} combinações analisadas (${Math.round(progress)}%)`;

        updateResultsTable(quizData, resultCounts, processed, tableBody, cacheData.resultsByPath);

        if (processed < totalCombinations) {
            setTimeout(processChunk, 0);
        } else {
            cacheData.resultCounts = { ...resultCounts };
            analysisCache.set(quizId, cacheData);
        }
    }

    processChunk();
}

// Nova função para verificar se devemos usar o cache
function shouldUseCache(cachedData, currentAnswers) {
    // Se não temos respostas selecionadas, sempre use o cache
    if (!currentAnswers || currentAnswers.length === 0) return true;
    
    // Verifica se temos um caminho parcial que corresponde às respostas atuais
    const partialPath = currentAnswers.join(',');
    return cachedData.resultsByPath.has(partialPath);
}

// Função otimizada para calcular pontuações
function calculateScoresForCombination(quizData, combination) {
    const scores = {};
    combination.forEach((answerIndex, questionIndex) => {
        const points = quizData.questions[questionIndex].answers[answerIndex].points;
        for (const key in points) {
            scores[key] = (scores[key] || 0) + points[key];
        }
    });
    return scores;
}

// Função modificada para exibir análise em cache
function displayCachedAnalysis(quizData, cacheData) {
    const analysisResults = document.getElementById('analysis-results');
    
    analysisResults.innerHTML = `
        <div class="analysis-container">
            <h2>Análise do Quiz (Cache Otimizado)</h2>
            <p>Análise baseada em ${cacheData.totalCombinations} combinações possíveis</p>
            <p>Cache atualizado em: ${new Date(cacheData.timestamp).toLocaleString()}</p>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Resultado</th>
                        <th>Ocorrências</th>
                        <th>Porcentagem</th>
                        <th>Exemplo de Caminho</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button onclick="closeAnalysis()" class="close-button">Voltar ao Quiz</button>
        </div>
    `;

    const tableBody = analysisResults.querySelector('.results-table tbody');
    updateResultsTable(quizData, cacheData.resultCounts, cacheData.totalCombinations, tableBody, cacheData.resultsByPath);
}

function updateResultsTable(quizData, resultCounts, totalProcessed, tableBody, resultsByPath) {
    // Criar array de resultados com suas contagens para ordenação
    const sortedResults = Object.keys(resultCounts)
        .map(result => {
            // Encontrar o primeiro caminho que leva a este resultado
            const path = findFirstPathToResult(result, quizData, resultsByPath);
            const pathDescription = path ? formatPath(path, quizData) : "Caminho não encontrado";
            
            return {
                result,
                count: resultCounts[result],
                percentage: (resultCounts[result] / totalProcessed * 100).toFixed(2),
                title: quizData.descriptions[result].title,
                emoji: quizData.descriptions[result].emoji,
                path: pathDescription
            };
        })
        .sort((a, b) => b.count - a.count); // Ordenar por contagem decrescente

    // Atualizar a tabela com os resultados ordenados
    tableBody.innerHTML = sortedResults
        .map(({ result, count, percentage, title, emoji, path }) => `
            <tr>
                <td>${title} ${emoji}</td>
                <td>${count}</td>
                <td>${percentage}%</td>
                <td class="path-column"><small>${path}</small></td>
            </tr>
        `)
        .join('');
}

// Função auxiliar para encontrar o primeiro caminho que leva a um resultado
function findFirstPathToResult(targetResult, quizData, resultsByPath) {
    for (const [path, result] of resultsByPath) {
        if (result === targetResult) {
            return path.split(',').map(Number);
        }
    }
    return null;
}

// Função auxiliar para formatar o caminho de forma legível
function formatPath(path, quizData) {
    return path
        .map((answerIndex, questionIndex) => {
            const answer = quizData.questions[questionIndex].answers[answerIndex];
            // Extrair emoji se existir (assumindo que está no início do texto)
            const emojiMatch = answer.text.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}])/u);
            return emojiMatch ? emojiMatch[0] : `${answerIndex + 1}`;
        })
        .join(' → ');
}

function getCombinations(quizData) {
    const combinations = [];
    const totalQuestions = quizData.questions.length;
    const totalCombinations = quizData.questions.reduce((acc, q) => acc * q.answers.length, 1);

    for (let i = 0; i < totalCombinations; i++) {
        const combination = [];
        let temp = i;
        for (let q = 0; q < totalQuestions; q++) {
            const answerCount = quizData.questions[q].answers.length;
            combination.push(temp % answerCount);
            temp = Math.floor(temp / answerCount);
        }
        combinations.push(combination);
    }

    return combinations;
}

function displayAnalysis(quizData, results) {
    const container = document.getElementById('quiz-container');
    const totalCombinations = results.length;
    const resultCounts = {};
    const resultPercentages = {};

    // Count occurrences of each result
    results.forEach(r => {
        resultCounts[r.result] = (resultCounts[r.result] || 0) + 1;
    });

    // Calculate percentages
    Object.keys(resultCounts).forEach(result => {
        resultPercentages[result] = (resultCounts[result] / totalCombinations * 100).toFixed(2);
    });

    // Create analysis display
    const analysisHTML = `
        <div class="analysis-container">
            <h2>Análise do Quiz</h2>
            <p>Total de combinações possíveis: ${totalCombinations}</p>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Resultado</th>
                        <th>Ocorrências</th>
                        <th>Porcentagem</th>
                        <th>Exemplo de Caminho</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(resultCounts).map(result => `
                        <tr>
                            <td>${quizData.descriptions[result].title} ${quizData.descriptions[result].emoji}</td>
                            <td>${resultCounts[result]}</td>
                            <td>${resultPercentages[result]}%</td>
                            <td class="path-column"><small>${findFirstPathToResult(result, quizData, resultsByPath)}</small></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3>Todas as Combinações</h3>
            <div class="combinations-list">
                ${results.map((r, index) => `
                    <div class="combination-item">
                        <strong>Combinação ${index + 1}:</strong>
                        ${r.combination.map((answer, qIndex) => `
                            Q${qIndex + 1}: ${quizData.questions[qIndex].answers[answer].text}
                        `).join(' → ')}
                        <br>
                        <strong>Resultado:</strong> ${quizData.descriptions[r.result].title} ${quizData.descriptions[r.result].emoji}
                    </div>
                `).join('')}
            </div>
            
            <button onclick="closeAnalysis()" class="close-button">Voltar ao Quiz</button>
        </div>
    `;

    // Store current quiz state
    const currentState = {
        question: quizState.currentQuestionIndex,
        scores: {...quizState.scores},
        answers: [...quizState.selectedAnswers]
    };

    container.innerHTML = analysisHTML;

    // Add event listener to close button
    const closeButton = container.querySelector('.close-button');
    closeButton.onclick = () => {
        // Restore quiz state
        quizState.currentQuestionIndex = currentState.question;
        quizState.scores = currentState.scores;
        quizState.selectedAnswers = currentState.answers;
        
        // Restore quiz display
        initializeQuiz(quizData);
        showQuestion(quizData);
        updateScoreBars();
    };
}

// Add this new function
function closeAnalysis() {
    if (quizState.currentQuiz) {
        switchTab('interactive');
    }
}

function switchTab(tabName) {
    // Atualizar botões
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName)) {
            button.classList.add('active');
        }
    });

    // Atualizar seções e explicações
    document.getElementById('interactive-section').classList.toggle('hidden', tabName !== 'interactive');
    document.getElementById('analysis-section').classList.toggle('hidden', tabName !== 'analysis');
    document.getElementById('interactive-explanation').classList.toggle('hidden', tabName !== 'interactive');
    document.getElementById('analysis-explanation').classList.toggle('hidden', tabName !== 'analysis');

    // Gerenciar estado do quiz
    if (tabName === 'interactive') {
        if (quizState.currentQuiz) {
            // Apenas atualizar a visualização se houver um quiz carregado
            const questionArea = document.getElementById('question-area');
            if (!questionArea.hasChildNodes()) {
                if (quizState.currentQuestionIndex < quizState.currentQuiz.questions.length) {
                    showQuestion(quizState.currentQuiz);
                } else {
                    showResult(quizState.currentQuiz);
                }
                displayScoreBars(quizState.currentQuiz);
            }
        }
    } else if (tabName === 'analysis') {
        // Limpar resultados anteriores da análise
        document.getElementById('analysis-results').innerHTML = '';
    }
}
