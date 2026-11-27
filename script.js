let quizData;
let currentQuestionIndex = 0;
let scores = {};
let currentPage = 1;
const quizzesPerPage = 14;
let currentQuizSearch = '';
let currentQuizFile = ''; // Store the current quiz file name
let selectedAnswers = []; // Track selected answers
let questionHistory = []; // FASE 2: Histórico de perguntas respondidas
let animationEnabled = true; // Track if animation is enabled
let alternativeResultsEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('quiz-search').addEventListener('input', event => {
        currentQuizSearch = event.target.value.trim().toLocaleLowerCase('pt-BR');
        currentPage = 1;
        displayQuizzes();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const quizFile = urlParams.get('quiz');
    if (quizFile) {
        loadQuizFromPost(quizFile);
    } else {
        loadQuizList();
        document.getElementById('quiz-title').textContent = 'Quiz de Personalidade';
        document.getElementById('quiz').innerHTML = '<p>Escolha um dos quizzes abaixo para descobrir mais sobre você!</p>';
    }
    loadDarkModePreference();
    loadAnimationPreference();
    loadAlternativeResultsPreference();
    updateAnimationStatus(); // Update animation status on page load
    updateDarkModeStatus(); // Update dark mode status on page load
});

async function loadQuizList() {
    try {
        showLoadingIndicator();
        const response = await fetch('quizList.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        window.quizzes = data.quizzes.slice().reverse(); // Store quizzes globally in reverse order
        displayQuizzes();
    } catch (error) {
        console.error('Erro ao carregar a lista de quizzes:', error);
        alert('Erro ao carregar a lista de quizzes. Por favor, tente novamente mais tarde.');
    } finally {
        hideLoadingIndicator();
    }
}

function displayQuizzes() {
    const quizPostsContainer = document.getElementById('quiz-posts');
    quizPostsContainer.innerHTML = ''; // Reset posts

    const filteredQuizzes = window.quizzes.filter(quiz =>
        `${quiz.name} ${quiz.description}`.toLocaleLowerCase('pt-BR').includes(currentQuizSearch)
    );
    const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
    currentPage = Math.min(currentPage, Math.max(totalPages, 1));
    const startIndex = (currentPage - 1) * quizzesPerPage;
    const endIndex = startIndex + quizzesPerPage;
    const quizzesToShow = filteredQuizzes.slice(startIndex, endIndex);

    if (filteredQuizzes.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'quiz-search-empty';
        emptyMessage.textContent = 'Nenhum quiz encontrado.';
        quizPostsContainer.appendChild(emptyMessage);
    }

    quizzesToShow.forEach(quiz => {
        const post = document.createElement('div');
        post.className = 'quiz-post';
        post.innerHTML = `
            <h3>${quiz.name}</h3>
            <p>${quiz.description}</p>
            <div>
                <button onclick="loadQuizFromPost('${quiz.file}')">Começar Quiz</button>
                <button class="share-button" onclick="shareQuiz('${quiz.file}')">🔗</button>
            </div>
        `;
        quizPostsContainer.appendChild(post);
    });

    // Add the upload quiz post
    const uploadPost = document.createElement('div');
    uploadPost.className = 'quiz-post';
    uploadPost.innerHTML = `
        <h3>Carregar Quiz do Arquivo</h3>
        <p>Faça upload de um arquivo JSON para carregar um quiz personalizado.</p>
        <input type="file" id="file-input" accept=".json" aria-label="Carregar quiz do arquivo">
        <button onclick="loadUploadedQuiz()">Carregar Quiz do Arquivo</button>
    `;
    quizPostsContainer.appendChild(uploadPost);

    // Add pagination controls
    if (totalPages > 0) {
        const paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        paginationControls.innerHTML = `
            <button onclick="prevPage()" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button onclick="nextPage()" ${currentPage >= totalPages ? 'disabled' : ''}>Próxima</button>
        `;
        quizPostsContainer.appendChild(paginationControls);
    }

    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayQuizzes();
    }
}

function nextPage() {
    const filteredCount = window.quizzes.filter(quiz =>
        `${quiz.name} ${quiz.description}`.toLocaleLowerCase('pt-BR').includes(currentQuizSearch)
    ).length;
    if ((currentPage * quizzesPerPage) < filteredCount) {
        currentPage++;
        displayQuizzes();
    }
}

