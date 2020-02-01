const { getQuestion } = require('./contries');

const LOCATIONS = require('./countries_ru.json');

const { correctMessage, incorrectMessage } = require('./helpers');

const { reply, buttons } = require('alice-renderer');

const chat = (db, key, message) => {
    message = message.toLowerCase();

    const chatState = db.get(key);

    switch (chatState.state) {
        case 'START':
            chatState.state = 'SETTINGS.START';
            // Чтобы не было пересечений сессии
            chatState.country = undefined;

            return reply`Привет. Назовите, пожалуйста, интересующий вас континент.
             Если вам не важно какой континент учить, скажите "Земля"
            ${buttons(['Земля', 'Северная Америка', 'Южная Америка','Океания','Азия','Европа', 'хватит'])}`; 
        case 'SETTINGS.START':
            const foundCountry = LOCATIONS.countries.find(e => message.includes(e.name.toLowerCase()));

            if (foundCountry)
                chatState.country = foundCountry;
            else if (message.includes('земля'))
                chatState.country = LOCATIONS;

            if (chatState.country) {
                chatState.state = 'SETTINGS.WHAT_IS_STUDY';
                return reply`Что вы хотите выучить? Столицы или Страны?
                    Если не важно, так и скажите
                    - буду всё подряд спрашивать.
                    ${buttons(['Страны', 'Столицы', 'Не важно'])}`;
            }

            return 'Не смогла найти такой континент, попробуйте еще раз.';
        case 'SETTINGS.WHAT_IS_STUDY':
            if (message.includes('страны') || message.includes('страна'))
                chatState.onlyContries = true;
            else if (message.includes('столицы') || message.includes('столица'))
                chatState.onlyCapital = true;
            else if (message.includes('не важно') || message.includes('важно')) {
                chatState.onlyCapital = false;
                chatState.onlyContries = false;
            }

            if ('onlyCapital' in chatState || 'onlyContries' in chatState) {
                chatState.state = 'STUDY';

                const { answer, question } = getQuestion(chatState.country, { ...chatState });

                chatState.answer = answer;
                chatState.question = question;

                return `Отлично, приступим! ${question}`;
            }

            return 'Не совсем поняла вас. Выберите, пожалуйста, - "Столицы", "Страны" или "Не важно".';
        case 'STUDY':
            if (message.includes('хватит'))
                return 'Заканчиваю';

            const { answer: prevAnswer } = chatState;
            const { answer, question } = getQuestion(chatState.country, { ...chatState });

            chatState.answer = answer;
            chatState.question = question;

            if (message.includes(prevAnswer.toLowerCase()))
                return correctMessage(question);
            else
                return incorrectMessage(question, prevAnswer);
        default:
            chatState.state = 'SETTINGS.START';
            return 'Назовите, пожалуйста, интересующий вас континент. Если вам не важно какой континент учить, скажите "Земля"';
    }
};

module.exports.chat = chat;
