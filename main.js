document.addEventListener('DOMContentLoaded', function() {
    // Навигация между страницами
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.dataset.page;
            
            // Убираем активный класс со всех кнопок и страниц
            navButtons.forEach(btn => btn.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и странице
            this.classList.add('active');
            document.getElementById(pageId).classList.add('active');
            
            // Останавливаем диктант при переключении страниц
            if (dictationInterval) {
                clearInterval(dictationInterval);
                dictationInterval = null;
            }
        });
    });

    // Инициализация всех страниц
    initSpellChecker();
    initTraining();
    initDictation();
    initStatistics();

    // Модальное окно
    const rulesModal = document.getElementById('rules-modal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', () => {
        rulesModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.style.display = 'none';
        }
    });
});

// ===========================================
// СТРАНИЦА ПРОВЕРКИ ОРФОГРАФИИ
// ===========================================
function initSpellChecker() {
    const textInput = document.getElementById('text-input');
    const textOutput = document.getElementById('text-output');
    const suggestionsList = document.getElementById('suggestions-list');
    const charCount = document.getElementById('char-count');
    const errorCount = document.getElementById('error-count');
    const correctCount = document.getElementById('correct-count');
    
    const checkSpellingBtn = document.getElementById('check-spelling');
    const checkGrammarBtn = document.getElementById('check-grammar');
    const clearTextBtn = document.getElementById('clear-text');
    const pasteTextBtn = document.getElementById('paste-text');
    const sampleTextBtn = document.getElementById('sample-text');
    const applyCorrectionsBtn = document.getElementById('apply-corrections');
    const copyCorrectedBtn = document.getElementById('copy-corrected');
    
    // Словарь с распространёнными ошибками и правильными вариантами
    const spellCheckerDictionary = {
        // Опечатки
        'прввильно': 'правильно',
        'првильно': 'правильно',
        'правильнно': 'правильно',
        'правильноо': 'правильно',
        'правильн': 'правильно',
        'правильнй': 'правильный',
        
        // Сложные слова
        'черезчюр': 'чересчур',
        'чересчур': 'чересчур',
        'чю': 'что',
        'шо': 'что',
        'щас': 'сейчас',
        'ща': 'сейчас',
        'пасиба': 'спасибо',
        'спс': 'спасибо',
        'здраствуйте': 'здравствуйте',
        'здрасте': 'здравствуйте',
        'здравствуте': 'здравствуйте',
        'извените': 'извините',
        'извеняюсь': 'извиняюсь',
        'приветствую': 'приветствую',
        
        // Парные согласные
        'зделать': 'сделать',
        'здесь': 'здесь',
        'здраствуйте': 'здравствуйте',
        'здоровье': 'здоровье',
        'здравоохранение': 'здравоохранение',
        'здание': 'здание',
        'здоровый': 'здоровый',
        'здравый': 'здравый',
        'звук': 'звук',
        'звонок': 'звонок',
        'звонкий': 'звонкий',
        
        // Глаголы
        'ложить': 'класть',
        'ложил': 'клал',
        'покласть': 'положить',
        'кажеться': 'кажется',
        'хочется': 'хочется',
        'идти': 'идти',
        'придти': 'прийти',
        'ейть': 'ей',
        'ейся': 'ейся',
        
        // Существительные
        'девчёнка': 'девчонка',
        'девченка': 'девчонка',
        'мальчёнка': 'мальчонка',
        'мальченка': 'мальчонка',
        'огурци': 'огурцы',
        'помидори': 'помидоры',
        'агенство': 'агентство',
        'агенство': 'агентство',
        'превет': 'привет',
        'преветствую': 'приветствую',
        
        // Прилагательные
        'симпотичный': 'симпатичный',
        'симпотичная': 'симпатичная',
        'симпотичный': 'симпатичный',
        'интиресный': 'интересный',
        'интиресная': 'интересная',
        'интиресное': 'интересное',
        'прекрасный': 'прекрасный',
        'прекрасная': 'прекрасная',
        'прекрасное': 'прекрасное',
        
        // Наречия
        'впринципе': 'в принципе',
        'впринципи': 'в принципе',
        'вобщем': 'в общем',
        'вобще': 'вообще',
        'вобще': 'вообще',
        'вобще-то': 'вообще-то',
        'кароче': 'короче',
        'карочи': 'короче',
        'чё': 'что',
        'чё-то': 'что-то',
        'чё-нибудь': 'что-нибудь',
        'чё-либо': 'что-либо',
        'чё-нибудь': 'что-нибудь'
    };
    
    // Грамматические правила
    const grammarRules = [
        {
            pattern: /\b(\w*[ая])\sмесяц\b/gi,
            correction: '$1 месяца',
            description: 'Неверное согласование существительного с числительным'
        },
        {
            pattern: /\b(\w*[ое])\sраз\b/gi,
            correction: '$1 раза',
            description: 'Неверное согласование существительного с числительным'
        },
        {
            pattern: /\bболее\sлучше\b/gi,
            correction: 'лучше',
            description: 'Тавтология: "более лучше"'
        },
        {
            pattern: /\bсамый\sлучший\b/gi,
            correction: 'лучший',
            description: 'Тавтология: "самый лучший"'
        },
        {
            pattern: /\bскучать\sпо\sвас\b/gi,
            correction: 'скучать по вам',
            description: 'Неверное управление: "скучать по вам"'
        },
        {
            pattern: /\bоплатить\sза\b/gi,
            correction: 'оплатить',
            description: 'Неверное управление: "оплатить" (без "за")'
        },
        {
            pattern: /\bпо\sприезду\b/gi,
            correction: 'по приезде',
            description: 'Неверный падеж: "по приезде"'
        },
        {
            pattern: /\bихний\b/gi,
            correction: 'их',
            description: 'Ненормативная форма: "их" вместо "ихний"'
        },
        {
            pattern: /\bевойный\b/gi,
            correction: 'её',
            description: 'Ненормативная форма: "её" вместо "евойный"'
        },
        {
            pattern: /\bвообщем\b/gi,
            correction: 'в общем',
            description: 'Раздельное написание: "в общем"'
        }
    ];
    
    let currentErrors = [];
    let originalText = '';
    
    // Обновление счётчика символов
    textInput.addEventListener('input', function() {
        const text = this.value;
        charCount.textContent = text.length;
    });
    
    // Очистка текста
    clearTextBtn.addEventListener('click', function() {
        textInput.value = '';
        textOutput.innerHTML = '<p class="placeholder">Здесь будет отображён проверенный текст с выделенными ошибками.</p>';
        suggestionsList.innerHTML = '<p class="placeholder">После проверки здесь появятся варианты исправления ошибок.</p>';
        charCount.textContent = '0';
        errorCount.textContent = '0';
        correctCount.textContent = '0';
        currentErrors = [];
    });
    
    // Вставка текста из буфера обмена
    pasteTextBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            textInput.dispatchEvent(new Event('input'));
        } catch (err) {
            alert('Не удалось получить доступ к буферу обмена. Вставьте текст вручную.');
        }
    });
    
    // Пример текста
    sampleTextBtn.addEventListener('click', function() {
        const sampleText = `Привет! Меня зовут Анна, и я хочу поделиться с вами историей о том, как я научилась грамотно писать по-русски.

Когда я была маленькой, я делала много ошибок в письме. Например, я часто писала "здраствуйте" вместо "здравствуйте", "симпотичный" вместо "симпатичный", и "чересчур" у меня получалось как "черезчюр".

Со временем я поняла, что правильная орфография очень важна. Она помогает лучше выражать свои мысли и производить хорошее впечатление на других людей.

Сейчас я стараюсь писать правильно, но иногда всё равно допускаю ошибки. Поэтому я использую различные тренажёры и проверяю свои тексты перед отправкой.

Надеюсь, что мой пример вдохновит вас тоже работать над своей грамотностью!`;
        
        textInput.value = sampleText;
        textInput.dispatchEvent(new Event('input'));
    });
    
    // Проверка орфографии
    checkSpellingBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Введите текст для проверки');
            return;
        }
        
        originalText = text;
        checkText(text, 'spelling');
    });
    
    // Проверка грамматики
    checkGrammarBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Введите текст для проверки');
            return;
        }
        
        originalText = text;
        checkText(text, 'grammar');
    });
    
    // Функция проверки текста
    function checkText(text, type) {
        currentErrors = [];
        let checkedText = text;
        let totalErrors = 0;
        let totalCorrect = 0;
        
        if (type === 'spelling') {
            // Проверка орфографии
            const words = text.split(/\s+/);
            totalCorrect = words.length;
            
            for (const [error, correction] of Object.entries(spellCheckerDictionary)) {
                const regex = new RegExp(`\\b${error}\\b`, 'gi');
                if (regex.test(checkedText)) {
                    const matches = checkedText.match(regex);
                    matches.forEach(match => {
                        currentErrors.push({
                            error: match,
                            correction: correction,
                            description: `Орфографическая ошибка: "${match}" → "${correction}"`,
                            type: 'spelling'
                        });
                    });
                    
                    checkedText = checkedText.replace(regex, `<span class="error" data-error="${error}" data-correction="${correction}">$&</span>`);
                }
            }
            
            totalErrors = currentErrors.length;
            totalCorrect = Math.max(0, totalCorrect - totalErrors);
        } else {
            // Проверка грамматики
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            totalCorrect = sentences.length;
            
            grammarRules.forEach(rule => {
                if (rule.pattern.test(checkedText)) {
                    const matches = checkedText.match(rule.pattern);
                    matches.forEach(match => {
                        const corrected = match.replace(rule.pattern, rule.correction);
                        currentErrors.push({
                            error: match,
                            correction: corrected,
                            description: rule.description,
                            type: 'grammar'
                        });
                        
                        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const errorRegex = new RegExp(escapedMatch, 'g');
                        checkedText = checkedText.replace(errorRegex, `<span class="error" data-error="${match}" data-correction="${corrected}">${match}</span>`);
                    });
                }
            });
            
            totalErrors = currentErrors.length;
            totalCorrect = Math.max(0, totalCorrect - totalErrors);
        }
        
        // Обновляем интерфейс
        textOutput.innerHTML = checkedText || '<p class="placeholder">Текст не содержит ошибок!</p>';
        errorCount.textContent = totalErrors;
        correctCount.textContent = totalCorrect;
        
        // Отображаем предложения по исправлению
        displaySuggestions();
        
        // Добавляем обработчики кликов на ошибки
        addErrorClickHandlers();
    }
    
    // Отображение предложений по исправлению
    function displaySuggestions() {
        suggestionsList.innerHTML = '';
        
        if (currentErrors.length === 0) {
            suggestionsList.innerHTML = '<p class="placeholder">Ошибок не найдено! Текст написан грамотно.</p>';
            return;
        }
        
        currentErrors.forEach((error, index) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-text">
                    <strong>${error.error}</strong> → <strong>${error.correction}</strong>
                    <br>
                    <small>${error.description}</small>
                </div>
                <div class="suggestion-actions">
                    <button class="suggestion-btn apply-suggestion" data-index="${index}">Исправить</button>
                </div>
            `;
            suggestionsList.appendChild(suggestionItem);
        });
        
        // Добавляем обработчики для кнопок исправления
        document.querySelectorAll('.apply-suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                applySingleCorrection(index);
            });
        });
    }
    
    // Добавление обработчиков кликов на ошибки
    function addErrorClickHandlers() {
        document.querySelectorAll('.error').forEach(errorSpan => {
            errorSpan.addEventListener('click', function() {
                const error = this.dataset.error;
                const correction = this.dataset.correction;
                
                // Находим индекс ошибки в массиве currentErrors
                const errorIndex = currentErrors.findIndex(e => e.error === error && e.correction === correction);
                
                if (errorIndex !== -1) {
                    applySingleCorrection(errorIndex);
                }
            });
        });
    }
    
    // Применение одного исправления
    function applySingleCorrection(errorIndex) {
        if (errorIndex < 0 || errorIndex >= currentErrors.length) return;
        
        const error = currentErrors[errorIndex];
        
        // Обновляем текст в textarea
        let newText = originalText;
        const errorRegex = new RegExp(`\\b${escapeRegExp(error.error)}\\b`, 'gi');
        newText = newText.replace(errorRegex, error.correction);
        
        // Обновляем оригинальный текст
        originalText = newText;
        textInput.value = newText;
        
        // Удаляем исправленную ошибку из массива
        currentErrors.splice(errorIndex, 1);
        
        // Повторно проверяем текст
        checkText(newText, 'spelling');
    }
    
    // Применение всех исправлений
    applyCorrectionsBtn.addEventListener('click', function() {
        if (currentErrors.length === 0) {
            alert('Нет ошибок для исправления');
            return;
        }
        
        let newText = originalText;
        
        // Применяем все исправления
        currentErrors.forEach(error => {
            const errorRegex = new RegExp(`\\b${escapeRegExp(error.error)}\\b`, 'gi');
            newText = newText.replace(errorRegex, error.correction);
        });
        
        // Обновляем текст
        originalText = newText;
        textInput.value = newText;
        
        // Очищаем ошибки и проверяем заново
        currentErrors = [];
        checkText(newText, 'spelling');
    });
    
    // Копирование исправленного текста
    copyCorrectedBtn.addEventListener('click', async function() {
        if (!originalText) {
            alert('Нет текста для копирования');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(originalText);
            alert('Текст скопирован в буфер обмена!');
        } catch (err) {
            alert('Не удалось скопировать текст');
        }
    });
    
    // Вспомогательная функция для экранирования спецсимволов в регулярных выражениях
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// ===========================================
// СТРАНИЦА ТРЕНИРОВКИ
// ===========================================
function initTraining() {
    const trainingTypeCards = document.querySelectorAll('.training-type-card');
    const startTrainingBtn = document.getElementById('start-training');
    const restartTrainingBtn = document.getElementById('restart-training');
    const nextQuestionBtn = document.getElementById('next-question');
    const questionNumber = document.getElementById('question-number');
    const scoreElement = document.getElementById('score');
    const progressBar = document.getElementById('progress-bar');
    const questionText = document.getElementById('question-text');
    const exerciseOptions = document.getElementById('exercise-options');
    const exerciseFeedback = document.getElementById('exercise-feedback');
    const feedbackText = document.getElementById('feedback-text');
    
    let currentTrainingType = 'choose-word';
    let currentQuestion = 0;
    let score = 0;
    let totalQuestions = 10;
    let trainingData = [];
    let selectedOption = null;
    
    // Данные для тренировок
    const trainingDataSources = {
        'choose-word': [
            {
                question: 'Выберите правильный вариант написания:',
                word: 'ка...ван',
                options: ['караван', 'корован', 'карован', 'каравон'],
                correct: 0,
                explanation: 'Правильно: "караван". Это слово пишется через "а" в обоих слогах.'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'аг...нство',
                options: ['агентство', 'агенство', 'агэнство', 'агентствво'],
                correct: 0,
                explanation: 'Правильно: "агентство". В слове есть буква "т" после "н".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'инт...ресный',
                options: ['интересный', 'интиресный', 'энтересный', 'интерсный'],
                correct: 0,
                explanation: 'Правильно: "интересный". Пишется через "е" после "т".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'пр...зидент',
                options: ['президент', 'призидент', 'прэзидент', 'презедент'],
                correct: 0,
                explanation: 'Правильно: "президент". Первая гласная - "е".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'к...мпьютер',
                options: ['компьютер', 'кампьютер', 'компютер', 'компьютор'],
                correct: 0,
                explanation: 'Правильно: "компьютер". Первая гласная - "о", после "п" стоит "ь".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'эк...замен',
                options: ['экзамен', 'эгзамен', 'экзамин', 'экзамэн'],
                correct: 0,
                explanation: 'Правильно: "экзамен". Пишется через "з" и "а".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'тр...мвай',
                options: ['трамвай', 'тромвай', 'трамвей', 'тромвей'],
                correct: 0,
                explanation: 'Правильно: "трамвай". Первая гласная - "а".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'ш...колад',
                options: ['шоколад', 'шакалад', 'шоколат', 'шакалат'],
                correct: 0,
                explanation: 'Правильно: "шоколад". Первая гласная - "о", последняя - "д".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'х...р...шо',
                options: ['хорошо', 'хорашо', 'харашо', 'хороша'],
                correct: 0,
                explanation: 'Правильно: "хорошо". Первая гласная - "о", вторая - "о".'
            },
            {
                question: 'Выберите правильный вариант написания:',
                word: 'з...р...кало',
                options: ['зеркало', 'зеракало', 'зиркало', 'зеркала'],
                correct: 0,
                explanation: 'Правильно: "зеркало". Первая гласная - "е", вторая - "а".'
            }
        ],
        'fill-gap': [
            {
                question: 'Вставьте пропущенную букву:',
                word: 'здр...вствуйте',
                options: ['а', 'о', 'у', 'ы'],
                correct: 0,
                explanation: 'Правильно: "здравствуйте". Пишется через "а" после "др".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'изв...ните',
                options: ['и', 'е', 'ы', 'я'],
                correct: 0,
                explanation: 'Правильно: "извините". Пишется через "и" после "зв".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'бл...годаря',
                options: ['а', 'о', 'у', 'ы'],
                correct: 0,
                explanation: 'Правильно: "благодаря". Пишется через "а" после "бл".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'к...р...ндаш',
                options: ['а, а', 'о, о', 'а, о', 'о, а'],
                correct: 0,
                explanation: 'Правильно: "карандаш". Обе гласные - "а".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'м...л...ко',
                options: ['о, о', 'а, о', 'о, а', 'а, а'],
                correct: 1,
                explanation: 'Правильно: "молоко". Первая гласная - "о", вторая - "о".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'в...кзал',
                options: ['о', 'а', 'э', 'е'],
                correct: 0,
                explanation: 'Правильно: "вокзал". Пишется через "о".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'т...л...фон',
                options: ['е, е', 'и, е', 'е, и', 'и, и'],
                correct: 0,
                explanation: 'Правильно: "телефон". Обе гласные - "е".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'д...р...во',
                options: ['е, е', 'и, е', 'е, и', 'и, и'],
                correct: 0,
                explanation: 'Правильно: "дерево". Обе гласные - "е".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'с...бака',
                options: ['о', 'а', 'е', 'ы'],
                correct: 0,
                explanation: 'Правильно: "собака". Пишется через "о".'
            },
            {
                question: 'Вставьте пропущенную букву:',
                word: 'ч...ловек',
                options: ['е', 'и', 'ы', 'э'],
                correct: 0,
                explanation: 'Правильно: "человек". Пишется через "е".'
            }
        ],
        'find-error': [
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Он ложил книгу на стол.',
                options: ['Ошибки нет', 'ложил', 'книгу', 'на стол'],
                correct: 1,
                explanation: 'Правильно: "Он клал книгу на стол". Глагол "ложить" употребляется только с приставками.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Я хочю поехать в отпуск.',
                options: ['Ошибки нет', 'хочю', 'поехать', 'в отпуск'],
                correct: 1,
                explanation: 'Правильно: "Я хочу поехать в отпуск". Глагол "хотеть" в 1 лице ед. числа: "хочу".'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Этот фильм более лучше того.',
                options: ['Ошибки нет', 'более лучше', 'того', 'Этот фильм'],
                correct: 1,
                explanation: 'Правильно: "Этот фильм лучше того". "Более лучше" - тавтология.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Ихний дом находится рядом с парком.',
                options: ['Ошибки нет', 'Ихний', 'находится', 'рядом с парком'],
                correct: 1,
                explanation: 'Правильно: "Их дом находится рядом с парком". "Ихний" - просторечная форма.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Я оплатил за обучение в университете.',
                options: ['Ошибки нет', 'оплатил за', 'в университете', 'обучение'],
                correct: 1,
                explanation: 'Правильно: "Я оплатил обучение в университете". Глагол "оплатить" не требует предлога "за".'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'По приезду в город мы сразу пошли в гостиницу.',
                options: ['Ошибки нет', 'По приезду', 'в город', 'пошли в гостиницу'],
                correct: 1,
                explanation: 'Правильно: "По приезде в город мы сразу пошли в гостиницу". Предлог "по" требует предложного падежа.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Мне нравится эта песня, я её уже слышал.',
                options: ['Ошибки нет', 'нравится', 'эта песня', 'слышал'],
                correct: 0,
                explanation: 'В этом предложении нет ошибок. Все слова написаны правильно.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Вообщем, я решил пойти на эту работу.',
                options: ['Ошибки нет', 'Вообщем', 'решил пойти', 'на эту работу'],
                correct: 1,
                explanation: 'Правильно: "В общем, я решил пойти на эту работу". "В общем" пишется раздельно.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Он сказал, что придёт к восьми часам.',
                options: ['Ошибки нет', 'придёт', 'к восьми часам', 'сказал, что'],
                correct: 0,
                explanation: 'В этом предложении нет ошибок. Все слова написаны правильно.'
            },
            {
                question: 'Найдите ошибку в предложении:',
                sentence: 'Девченка играла во дворе с мячом.',
                options: ['Ошибки нет', 'Девченка', 'играла', 'во дворе'],
                correct: 1,
                explanation: 'Правильно: "Девочка играла во дворе с мячом". Суффикс -очк- после шипящих.'
            }
        ]
    };
    
    // Выбор типа тренировки
    trainingTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            trainingTypeCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentTrainingType = this.dataset.type;
        });
    });
    
    // Начало тренировки
    startTrainingBtn.addEventListener('click', function() {
        startTraining();
    });
    
    // Перезапуск тренировки
    restartTrainingBtn.addEventListener('click', function() {
        startTraining();
    });
    
    // Следующий вопрос
    nextQuestionBtn.addEventListener('click', function() {
        if (currentQuestion < totalQuestions - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            finishTraining();
        }
    });
    
    // Функция начала тренировки
    function startTraining() {
        currentQuestion = 0;
        score = 0;
        selectedOption = null;
        
        // Получаем данные для выбранного типа тренировки
        trainingData = [...trainingDataSources[currentTrainingType]];
        
        // Перемешиваем вопросы
        shuffleArray(trainingData);
        
        // Обновляем интерфейс
        scoreElement.textContent = score;
        questionNumber.textContent = '1';
        progressBar.style.width = '0%';
        exerciseFeedback.style.display = 'none';
        
        // Показываем первый вопрос
        showQuestion();
        
        // Активируем кнопку "Следующий вопрос"
        nextQuestionBtn.style.display = 'block';
    }
    
    // Функция отображения вопроса
    function showQuestion() {
        const questionData = trainingData[currentQuestion];
        
        // Обновляем номер вопроса
        questionNumber.textContent = currentQuestion + 1;
        
        // Обновляем прогресс
        progressBar.style.width = `${((currentQuestion) / totalQuestions) * 100}%`;
        
        // Очищаем варианты ответов
        exerciseOptions.innerHTML = '';
        
        // Отображаем вопрос в зависимости от типа тренировки
        if (currentTrainingType === 'choose-word') {
            questionText.textContent = `${questionData.question} ${questionData.word}`;
            
            // Создаем варианты ответов
            questionData.options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.dataset.index = index;
                
                optionBtn.addEventListener('click', function() {
                    if (selectedOption !== null) return;
                    
                    selectedOption = index;
                    checkAnswer(index);
                });
                
                exerciseOptions.appendChild(optionBtn);
            });
        } else if (currentTrainingType === 'fill-gap') {
            questionText.textContent = `${questionData.question} ${questionData.word}`;
            
            // Создаем варианты ответов
            questionData.options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.dataset.index = index;
                
                optionBtn.addEventListener('click', function() {
                    if (selectedOption !== null) return;
                    
                    selectedOption = index;
                    checkAnswer(index);
                });
                
                exerciseOptions.appendChild(optionBtn);
            });
        } else if (currentTrainingType === 'find-error') {
            questionText.textContent = `${questionData.question} "${questionData.sentence}"`;
            
            // Создаем варианты ответов
            questionData.options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.dataset.index = index;
                
                optionBtn.addEventListener('click', function() {
                    if (selectedOption !== null) return;
                    
                    selectedOption = index;
                    checkAnswer(index);
                });
                
                exerciseOptions.appendChild(optionBtn);
            });
        }
        
        // Скрываем обратную связь
        exerciseFeedback.style.display = 'none';
        selectedOption = null;
    }
    
    // Функция проверки ответа
    function checkAnswer(selectedIndex) {
        const questionData = trainingData[currentQuestion];
        const optionButtons = document.querySelectorAll('.option-btn');
        const isCorrect = selectedIndex === questionData.correct;
        
        // Подсвечиваем правильный и неправильный ответы
        optionButtons.forEach((button, index) => {
            if (index === questionData.correct) {
                button.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });
        
        // Обновляем счёт
        if (isCorrect) {
            score += 10;
            scoreElement.textContent = score;
        }
        
        // Показываем обратную связь
        feedbackText.textContent = isCorrect 
            ? `Правильно! ${questionData.explanation}` 
            : `Неправильно. ${questionData.explanation}`;
        
        exerciseFeedback.style.display = 'block';
    }
    
    // Функция завершения тренировки
    function finishTraining() {
        progressBar.style.width = '100%';
        
        // Показываем финальный результат
        exerciseOptions.innerHTML = '';
        questionText.textContent = `Тренировка завершена! Ваш результат: ${score} из ${totalQuestions * 10} баллов`;
        
        // Добавляем поздравление
        let message = '';
        const percentage = (score / (totalQuestions * 10)) * 100;
        
        if (percentage >= 90) {
            message = 'Отличный результат! Вы отлично знаете орфографию!';
        } else if (percentage >= 70) {
            message = 'Хороший результат! Есть над чем поработать, но в целом хорошо!';
        } else if (percentage >= 50) {
            message = 'Удовлетворительный результат. Рекомендуем больше тренироваться!';
        } else {
            message = 'Плохой результат. Необходимо серьёзно заняться орфографией!';
        }
        
        feedbackText.textContent = message;
        exerciseFeedback.style.display = 'block';
        
        // Скрываем кнопку "Следующий вопрос"
        nextQuestionBtn.style.display = 'none';
        
        // Сохраняем результат в статистику
        saveTrainingResult(score, totalQuestions * 10, currentTrainingType);
    }
    
    // Функция перемешивания массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Функция сохранения результата тренировки
    function saveTrainingResult(score, maxScore, type) {
        // Получаем текущую статистику из localStorage
        let stats = JSON.parse(localStorage.getItem('spellCheckerStats')) || {
            totalChecks: 0,
            totalExercises: 0,
            totalScore: 0,
            accuracyRate: 0,
            trainingResults: []
        };
        
        // Обновляем статистику
        stats.totalExercises++;
        stats.totalScore += score;
        
        // Сохраняем результат тренировки
        stats.trainingResults.push({
            date: new Date().toISOString(),
            type: type,
            score: score,
            maxScore: maxScore,
            percentage: (score / maxScore) * 100
        });
        
        // Ограничиваем историю последними 50 результатами
        if (stats.trainingResults.length > 50) {
            stats.trainingResults = stats.trainingResults.slice(-50);
        }
        
        // Пересчитываем среднюю точность
        if (stats.trainingResults.length > 0) {
            const totalPercentage = stats.trainingResults.reduce((sum, result) => sum + result.percentage, 0);
            stats.accuracyRate = Math.round(totalPercentage / stats.trainingResults.length);
        }
        
        // Сохраняем обновлённую статистику
        localStorage.setItem('spellCheckerStats', JSON.stringify(stats));
    }
}

// ===========================================
// СТРАНИЦА ДИКТАНТА
// ===========================================
let dictationInterval = null;
let dictationTimer = 0;
let currentSentenceIndex = 0;
let dictationSentences = [];
let dictationStartTime = null;

function initDictation() {
    const startDictationBtn = document.getElementById('start-dictation');
    const pauseDictationBtn = document.getElementById('pause-dictation');
    const repeatSentenceBtn = document.getElementById('repeat-sentence');
    const checkDictationBtn = document.getElementById('check-dictation');
    const difficultySelect = document.getElementById('difficulty');
    const speedSelect = document.getElementById('speed');
    const dictationLengthSelect = document.getElementById('dictation-length');
    const dictationText = document.getElementById('dictation-text');
    const currentSentenceText = document.getElementById('current-sentence-text');
    const sentenceNumber = document.getElementById('sentence-number');
    const totalSentences = document.getElementById('total-sentences');
    const dictationCharCount = document.getElementById('dictation-char-count');
    const dictationTimerElement = document.getElementById('dictation-timer');
    const dictationResults = document.getElementById('dictation-results');
    const dictationScore = document.getElementById('dictation-score');
    const dictationErrors = document.getElementById('dictation-errors');
    const dictationAccuracy = document.getElementById('dictation-accuracy');
    const detailedResultsList = document.getElementById('detailed-results-list');
    
    // База предложений для диктанта по сложности
    const dictationSentencesData = {
        easy: [
            "Солнце светит ярко.",
            "Дети играют во дворе.",
            "Кошка спит на диване.",
            "Мама готовит обед.",
            "Папа читает газету.",
            "В саду цветут розы.",
            "Птицы поют весной.",
            "Река течёт быстро.",
            "Небо сегодня голубое.",
            "Зимой идёт снег."
        ],
        medium: [
            "Вчера мы ходили в лес за грибами.",
            "Мой друг учится играть на гитаре.",
            "Осенью листья становятся жёлтыми и красными.",
            "Бабушка испекла вкусный яблочный пирог.",
            "По утрам я всегда пью зелёный чай.",
            "Наш класс поедет на экскурсию в музей.",
            "Вечером мы смотрим интересные фильмы.",
            "Собака весело бегает по полю.",
            "Я люблю читать книги о приключениях.",
            "Завтра будет важная контрольная работа."
        ],
        hard: [
            "Несмотря на проливной дождь, мы решили продолжить путешествие.",
            "Искусственный интеллект постепенно меняет нашу повседневную жизнь.",
            "Путешествуя по Европе, мы посетили множество исторических мест.",
            "Современные технологии позволяют работать удалённо из любой точки мира.",
            "Изучение иностранных языков развивает мышление и расширяет кругозор.",
            "Экологические проблемы становятся всё более актуальными для человечества.",
            "Классическая литература формирует нравственные ценности у подрастающего поколения.",
            "Развитие науки и техники открывает новые перспективы для будущего.",
            "Здоровый образ жизни включает правильное питание и регулярные физические нагрузки.",
            "Глобальное потепление оказывает значительное влияние на климатические изменения."
        ]
    };
    
    // Скорость диктовки (интервал между словами в мс)
    const speedSettings = {
        slow: 1200,
        normal: 800,
        fast: 500
    };
    
    // Количество предложений по длине диктанта
    const lengthSettings = {
        short: { min: 3, max: 5 },
        medium: { min: 5, max: 8 },
        long: { min: 8, max: 12 }
    };
    
    // Начало диктанта
    startDictationBtn.addEventListener('click', function() {
        // Получаем настройки
        const difficulty = difficultySelect.value;
        const speed = speedSelect.value;
        const length = dictationLengthSelect.value;
        
        // Генерируем предложения
        dictationSentences = generateDictationSentences(difficulty, length);
        
        // Сбрасываем состояние
        currentSentenceIndex = 0;
        dictationTimer = 0;
        dictationText.value = '';
        dictationText.disabled = false;
        dictationText.focus();
        dictationResults.style.display = 'none';
        
        // Обновляем интерфейс
        totalSentences.textContent = dictationSentences.length;
        sentenceNumber.textContent = '0';
        dictationCharCount.textContent = '0';
        dictationTimerElement.textContent = '00:00';
        
        // Активируем/деактивируем кнопки
        startDictationBtn.disabled = true;
        pauseDictationBtn.disabled = false;
        repeatSentenceBtn.disabled = false;
        checkDictationBtn.disabled = true;
        
        // Запускаем таймер
        dictationStartTime = Date.now();
        startDictationTimer();
        
        // Начинаем диктовку первого предложения
        dictateSentence();
    });
    
    // Пауза диктанта
    pauseDictationBtn.addEventListener('click', function() {
        if (dictationInterval) {
            clearInterval(dictationInterval);
            dictationInterval = null;
            this.innerHTML = '<i class="fas fa-play"></i> Продолжить';
            dictationText.disabled = true;
        } else {
            startDictationTimer();
            this.innerHTML = '<i class="fas fa-pause"></i> Пауза';
            dictationText.disabled = false;
            dictateSentence(); // Продолжаем диктовку текущего предложения
        }
    });
    
    // Повтор предложения
    repeatSentenceBtn.addEventListener('click', function() {
        if (currentSentenceIndex < dictationSentences.length) {
            dictateSentence();
        }
    });
    
    // Проверка диктанта
    checkDictationBtn.addEventListener('click', function() {
        checkDictation();
    });
    
    // Обновление счётчика символов
    dictationText.addEventListener('input', function() {
        dictationCharCount.textContent = this.value.length;
        
        // Активируем кнопку проверки, если текст введён
        if (this.value.trim().length > 0) {
            checkDictationBtn.disabled = false;
        } else {
            checkDictationBtn.disabled = true;
        }
    });
    
    // Функция генерации предложений для диктанта
    function generateDictationSentences(difficulty, length) {
        const sentences = dictationSentencesData[difficulty];
        const lengthSettings = {
            short: { min: 3, max: 5 },
            medium: { min: 5, max: 8 },
            long: { min: 8, max: 10 }
        };
        
        const { min, max } = lengthSettings[length];
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Перемешиваем предложения и выбираем нужное количество
        const shuffled = [...sentences].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // Функция диктовки предложения
    function dictateSentence() {
        if (currentSentenceIndex >= dictationSentences.length) {
            // Все предложения продиктованы
            currentSentenceText.textContent = "Диктант завершён. Проверьте свой текст.";
            return;
        }
        
        const sentence = dictationSentences[currentSentenceIndex];
        currentSentenceText.textContent = sentence;
        sentenceNumber.textContent = currentSentenceIndex + 1;
        
        // Увеличиваем индекс для следующего предложения
        currentSentenceIndex++;
        
        // Автоматически переходим к следующему предложению через некоторое время
        setTimeout(() => {
            if (currentSentenceIndex < dictationSentences.length && dictationInterval) {
                dictateSentence();
            } else if (currentSentenceIndex >= dictationSentences.length) {
                currentSentenceText.textContent = "Диктант завершён. Проверьте свой текст.";
            }
        }, 5000); // 5 секунд на запись каждого предложения
    }
    
    // Функция запуска таймера
    function startDictationTimer() {
        if (dictationInterval) {
            clearInterval(dictationInterval);
        }
        
        dictationInterval = setInterval(() => {
            dictationTimer++;
            const minutes = Math.floor(dictationTimer / 60);
            const seconds = dictationTimer % 60;
            dictationTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // Функция проверки диктанта
    function checkDictation() {
        const userText = dictationText.value.trim();
        const originalText = dictationSentences.join(' ');
        
        if (!userText) {
            alert('Введите текст диктанта для проверки');
            return;
        }
        
        // Останавливаем таймер
        if (dictationInterval) {
            clearInterval(dictationInterval);
            dictationInterval = null;
        }
        
        // Сравниваем тексты
        const userSentences = userText.split(/[.!?]+/).filter(s => s.trim()).map(s => s.trim());
        const originalSentences = dictationSentences.map(s => s.trim());
        
        let totalErrors = 0;
        let totalWords = 0;
        const detailedResults = [];
        
        // Сравниваем предложения
        const maxSentences = Math.min(userSentences.length, originalSentences.length);
        
        for (let i = 0; i < maxSentences; i++) {
            const userSentence = userSentences[i];
            const originalSentence = originalSentences[i];
            
            // Разбиваем на слова
            const userWords = userSentence.split(/\s+/);
            const originalWords = originalSentence.split(/\s+/);
            
            totalWords += originalWords.length;
            
            // Сравниваем слова
            const maxWords = Math.min(userWords.length, originalWords.length);
            let sentenceErrors = 0;
            let errorDetails = [];
            
            for (let j = 0; j < maxWords; j++) {
                if (userWords[j].toLowerCase() !== originalWords[j].toLowerCase()) {
                    sentenceErrors++;
                    errorDetails.push({
                        word: userWords[j],
                        correct: originalWords[j],
                        position: j
                    });
                }
            }
            
            // Добавляем ошибки за пропущенные или лишние слова
            if (userWords.length !== originalWords.length) {
                sentenceErrors += Math.abs(userWords.length - originalWords.length);
            }
            
            totalErrors += sentenceErrors;
            
            // Сохраняем детальную информацию
            detailedResults.push({
                sentence: originalSentence,
                userSentence: userSentence,
                errors: sentenceErrors,
                errorDetails: errorDetails,
                isCorrect: sentenceErrors === 0
            });
        }
        
        // Добавляем ошибки за пропущенные или лишние предложения
        if (userSentences.length !== originalSentences.length) {
            totalErrors += Math.abs(userSentences.length - originalSentences.length);
        }
        
        // Рассчитываем баллы
        const maxPossibleErrors = totalWords * 0.5; // Максимальное количество ошибок для расчёта
        const errorScore = Math.max(0, maxPossibleErrors - totalErrors);
        const score = Math.round((errorScore / maxPossibleErrors) * 100);
        const accuracy = totalWords > 0 ? Math.round(((totalWords - totalErrors) / totalWords) * 100) : 0;
        
        // Отображаем результаты
        dictationScore.textContent = score;
        dictationErrors.textContent = totalErrors;
        dictationAccuracy.textContent = `${accuracy}%`;
        
        // Отображаем детальные результаты
        detailedResultsList.innerHTML = '';
        detailedResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = `detailed-result-item ${result.isCorrect ? 'correct' : 'error'}`;
            
            let details = '';
            if (result.isCorrect) {
                details = `<div class="result-sentence">Предложение ${index + 1}: Правильно!</div>`;
            } else {
                details = `
                    <div class="result-sentence">Предложение ${index + 1}: "${result.sentence}"</div>
                    <div class="result-correction">Ваш вариант: "${result.userSentence}"</div>
                    <div class="result-correction">Ошибок: ${result.errors}</div>
                `;
            }
            
            resultItem.innerHTML = details;
            detailedResultsList.appendChild(resultItem);
        });
        
        // Показываем результаты
        dictationResults.style.display = 'block';
        
        // Сохраняем результат в статистику
        saveDictationResult(score, accuracy, totalErrors, dictationSentences.length);
    }
    
    // Функция сохранения результата диктанта
    function saveDictationResult(score, accuracy, errors, sentencesCount) {
        // Получаем текущую статистику из localStorage
        let stats = JSON.parse(localStorage.getItem('spellCheckerStats')) || {
            totalChecks: 0,
            totalExercises: 0,
            totalScore: 0,
            accuracyRate: 0,
            dictationResults: []
        };
        
        // Сохраняем результат диктанта
        stats.dictationResults = stats.dictationResults || [];
        stats.dictationResults.push({
            date: new Date().toISOString(),
            score: score,
            accuracy: accuracy,
            errors: errors,
            sentences: sentencesCount,
            time: dictationTimer
        });
        
        // Ограничиваем историю последними 20 результатами
        if (stats.dictationResults.length > 20) {
            stats.dictationResults = stats.dictationResults.slice(-20);
        }
        
        // Сохраняем обновлённую статистику
        localStorage.setItem('spellCheckerStats', JSON.stringify(stats));
    }
}

// ===========================================
// СТРАНИЦА СТАТИСТИКИ
// ===========================================
function initStatistics() {
    // Загружаем статистику
    loadStatistics();
    
    // Инициализируем графики
    initCharts();
}

// Функция загрузки статистики
function loadStatistics() {
    const totalChecksElement = document.getElementById('total-checks');
    const totalExercisesElement = document.getElementById('total-exercises');
    const accuracyRateElement = document.getElementById('accuracy-rate');
    const totalScoreElement = document.getElementById('total-score');
    const activityList = document.getElementById('activity-list');
    
    // Получаем статистику из localStorage
    const stats = JSON.parse(localStorage.getItem('spellCheckerStats')) || {
        totalChecks: 0,
        totalExercises: 0,
        totalScore: 0,
        accuracyRate: 0,
        trainingResults: [],
        dictationResults: []
    };
    
    // Обновляем элементы интерфейса
    totalChecksElement.textContent = stats.totalChecks || 0;
    totalExercisesElement.textContent = stats.totalExercises || 0;
    accuracyRateElement.textContent = `${stats.accuracyRate || 0}%`;
    totalScoreElement.textContent = stats.totalScore || 0;
    
    // Обновляем список активности
    updateActivityList(stats);
}

// Функция обновления списка активности
function updateActivityList(stats) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    // Собираем все активности
    const activities = [];
    
    // Добавляем тренировки
    if (stats.trainingResults && stats.trainingResults.length > 0) {
        stats.trainingResults.slice(-3).reverse().forEach(result => {
            activities.push({
                type: 'training',
                date: new Date(result.date),
                title: `Тренировка: ${getTrainingTypeName(result.type)}`,
                details: `Результат: ${result.score}/${result.maxScore} (${Math.round(result.percentage)}%)`,
                icon: 'fa-graduation-cap'
            });
        });
    }
    
    // Добавляем диктанты
    if (stats.dictationResults && stats.dictationResults.length > 0) {
        stats.dictationResults.slice(-3).reverse().forEach(result => {
            activities.push({
                type: 'dictation',
                date: new Date(result.date),
                title: 'Диктант',
                details: `Результат: ${result.score} баллов, ${result.accuracy}% точности, ${result.errors} ошибок`,
                icon: 'fa-pen'
            });
        });
    }
    
    // Сортируем по дате (новые сначала)
    activities.sort((a, b) => b.date - a.date);
    
    // Отображаем последние 5 активностей
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const timeAgo = getTimeAgo(activity.date);
        
        activityItem.innerHTML = `
            <i class="fas ${activity.icon} activity-icon"></i>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-details">${activity.details}</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
    
    // Если активностей нет, показываем сообщение
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle activity-icon"></i>
                <div class="activity-content">
                    <div class="activity-title">Нет активностей</div>
                    <div class="activity-details">Выполните проверку текста, тренировку или диктант, чтобы увидеть статистику здесь</div>
                </div>
            </div>
        `;
    }
}

// Функция получения названия типа тренировки
function getTrainingTypeName(type) {
    const typeNames = {
        'choose-word': 'Выбери правильный вариант',
        'fill-gap': 'Вставь пропущенную букву',
        'find-error': 'Найди ошибку'
    };
    
    return typeNames[type] || type;
}

// Функция форматирования времени (сколько времени прошло)
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Только что';
    } else if (diffMins < 60) {
        return `${diffMins} минут назад`;
    } else if (diffHours < 24) {
        return `${diffHours} часов назад`;
    } else if (diffDays === 1) {
        return 'Вчера';
    } else if (diffDays < 7) {
        return `${diffDays} дней назад`;
    } else {
        return date.toLocaleDateString('ru-RU');
    }
}

// Функция инициализации графиков
function initCharts() {
    // Получаем статистику
    const stats = JSON.parse(localStorage.getItem('spellCheckerStats')) || {
        trainingResults: [],
        dictationResults: []
    };
    
    // Создаём график ошибок по категориям
    const errorsCtx = document.getElementById('errors-chart').getContext('2d');
    
    // Подготавливаем данные для графика ошибок
    const errorCategories = {
        'Орфография': 0,
        'Грамматика': 0,
        'Пунктуация': 0,
        'Стилистика': 0
    };
    
    // Анализируем результаты тренировок
    if (stats.trainingResults && stats.trainingResults.length > 0) {
        stats.trainingResults.forEach(result => {
            // Простое распределение: для разных типов тренировок разные категории ошибок
            if (result.type === 'choose-word') {
                errorCategories['Орфография'] += (result.maxScore - result.score) / 10;
            } else if (result.type === 'fill-gap') {
                errorCategories['Орфография'] += (result.maxScore - result.score) / 10;
            } else if (result.type === 'find-error') {
                errorCategories['Грамматика'] += (result.maxScore - result.score) / 10;
            }
        });
    }
    
    // Анализируем результаты диктантов
    if (stats.dictationResults && stats.dictationResults.length > 0) {
        stats.dictationResults.forEach(result => {
            // Распределяем ошибки диктанта по категориям
            const totalErrors = result.errors;
            errorCategories['Орфография'] += totalErrors * 0.6;
            errorCategories['Грамматика'] += totalErrors * 0.3;
            errorCategories['Пунктуация'] += totalErrors * 0.1;
        });
    }
    
    // Создаём график
    new Chart(errorsCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(errorCategories),
            datasets: [{
                data: Object.values(errorCategories),
                backgroundColor: [
                    '#4a6cf7',
                    '#ff6b6b',
                    '#51cf66',
                    '#ffd43b'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: false
                }
            }
        }
    });
    
    // Создаём график прогресса
    const progressCtx = document.getElementById('progress-chart').getContext('2d');
    
    // Подготавливаем данные за последние 7 дней
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
    }
    
    // Данные прогресса (примерные)
    const progressData = [65, 70, 68, 75, 80, 85, 82];
    
    new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Точность, %',
                data: progressData,
                borderColor: '#4a6cf7',
                backgroundColor: 'rgba(74, 108, 247, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}