async function loadQuizFromPost(file) {
    try {
        showLoadingIndicator();
        const response = await fetch(file);
        if (!response.ok) throw new Error('Network response was not ok');
        quizData = await response.json();
        currentQuizFile = file; // Store the current quiz file name
        document.title = quizData.title || 'Quiz'; // Update page title
        window.history.pushState({}, quizData.title, `?quiz=${file}`); // Update URL
        initializeQuiz();
    } catch (error) {
        console.error('Erro ao carregar o quiz selecionado:', error);
        alert('Erro ao carregar o quiz selecionado. Por favor, tente novamente mais tarde.');
    } finally {
        hideLoadingIndicator();
    }
}

function loadUploadedQuiz() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                quizData = parseQuizJson(event.target.result);
                currentQuizFile = file.name; // Store the current quiz file name
                document.title = quizData.title || 'Quiz'; // Update page title
                window.history.pushState({}, quizData.title, `?quiz=${file.name}`); // Update URL
                initializeQuiz();
            } catch (error) {
                alert(`Não foi possível carregar o quiz: ${error.message}`);
            }
        };
        reader.onerror = () => alert('Não foi possível ler o arquivo selecionado.');
        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo JSON.');
    }
}

function parseQuizJson(contents) {
    const data = JSON.parse(contents);
    const descriptions = data?.descriptions;
    const resultKeys = new Set(
        descriptions && typeof descriptions === 'object' && !Array.isArray(descriptions)
            ? Object.keys(descriptions)
            : []
    );
    const validDescriptions = resultKeys.size > 0 && [...resultKeys].every(key =>
        data.descriptions[key] && typeof data.descriptions[key].title === 'string'
    );
    const validQuestions = Array.isArray(data?.questions) && data.questions.length > 0 &&
        data.questions.every(question =>
            question && typeof question.question === 'string' && Array.isArray(question.answers) &&
            question.answers.length > 0 && question.answers.every(answer =>
                answer && typeof answer.text === 'string' && answer.points &&
                typeof answer.points === 'object' && !Array.isArray(answer.points) &&
                Object.entries(answer.points).every(([key, points]) =>
                    resultKeys.has(key) && Number.isFinite(points)
                )
            )
        );

    if (!data || typeof data.title !== 'string' || !validDescriptions || !validQuestions) {
        throw new Error('O arquivo não tem a estrutura esperada de um quiz.');
    }
    return data;
}

function initializeQuiz() {
    // ✨ FASE 2: Gerar IDs de perguntas se ausentes
    generateQuestionIds();
    
    document.getElementById('quiz-title').textContent = quizData.title;
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    currentQuestionIndex = 0; // Reset question index
    selectedAnswers = []; // Reset selected answers
    questionHistory = []; // FASE 2: Reset histórico
    showQuestion();
    document.getElementById('quiz-search-container').classList.add('hidden');
    document.getElementById('quiz-posts').classList.add('hidden'); // Hide quiz posts
}

// ✨ FASE 2: Funções de Branching
function generateQuestionIds() {
    quizData.questions.forEach((q, idx) => {
        if (!q.id) {
            q.id = `q${idx}`;
        }
    });
}

function getQuestionIndexById(id) {
    return quizData.questions.findIndex(q => q.id === id);
}

function showQuestion() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const progressElement = document.createElement('p');
    progressElement.id = 'progress';
    progressElement.className = 'progress-text';
    questionContainer.appendChild(progressElement);
    updateProgress();

    const questionElement = document.createElement('h2');
    questionElement.textContent = quizData.questions[currentQuestionIndex].question;
    questionContainer.appendChild(questionElement);

    // ✨ NOVO: Agrupar botões de respostas em container
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    
    quizData.questions[currentQuestionIndex].answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.className = 'option-button';
        button.onclick = () => selectAnswer(index);
        answersContainer.appendChild(button);
    });
    questionContainer.appendChild(answersContainer);

    // ✨ NOVO: Usar button-group para melhor layout
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-group';

    if (currentQuestionIndex > 0) {
        const previousButton = document.createElement('button');
        previousButton.textContent = '← Anterior';
        previousButton.className = 'previous-button';
        previousButton.onclick = () => previousQuestion();
        buttonContainer.appendChild(previousButton);
    }

    const backButton = document.createElement('button');
    backButton.textContent = '↺ Voltar ao Início';
    backButton.className = 'back-button';
    backButton.onclick = () => {
        document.title = 'Quiz de Personalidade'; // Revert page title
        returnToQuizSelection();
    };
    buttonContainer.appendChild(backButton);

    questionContainer.appendChild(buttonContainer);
    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function selectAnswer(answerIndex) {
    selectedAnswers[currentQuestionIndex] = answerIndex;
    
    // FASE 2: Registrar no histórico antes de mudar
    questionHistory.push(currentQuestionIndex);
    const activePath = new Set(questionHistory);
    selectedAnswers.forEach((selectedAnswer, questionIndex) => {
        if (selectedAnswer !== undefined && !activePath.has(questionIndex)) {
            delete selectedAnswers[questionIndex];
        }
    });
    
    // ✨ FASE 2: Verificar nextQuestion
    const answer = quizData.questions[currentQuestionIndex].answers[answerIndex];
    if (answer.nextQuestion) {
        const nextIndex = getQuestionIndexById(answer.nextQuestion);
        if (nextIndex !== -1) {
            currentQuestionIndex = nextIndex;
        } else {
            currentQuestionIndex++;
        }
    } else {
        currentQuestionIndex++;
    }
    
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        calculateScores();
        showResult();
    }
}

