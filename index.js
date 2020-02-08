const { json } = require('micro');
const { reply } = require('alice-renderer');

const { toLowerCase, getButtonsByState } = require('./lib/helpers');
const { DataBase } = require('./lib/DataBase');
const { chat } = require('./lib/chat');
const { start } = require('./lib/actions');

const db = new DataBase();

module.exports = async (req, res) => {
    const { request, session, version } = await json(req);

    const key = session.session_id;

    if (!db.get(key))
        db.add(key, { state: start });

    let response = request.nlu.tokens.map(toLowerCase).includes('хватит')
        ? reply.end`До свидания!`
        : reply`${chat(db, key, request.original_utterance)}`;

    response = reply`
        ${response}
        ${getButtonsByState(db.get(key))}
    `;

    res.end(JSON.stringify(
        {
            version,
            session,
            response
        }
    ));
};
