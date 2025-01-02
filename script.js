let quizData;
let currentQuestionIndex = 0;
let scores = {};
let currentPage = 1;
const quizzesPerPage = 14;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizFile = urlParams.get('quiz');
    if (quizFile) {
        loadQuizFromPost(quizFile);
    } else {
        loadQuizList();
        document.getElementById('quiz-title').textContent = 'Escolha seu Quiz';
    }
});

async function loadQuizList() {
    try {
        const response = await fetch('quizList.json');
        const data = await response.json();
            window.quizzes = data.quizzes.reverse(); // Store quizzes globally in reverse order
        displayQuizzes();
    } catch (error) {
        console.error('Erro ao carregar a lista de quizzes:', error);
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
        const response = await fetch(file);
        quizData = await response.json();
        initializeQuiz();
    } catch (error) {
        console.error('Erro ao carregar o quiz selecionado:', error);
    }
}

function loadUploadedQuiz() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            quizData = JSON.parse(event.target.result);
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
    showQuestion();
    document.getElementById('quiz-posts').classList.add('hidden'); // Hide quiz posts
}

function showQuestion() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const questionElement = document.createElement('h2');
    questionElement.textContent = quizData.questions[currentQuestionIndex].question;
    questionContainer.appendChild(questionElement);

    quizData.questions[currentQuestionIndex].answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.className = 'option-button';
        button.onclick = () => selectAnswer(answer.points);
        questionContainer.appendChild(button);
    });
}

function selectAnswer(points) {
    for (const key in points) {
        scores[key] += points[key];
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const questionContainer = document.getElementById('quiz');
    questionContainer.innerHTML = '';

    const result = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const { emoji, title, subtitle, text } = quizData.descriptions[result];

    questionContainer.innerHTML = `
        <h2>Você é ${title} ${emoji}</h2>
        <h3>${subtitle}</h3>
        <p>${text}</p>
        <button onclick="restartQuiz()">Recomeçar</button>
        <button class="return-button" onclick="returnToQuizSelection()">Voltar à Seleção de Quiz</button>
        <button class="share-button" onclick="shareResult('${title}', '${emoji}')">🔗</button>
    `;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    scores = Object.keys(quizData.descriptions).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    showQuestion();
}

function returnToQuizSelection() {
    document.getElementById('quiz-title').textContent = 'Escolha seu Quiz';
    document.getElementById('quiz').innerHTML = '';
    displayQuizzes();
    document.getElementById('quiz-posts').classList.remove('hidden'); // Show quiz posts
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
    const url = new URL(window.location.href);
    const quizFile = url.searchParams.get('quiz');
    const shareText = `Eu fiz o quiz e sou ${resultTitle} ${resultEmoji}! Faça o quiz também: ${url.origin}${url.pathname}?quiz=${quizFile}`;
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Resultado copiado para a área de transferência!');
    });
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
