let quizData;
let currentQuestionIndex = 0;
let scores = {};

document.addEventListener('DOMContentLoaded', () => {
    loadQuizList();
    document.getElementById('quiz-title').textContent = 'Escolha seu Quiz';
});

async function loadQuizList() {
    try {
        const response = await fetch('quizList.json');
        const data = await response.json();
        populateQuizPosts(data.quizzes);
    } catch (error) {
        console.error('Erro ao carregar a lista de quizzes:', error);
    }
}

function populateQuizPosts(quizzes) {
    const quizPostsContainer = document.getElementById('quiz-posts');
    quizPostsContainer.innerHTML = ''; // Reset posts
    quizzes.forEach(quiz => {
        const post = document.createElement('div');
        post.className = 'quiz-post';
        post.innerHTML = `
            <h3>${quiz.name}</h3>
            <p>${quiz.description}</p>
            <button onclick="loadQuizFromPost('${quiz.file}')">Começar Quiz</button>
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
    loadQuizList();
    document.getElementById('quiz-posts').classList.remove('hidden'); // Show quiz posts
}

function toggleFooterText() {
    document.querySelector('footer').classList.toggle('show-text');
}