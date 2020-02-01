const cloneDeep = require('lodash/cloneDeep');
const { getCountryByCapital, getCapitalByCountry } = require('./helpers');

const { random } = require('./helpers');

const getQuestion = (locations, settings) => {
    const { onlyCapital, onlyCountries } = settings;

    const originalLocations = cloneDeep(locations);

    const path = [];

    let capital;
    while (!capital) {
        if (locations.capital) {
            capital = locations.capital;
            break;
        }

        const idx = random(0, locations.countries.length - 1);
        path.unshift(idx);

        locations = locations.countries[idx];
    }

    let root = originalLocations;
    while (path.length)
        root = root.countries[path.pop()];

    const whatIsCountry = {
        question: getCountryByCapital(capital.name),
        answer: root.name
    };

    const whatIsCapital = {
        question: getCapitalByCountry(root.name),
        answer: capital.name
    };

    if (onlyCapital)
        return whatIsCapital;
    else if (onlyCountries)
        return whatIsCountry;

    return random(0, 1) ? whatIsCountry : whatIsCountry;
};

const getRandomAnswers = (number, locations, settings) => {
    let result = [];
    for (let i = 0; i < number; i++) {
        let { answer } = getQuestion(locations, settings);
        result.push(answer);
    }
    return result;
}

module.exports = { getQuestion, getRandomAnswers };
