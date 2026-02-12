#!/usr/bin/env node

/**
 * Auto-Add Quiz to quizList.json
 * 
 * Executa no GitHub Actions para adicionar automaticamente
 * novos quizzes ao quizList.json baseado em metadados do JSON
 * 
 * Uso:
 *   node scripts/auto-add-quiz.js quizzes/meuQuiz.json
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

const quizFile = process.argv[2];

if (!quizFile) {
  log('❌ Uso: node scripts/auto-add-quiz.js quizzes/meuQuiz.json', 'red');
  process.exit(1);
}

try {
  // Ler o quiz
  const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
  
  if (!quizData.title) {
    log('❌ Quiz não tem title', 'red');
    process.exit(1);
  }

  // Ler quizList.json
  const quizListPath = path.join(path.dirname(quizFile), '..', 'quizList.json');
  const quizList = JSON.parse(fs.readFileSync(quizListPath, 'utf8'));

  // Verificar se já existe
  const fileName = path.basename(quizFile);
  const exists = quizList.quizzes.some(q => q.file === `quizzes/${fileName}`);

  if (exists) {
    log(`⚠️  Quiz já existe em quizList.json`, 'yellow');
    process.exit(0);
  }

  // Criar entrada
  const description = quizData.subtitle || 
    `Descubra seu resultado em "${quizData.title}"!`;

  const newEntry = {
    name: quizData.title,
    file: `quizzes/${fileName}`,
    description: description
  };

  // Adicionar no início (mais recentes primeiro)
  quizList.quizzes.unshift(newEntry);

  // Salvar
  fs.writeFileSync(quizListPath, JSON.stringify(quizList, null, 2) + '\n', 'utf8');

  log(`✅ Quiz adicionado: "${quizData.title}"`, 'green');
  log(`   Arquivo: quizzes/${fileName}`, 'blue');
  log(`   Descrição: ${description}`, 'blue');

} catch (error) {
  log(`❌ Erro: ${error.message}`, 'red');
  process.exit(1);
}
