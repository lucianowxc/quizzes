let quizData;
let currentQuestionIndex = 0;
let scores = {};
let currentPage = 1;
const quizzesPerPage = 14;
let currentQuizFile = ''; // Store the current quiz file name
let selectedAnswers = []; // Track selected answers
let animationEnabled = true; // Track if animation is enabled

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizFile = urlParams.get('quiz');
    if (quizFile) {
        loadQuizFromPost(quizFile);
    } else {
        loadQuizList();
        document.getElementById('quiz-title').textContent = 'Escolha seu Quiz';
    }
    loadDarkModePreference();
    loadAnimationPreference();
    updateAnimationStatus(); // Update animation status on page load
    updateDarkModeStatus(); // Update dark mode status on page load
});

async function loadQuizList() {
    try {
        showLoadingIndicator();
        const response = await fetch('quizList.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        window.quizzes = data.quizzes.reverse(); // Store quizzes globally in reverse order
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

    const startIndex = (currentPage - 1) * quizzesPerPage;
    const endIndex = startIndex + quizzesPerPage;
    const quizzesToShow = window.quizzes.slice(startIndex, endIndex);

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
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    paginationControls.innerHTML = `
        <button onclick="prevPage()" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
        <span>Página ${currentPage} de ${Math.ceil(window.quizzes.length / quizzesPerPage)}</span>
        <button onclick="nextPage()" ${endIndex >= window.quizzes.length ? 'disabled' : ''}>Próxima</button>
    `;
    quizPostsContainer.appendChild(paginationControls);

    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayQuizzes();
    }
}

function nextPage() {
    if ((currentPage * quizzesPerPage) < window.quizzes.length) {
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
            quizData = JSON.parse(event.target.result);
            currentQuizFile = file.name; // Store the current quiz file name
            initializeQuiz();
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo JSON.');
    }
}

function initializeQuiz() {
    document.getElementById('quiz-title').textContent = quizData.title;
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    currentQuestionIndex = 0; // Reset question index
    selectedAnswers = []; // Reset selected answers
    showQuestion();
    document.getElementById('quiz-posts').classList.add('hidden'); // Hide quiz posts
    updateProgress();
}

function showQuestion() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const questionElement = document.createElement('h2');
    questionElement.textContent = quizData.questions[currentQuestionIndex].question;
    questionContainer.appendChild(questionElement);

    quizData.questions[currentQuestionIndex].answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.className = 'option-button';
        button.onclick = () => selectAnswer(index);
        questionContainer.appendChild(button);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '5px'; // Reduce space between buttons

    if (currentQuestionIndex > 0) {
        const previousButton = document.createElement('button');
        previousButton.textContent = 'Anterior';
        previousButton.className = 'previous-button';
        previousButton.onclick = () => previousQuestion();
        buttonContainer.appendChild(previousButton);
    }

    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar à Página Inicial';
    backButton.className = 'back-button';
    backButton.onclick = () => returnToQuizSelection();
    buttonContainer.appendChild(backButton);

    questionContainer.appendChild(buttonContainer);
    updateProgress();
    updateDarkModeStyles(); // Ensure dark mode styles are applied
}

function selectAnswer(answerIndex) {
    selectedAnswers[currentQuestionIndex] = answerIndex;
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        calculateScores();
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function calculateScores() {
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    selectedAnswers.forEach((answerIndex, questionIndex) => {
        const points = quizData.questions[questionIndex].answers[answerIndex].points;
        for (const key in points) {
            scores[key] += points[key];
        }
    });
}

function showResult() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const result = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const { emoji, title, subtitle, text } = quizData.descriptions[result];

    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.innerHTML = `
        <h2 id="result-title">Você é <span id="result-subtitle" class="bold" style="opacity: 0;">${title} ${emoji}</span></h2>
        <div id="result-details" style="opacity: 0;">
            <h3>${subtitle}</h3>
            <p>${text}</p>
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
    showQuestion();
}

function returnToQuizSelection() {
    document.getElementById('quiz-title').textContent = 'Escolha seu Quiz';
    document.getElementById('quiz').innerHTML = '';
    currentQuizFile = ''; // Reset current quiz file
    currentPage = 1; // Reset current page
    loadQuizList(); // Reload quiz list
    document.getElementById('quiz-posts').classList.remove('hidden'); // Show quiz posts
    window.history.replaceState({}, document.title, window.location.pathname); // Clear URL parameters
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
        progress.textContent = `Pergunta ${currentQuestionIndex + 1} de ${quizData.questions.length}`;
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
    const elements = document.querySelectorAll('.quiz-container, h2, h3, p, .quiz-post, input[type="file"], select');
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