function previousQuestion() {
    // ✨ FASE 2: Voltar para a pergunta anterior no histórico respondido
    if (questionHistory.length > 0) {
        currentQuestionIndex = questionHistory.pop();
        selectedAnswers[currentQuestionIndex] = undefined; // Limpar resposta anterior
        showQuestion();
    }
}

function calculateScores() {
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    selectedAnswers.forEach((answerIndex, questionIndex) => {
        if (answerIndex === undefined) return;
        const points = quizData.questions[questionIndex].answers[answerIndex].points;
        for (const key in points) {
            scores[key] += points[key];
        }
    });
}

function showResult() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const rankedResults = Object.entries(scores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    const result = rankedResults[0][0];
    const { emoji, title, subtitle, text } = quizData.descriptions[result];
    const maxScore = rankedResults[0][1];
    const otherResults = rankedResults.slice(1, 3);
    const otherResultsMarkup = alternativeResultsEnabled && otherResults.length > 0 ? `
        <p class="nearby-results">Outras possibilidades: ${otherResults.map(([key, score]) =>
            `${quizData.descriptions[key].title} ${quizData.descriptions[key].emoji || ''} (${maxScore > 0 ? Math.round(score / maxScore * 100) : 0}%)`
        ).join(' · ')}</p>
    ` : '';

    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.innerHTML = `
        <h2 id="result-title">Você é <span id="result-subtitle" class="bold" style="opacity: 0;">${title} ${emoji}</span></h2>
        <div id="result-details" style="opacity: 0;">
            <h3>${subtitle}</h3>
            <p>${text}</p>
            ${otherResultsMarkup}
            <button onclick="restartQuiz()">Recomeçar</button>
            <button class="return-button" onclick="returnToQuizSelection()">Voltar à Seleção de Quiz</button>
            <button class="share-button" onclick="shareResult('${title}', '${emoji}')">🔗</button>
        </div>
    `;

    questionContainer.appendChild(resultContainer);

    if (animationEnabled) {
        // Trigger the transition effect
        setTimeout(() => {
            resultContainer.classList.add('show');
            setTimeout(() => {
                const resultSubtitle = document.getElementById('result-subtitle');
                resultSubtitle.style.opacity = '1';
                resultSubtitle.classList.add('highlight');
                setTimeout(() => {
                    document.getElementById('result-details').style.opacity = '1';
                }, 1500);
            }, 1500);
        }, 100);
    } else {
        resultContainer.classList.add('show');
        const resultSubtitle = document.getElementById('result-subtitle');
        resultSubtitle.style.opacity = '1';
        resultSubtitle.classList.add('highlight');
        document.getElementById('result-details').style.opacity = '1';
    }
    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function restartQuiz() {
    currentQuestionIndex = 0;
    selectedAnswers = []; // Reset selected answers
    questionHistory = [];
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    showQuestion();
}

function returnToQuizSelection() {
    document.getElementById('quiz-title').textContent = 'Quiz de Personalidade';
    document.getElementById('quiz').innerHTML = '<p>Escolha um dos quizzes abaixo para descobrir mais sobre você!</p>';
    currentQuizFile = ''; // Reset current quiz file
    currentPage = 1; // Reset current page
    questionHistory = [];
    loadQuizList(); // Reload quiz list
    document.getElementById('quiz-search-container').classList.remove('hidden');
    document.getElementById('quiz-posts').classList.remove('hidden'); // Show quiz posts
    window.history.replaceState({}, 'Quiz de Personalidade', window.location.pathname); // Clear URL parameters
    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function generateShareLink(quizFile) {
    const url = new URL(window.location.href);
    url.searchParams.set('quiz', quizFile);
    return url.toString();
}

function shareQuiz(quizFile) {
    const shareLink = generateShareLink(quizFile);
    navigator.clipboard.writeText(shareLink).then(() => {
        alert('Link do quiz copiado para a área de transferência!');
    });
}

function shareResult(resultTitle, resultEmoji) {
    if (currentQuizFile) {
        const shareLink = generateShareLink(currentQuizFile);
        const shareText = `Eu fiz o quiz e sou ${resultTitle} ${resultEmoji}! Faça o quiz também: ${shareLink}`;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Resultado copiado para a área de transferência!');
        });
    } else {
        alert('Não foi possível gerar o link de compartilhamento.');
    }
}

