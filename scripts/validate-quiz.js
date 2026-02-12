#!/usr/bin/env node

/**
 * Quiz Validation Script
 * 
 * Uso:
 *   node scripts/validate-quiz.js quizzes/meuQuiz.json
 *   node scripts/validate-quiz.js quizzes/meuQuiz.json --check-coverage
 * 
 * Validações:
 * - JSON válido
 * - Campos obrigatórios presentes
 * - Integridade de result-keys
 * - Valores de points normalizados
 * - Cobertura de resultados
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Parse arguments
const args = process.argv.slice(2);
const filePath = args[0];
const checkCoverage = args.includes('--check-coverage');

if (!filePath) {
  error('Uso: node scripts/validate-quiz.js <caminho-do-arquivo.json>');
  process.exit(1);
}

// Campos obrigatórios vs opcionais
const REQUIRED_FIELDS = ['title', 'questions', 'descriptions'];
const OPTIONAL_FIELDS = ['subtitle'];

if (!fs.existsSync(filePath)) {
  error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

// Read and parse JSON
let quizData;
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  quizData = JSON.parse(fileContent);
  success('JSON válido');
} catch (err) {
  error(`JSON inválido: ${err.message}`);
  process.exit(1);
}

// Validation results
let validationsPassed = 0;
let validationsFailed = 0;

// ============================================================================
// 1. CAMPOS OBRIGATÓRIOS
// ============================================================================
info('\n📋 Validando campos obrigatórios...');

const requiredFields = {
  title: 'string',
  questions: 'array',
  descriptions: 'object',
};

for (const [field, expectedType] of Object.entries(requiredFields)) {
  if (!(field in quizData)) {
    error(`Campo faltando: "${field}"`);
    validationsFailed++;
  } else if (expectedType === 'array' && !Array.isArray(quizData[field])) {
    error(`"${field}" deve ser um array`);
    validationsFailed++;
  } else if (expectedType === 'object' && typeof quizData[field] !== 'object') {
    error(`"${field}" deve ser um objeto`);
    validationsFailed++;
  } else if (expectedType === 'string' && typeof quizData[field] !== 'string') {
    error(`"${field}" deve ser uma string`);
    validationsFailed++;
  } else {
    success(`Campo "${field}" OK`);
    validationsPassed++;
  }
}

// ============================================================================
// VALIDAÇÕES OPCIONAIS
// ============================================================================
info('\n⚙️  Validando campos opcionais...');

// Subtitle é opcional, mas se presente, não deve estar vazio
if ('subtitle' in quizData) {
  if (quizData.subtitle && quizData.subtitle.trim().length === 0) {
    warning('Subtitle está vazio (campo opcional, mas se presente, não deveria estar vazio)');
  } else if (quizData.subtitle) {
    success(`Subtitle: "${quizData.subtitle.substring(0, 50)}..."`);
    validationsPassed++;
  }
} else {
  warning('Subtitle não fornecido (campo opcional, mas recomendado)');
}

// Mínimo de perguntas
if (quizData.questions && quizData.questions.length < 3) {
  error(`Mínimo 3 perguntas (tem ${quizData.questions.length})`);
  validationsFailed++;
} else if (quizData.questions) {
  success(`${quizData.questions.length} perguntas`);
  validationsPassed++;
}

// Mínimo de resultados
if (quizData.descriptions && Object.keys(quizData.descriptions).length < 1) {
  error(`Mínimo 1 resultado em descriptions (tem ${Object.keys(quizData.descriptions).length})`);
  validationsFailed++;
} else if (quizData.descriptions) {
  const resultCount = Object.keys(quizData.descriptions).length;
  if (resultCount === 1) {
    warning(`Apenas 1 resultado (geralmente recomenda-se 2+)`);
  } else {
    success(`${resultCount} resultados`);
    validationsPassed++;
  }
}

// ============================================================================
// 2. VALIDAÇÃO DE PERGUNTAS E RESPOSTAS
// ============================================================================
info('\n❓ Validando perguntas e respostas...');

let questionsValid = true;
quizData.questions?.forEach((q, qIdx) => {
  if (!q.question) {
    error(`Pergunta ${qIdx + 1}: campo "question" faltando`);
    questionsValid = false;
  }
  if (!Array.isArray(q.answers) || q.answers.length === 0) {
    error(`Pergunta ${qIdx + 1}: campo "answers" faltando ou vazio`);
    questionsValid = false;
  }
  q.answers?.forEach((a, aIdx) => {
    if (!a.text) {
      error(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: campo "text" faltando`);
      questionsValid = false;
    }
    if (a.text && a.text.length < 5) {
      warning(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: texto muito curto (${a.text.length} chars)`);
    }
    if (a.text && a.text.length > 100) {
      warning(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: texto muito longo (${a.text.length} chars)`);
    }
    if (!a.points || typeof a.points !== 'object') {
      error(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: campo "points" faltando ou inválido`);
      questionsValid = false;
    }
  });
});

if (questionsValid) {
  success('Todas as perguntas e respostas estão estruturadas corretamente');
  validationsPassed++;
} else {
  validationsFailed++;
}

// ============================================================================
// 3. INTEGRIDADE DE RESULT-KEYS
// ============================================================================
info('\n🔑 Validando integridade de result-keys...');

const resultKeys = Object.keys(quizData.descriptions || {});
let keysValid = true;

quizData.questions?.forEach((q, qIdx) => {
  q.answers?.forEach((a, aIdx) => {
    for (const key in a.points || {}) {
      if (!resultKeys.includes(key)) {
        error(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: result-key "${key}" não existe em descriptions`);
        keysValid = false;
      }
    }
  });
});

if (keysValid) {
  success('Todas as result-keys em points existem em descriptions');
  validationsPassed++;
} else {
  validationsFailed++;
}

// ============================================================================
// 4. VALIDAÇÃO DE POINTS (NORMALIZAÇÃO)
// ============================================================================
info('\n📊 Validando normalização de points...');

let pointsValid = true;
quizData.questions?.forEach((q, qIdx) => {
  q.answers?.forEach((a, aIdx) => {
    for (const [key, value] of Object.entries(a.points || {})) {
      if (typeof value !== 'number') {
        error(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: points["${key}"] não é número (é ${typeof value})`);
        pointsValid = false;
      }
      if (value > 1.0) {
        warning(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: points["${key}"] = ${value} (recomendado ≤ 0.9)`);
      }
      if (value < 0) {
        error(`Pergunta ${qIdx + 1}, Resposta ${aIdx + 1}: points["${key}"] = ${value} (não pode ser negativo)`);
        pointsValid = false;
      }
    }
  });
});

if (pointsValid) {
  success('Todos os points estão normalizados (números válidos)');
  validationsPassed++;
} else {
  validationsFailed++;
}

// ============================================================================
// 5. VALIDAÇÃO DE DESCRIPTIONS
// ============================================================================
info('\n🎯 Validando descriptions...');

let descriptionsValid = true;
for (const [key, desc] of Object.entries(quizData.descriptions || {})) {
  if (!desc.title) {
    error(`Description "${key}": campo "title" faltando`);
    descriptionsValid = false;
  }
  if (!desc.emoji) {
    error(`Description "${key}": campo "emoji" faltando`);
    descriptionsValid = false;
  }
  if (!desc.text) {
    warning(`Description "${key}": campo "text" faltando (recomendado)`);
  }
}

if (descriptionsValid) {
  success('Todas as descriptions têm campos obrigatórios');
  validationsPassed++;
} else {
  validationsFailed++;
}

// ============================================================================
// 6. COBERTURA DE RESULTADOS (Opcional)
// ============================================================================
if (checkCoverage) {
  info('\n🌳 Analisando cobertura de resultados...');
  
  const resultScores = {};
  resultKeys.forEach(key => {
    resultScores[key] = 0;
  });

  // Gerar todas as combinações de respostas e calcular scores
  function generateCombinations(questionIdx = 0, currentScores = {}) {
    if (questionIdx === quizData.questions.length) {
      // Registrar combinação
      for (const key in currentScores) {
        resultScores[key] = Math.max(resultScores[key], currentScores[key]);
      }
      return;
    }

    const q = quizData.questions[questionIdx];
    q.answers.forEach(a => {
      const newScores = { ...currentScores };
      for (const key in a.points) {
        newScores[key] = (newScores[key] || 0) + a.points[key];
      }
      generateCombinations(questionIdx + 1, newScores);
    });
  }

  // Limitar a combinações se for muito grande
  const totalCombinations = quizData.questions.reduce((acc, q) => acc * q.answers.length, 1);
  if (totalCombinations > 100000) {
    warning(`Muitas combinações (${totalCombinations}). Pulando análise de cobertura.`);
  } else {
    generateCombinations();
    
    // Verificar se todos os resultados são alcançáveis
    let allReachable = true;
    for (const key of resultKeys) {
      if (resultScores[key] === 0) {
        error(`Resultado "${key}" pode ser inalcançável`);
        allReachable = false;
      }
    }
    
    if (allReachable) {
      success('Todos os resultados são alcançáveis');
      validationsPassed++;
    } else {
      validationsFailed++;
    }
  }
}

// ============================================================================
// 7. VALIDAÇÃO DE BRANCHING (Se aplicável)
// ============================================================================
info('\n⚙️  Validando branching condicional...');

// Gerar IDs automáticos se ausentes (necessário para validar nextQuestion)
quizData.questions.forEach((q, idx) => {
  if (!q.id) {
    q.id = `q${idx}`;
  }
});

// Coletar todos os IDs
const questionIds = new Set();
quizData.questions.forEach((q) => {
  if (questionIds.has(q.id)) {
    error(`❌ ID duplicado: "${q.id}"`);
  }
  questionIds.add(q.id);
});

// Validar referências de nextQuestion
let branchingValid = true;
const hasBranching = quizData.questions.some(q => 
  q.answers?.some(a => a.nextQuestion)
);

quizData.questions.forEach((q, idx) => {
  q.answers?.forEach((a, aIdx) => {
    if (a.nextQuestion) {
      if (!questionIds.has(a.nextQuestion)) {
        error(`❌ Pergunta ${idx + 1}, Resposta ${aIdx + 1}: nextQuestion "${a.nextQuestion}" não existe`);
        branchingValid = false;
      }
    }
  });
});

if (branchingValid) {
  if (hasBranching) {
    success('✅ Branching condicional validado');
    validationsPassed++;
  } else {
    info('ℹ️  Branching não detectado (quiz linear)');
  }
} else {
  validationsFailed++;
}

// ============================================================================
// RESULTADO FINAL
// ============================================================================
info('\n' + '='.repeat(60));
log(`✅ Validações passadas: ${validationsPassed}`, 'green');
log(`❌ Validações falhadas: ${validationsFailed}`, validationsFailed > 0 ? 'red' : 'green');
info('='.repeat(60) + '\n');

if (validationsFailed === 0) {
  success('🎉 Quiz pronto para PR!');
  process.exit(0);
} else {
  error('⚠️  Corrija os erros acima antes de fazer push.');
  process.exit(1);
}
