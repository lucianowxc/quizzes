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
        populateQuizList(data.quizzes);
    } catch (error) {
        console.error('Erro ao carregar a lista de quizzes:', error);
    }
}

function populateQuizList(quizzes) {
    const quizSelect = document.getElementById('quiz-select');
    quizzes.forEach(quiz => {
        const option = document.createElement('option');
        option.value = quiz.file;
        option.textContent = quiz.name;
        quizSelect.appendChild(option);
    });
}

async function loadSelectedQuiz() {
    const quizSelect = document.getElementById('quiz-select');
    const selectedQuiz = quizSelect.value;
    if (selectedQuiz) {
        try {
            const response = await fetch(selectedQuiz);
            quizData = await response.json();
            initializeQuiz();
        } catch (error) {
            console.error('Erro ao carregar o quiz selecionado:', error);
        }
    } else {
        alert('Por favor, selecione um quiz.');
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
    showQuestion();
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
    document.getElementById('quiz').innerHTML = `
        <select id="quiz-select" aria-label="Selecione um quiz">
            <option value="">Selecione um quiz</option>
            <!-- Opções serão adicionadas dinamicamente -->
        </select>
        <button onclick="loadSelectedQuiz()" id="load-quiz-btn">Carregar Quiz</button>
        <input type="file" id="file-input" accept=".json" aria-label="Carregar quiz do arquivo">
        <button onclick="loadUploadedQuiz()" id="load-file-quiz-btn">Carregar Quiz do Arquivo</button>
    `;
    loadQuizList();
}