const { reply, buttons, br } = require('alice-renderer');

const { getQuestion, getRandomAnswers } = require('./contries');

const { random, mapStateToAliceResponse } = require('./helpers');

const LOCATIONS = require('./countries_ru.json');

const { start, startSettings, whatIsStudySettings, study } = require('./actions');

const { correctMessage, incorrectMessage } = require('./helpers');

const chat = (db, key, message) => {
    message = message.toLowerCase();

    const chatState = db.get(key);

    if (/помоги|что ты умеешь|умеешь|помощь/.test(message)) {
        return reply`
            Я могу помочь выучить страны и столицы различных континентов. ${br()} ${br()}
            ${mapStateToAliceResponse(chatState)}            
        `;
    }

    if (/повтори|вопрос/.test(message)) {
        if (!chatState.question) {
            return reply`
                ${[
                    'Я еще не задавала вам вопросов',
                    'Что повторить? Какой вопрос?'
                ]}
            `;
        }

        return reply`
            ${[
                'Хорошо, повторю вопрос',
                'Вопрос который я задала:',
                'А вот и вопрос:'
            ]} ${br()} ${br()}
            ${chatState.question}
        `;
    }

    switch (chatState.state) {
        case start: {
            chatState.state = startSettings;
            // Чтобы не было пересечений сессии
            chatState.country = undefined;

            return reply`
                Привет. Назовите, пожалуйста, интересующий ваш континент. ${br()} ${br()}
                Если вам не важно какой континент учить, скажите "Земля" ${br()} ${br()}
            `;
        }
        case startSettings: {
            const foundCountry = LOCATIONS.countries.find(e => message.includes(e.name.toLowerCase()));

            if (foundCountry)
                chatState.country = foundCountry;
            else if (message.includes('земля'))
                chatState.country = LOCATIONS;

            if (chatState.country) {
                chatState.state = whatIsStudySettings;
                return reply`
                    Что вы хотите выучить? Столицы или Страны? ${br()} ${br()}
                    Если не важно, так и скажите - буду всё подряд спрашивать.
                `;
            }

            return reply`Не смогла найти такой континент, попробуйте еще раз`;
        }
        case whatIsStudySettings: {
            if (message.includes('страны') || message.includes('страна'))
                chatState.onlyContries = true;
            else if (message.includes('столицы') || message.includes('столица'))
                chatState.onlyCapital = true;
            else if (message.includes('не важно') || message.includes('важно')) {
                chatState.onlyCapital = false;
                chatState.onlyContries = false;
            }

            if ('onlyCapital' in chatState || 'onlyContries' in chatState) {
                chatState.state = study;

                const {answer, question} = getQuestion(chatState.country, {...chatState});

                const wrongAnswers = getRandomAnswers(3, chatState.country, {...chatState});

                wrongAnswers.splice(random(0, 3), 0, answer);

                chatState.answer = answer;

                chatState.question = question;

                return reply`
                    Отлично, приступим! ${br()} ${br()}
                    ${question}
                    ${buttons([...wrongAnswers.slice(0, 4), 'Помощь'])}
                `;
            }

            return reply`Не совсем поняла вас. Выберите, пожалуйста, - "Столицы", "Страны" или "Не важно"`;
        }
        case study: {
            const { answer: prevAnswer } = chatState;
            const { answer, question } = getQuestion(chatState.country, {...chatState});

            const wrongAnswers = getRandomAnswers(3, chatState.country, {...chatState});
            wrongAnswers.splice(random(0, 3), 0, answer);

            chatState.answer = answer;
            chatState.question = question;

            if (message.includes(prevAnswer.toLowerCase()))
                return reply`${correctMessage(question)} ${buttons([...wrongAnswers.slice(0, 4), 'Помощь'])}`;
            else
                return reply`${incorrectMessage(question, prevAnswer)} ${buttons([...wrongAnswers.slice(0, 4), 'Помощь'])}`;
        }
        default: {
            chatState.state = startSettings;
            return 'Назовите, пожалуйста, интересующий вас континент. Если вам не важно какой континент учить, скажите "Земля"';
        }
    }
};

module.exports.chat = chat;
