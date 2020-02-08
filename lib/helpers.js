const { reply, buttons } = require('alice-renderer');

const { startSettings, study, start, whatIsStudySettings } = require('./actions');

const random = (min, max) => Math.floor(Math.random() * (max - min + 1));
const toLowerCase = e => e.toLowerCase();

module.exports = {
    random,
    toLowerCase,
    getButtonsByState: (chatState) => {
        return {
            [startSettings]: reply`${buttons(['Земля', 'Северная Америка', 'Южная Америка', 'Океания', 'Азия', 'Европа', 'Хватит', 'Помощь'])}`,
            [whatIsStudySettings]: reply`${buttons(['Страны', 'Столицы', 'Не важно', 'Помощь'])}`
        }[chatState.state];
    },
    mapStateToAliceResponse: (chatState) => {
        return {
            [start]: 'На данный момент, вы еще не настроили обучение',
            [startSettings]: 'Сейчас происходит настройка навыка - вы можете выбрать какой континент учить',
            [whatIsStudySettings]: 'Вы почти завершили настроку - вам осталось выбарть что учить, страны или столицы',
            [study]: 'Вы уже все настроили. Можно учится!'
        }[chatState.state];
    },
    getCountryByCapital: capital => {
        const items = [
            `${capital} столица какой страны?`,
            `Страна со столицей ${capital}, это?`,
            `Столица - ${capital}, а страна?`,
            `${capital} является столицей...`,
            `Страна, у которой столица ${capital}, обычно называют...`,
            `Что за страна такая, в которой столицу называют ${capital}?`,
        ];

        return items[random(0, items.length - 1)];
    },
    getCapitalByCountry: country => {
        const items = [
            `Страна - ${country}, столица?`,
            `Столица страны ${country} называется...`,
            `Если страну называют ${country}, то как называют столицу?`,
            `Как могли обозвать столицу, если страну называют ${country}?`,
            `${country}`
        ];

        return items[random(0, items.length - 1)];
    },
    correctMessage: newQuestion => {
        const items = [
            `Верно! Продолжим. ${newQuestion}`,
            `Правильно! Так держать! ${newQuestion}`,
            `Отлично! Но что на счет следующего вопроса? ${newQuestion}`,
            `Ага!.. Верно... Тогда что на счёт этого: ${newQuestion}`,
            `Ну, допустим, правильно, но что вы скажете на это: ${newQuestion}`
        ];

        return items[random(0, items.length - 1)];
    },
    incorrectMessage: (newQuestion, correctAnswer) => {
        const items = [
            `Неверно! Правильный ответ ${correctAnswer}. Продолжим. ${newQuestion}`,
            `Не совсем так. В действительности, верный ответ ${correctAnswer}. ${newQuestion}`,
            `Звучит здорово, но это неверный ответ. Правильным ответом является ${correctAnswer}. Давайте продолжим. ${newQuestion}`,
            `Ага!.. Неверно... Верный ответ это ${correctAnswer}. Не стоит унывать, давайте продолжим. ${newQuestion}`,
            `Ну, это никуда не годиться! Верный ответ будет ${correctAnswer}. Давайте еще! ${newQuestion}`
        ];

        return items[random(0, items.length - 1)];
    }
};