function openSuggestionBox() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestion-box';
    suggestionBox.innerHTML = `
        <h2>Envie suas sugestões de quiz</h2>
        <textarea placeholder="Digite sua sugestão de quiz aqui...">Tema do Quiz:\nTamanho do Quiz:\n- Número de perguntas:\n- Número médio de alternativas por pergunta:\n- Número de Resultados Diferentes:\nComplexidade:\nAleatoriedade:\nNível de Atrevimento:\nTemas Visuais:\nDesafios:</textarea>
        <input type="file" id="suggestion-file-input" accept=".json" aria-label="Carregar quiz do arquivo">
        <button onclick="sendSuggestion()">Enviar</button>
        <button class="close-button" onclick="closeSuggestionBox()">Fechar</button>
    `;
    document.body.appendChild(suggestionBox);
}

function closeSuggestionBox() {
    const overlay = document.querySelector('.overlay');
    const suggestionBox = document.querySelector('.suggestion-box');
    if (overlay) overlay.remove();
    if (suggestionBox) suggestionBox.remove();
}

function sendSuggestion() {
    const email = 'luciano.wxc@gmail.com';
    const subject = 'Sugestão de Quiz';
    const body = document.querySelector('.suggestion-box textarea').value;
    const fileInput = document.getElementById('suggestion-file-input');
    const file = fileInput.files[0];

    if (body || file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const fileContent = event.target.result;
                window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&attachment=${encodeURIComponent(fileContent)}`;
                closeSuggestionBox();
            };
            reader.readAsText(file);
        } else {
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            closeSuggestionBox();
        }
    } else {
        alert('Por favor, digite sua sugestão ou selecione um arquivo JSON.');
    }
}

function updateProgress() {
    const progress = document.getElementById('progress');
    if (progress) {
        const hasBranching = quizData.questions.some(question =>
            question.answers.some(answer => answer.nextQuestion)
        );
        progress.textContent = hasBranching
            ? `Pergunta ${questionHistory.length + 1} · ${questionHistory.length} respondidas`
            : `Pergunta ${currentQuestionIndex + 1} de ${quizData.questions.length}`;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeStyles();
    updateDarkModeStatus(); // Update dark mode status on toggle
}

function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeStyles();
    updateDarkModeStatus(); // Update dark mode status on load
}

function updateDarkModeStyles() {
    const elements = document.querySelectorAll('.quiz-container, h2, h3, p, .quiz-post, input[type="file"], input[type="search"], select');
    elements.forEach(element => {
        if (document.body.classList.contains('dark-mode')) {
            element.classList.add('dark-mode');
        } else {
            element.classList.remove('dark-mode');
        }
    });
}

function toggleAnimation() {
    animationEnabled = !animationEnabled;
    localStorage.setItem('animationEnabled', animationEnabled);
    updateAnimationStatus(); // Update animation status on toggle
}

function loadAnimationPreference() {
    const storedPreference = localStorage.getItem('animationEnabled');
    if (storedPreference !== null) {
        animationEnabled = storedPreference === 'true';
    }
    updateAnimationStatus(); // Update animation status on load
}

function loadAlternativeResultsPreference() {
    const storedPreference = localStorage.getItem('alternativeResultsEnabled');
    if (storedPreference !== null) {
        alternativeResultsEnabled = storedPreference === 'true';
    }

    const toggle = document.getElementById('alternative-results-toggle');
    toggle.checked = alternativeResultsEnabled;
    toggle.addEventListener('change', () => {
        alternativeResultsEnabled = toggle.checked;
        localStorage.setItem('alternativeResultsEnabled', alternativeResultsEnabled);
    });
}

function updateAnimationStatus() {
    const statusElement = document.getElementById('animation-status');
    if (animationEnabled) {
        statusElement.textContent = '✅';
    } else {
        statusElement.textContent = '❌';
    }
}

function updateDarkModeStatus() {
    const statusElement = document.getElementById('dark-mode-status');
    if (document.body.classList.contains('dark-mode')) {
        statusElement.textContent = '✅';
    } else {
        statusElement.textContent = '❌';
    }
}

function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}
