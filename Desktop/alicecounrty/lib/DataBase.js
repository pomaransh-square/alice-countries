module.exports.DataBase = class {
    // Каждые 5 минут
    constructor(clearTimeout = 1000 * 60 * 5, initialDB = {}) {
        this._db = initialDB;
        this._clearTimeout = clearTimeout;
        this._debounceTimer = {};
    }

    _refreshTimeoutLoop(key) {
        if (this._debounceTimer[key]) {
            clearTimeout(this._debounceTimer[key]);
            this._debounceTimer[key] = undefined;
        }

        if (!this._debounceTimer[key])
            this._debounceTimer[key] = setTimeout(() => delete this._db[key], this._clearTimeout);
    }

    add(key, value) {
        this._refreshTimeoutLoop(key);
        this._db[key] = value;
    }

    get(key) {
        if (this._db[key])
            this._refreshTimeoutLoop(key);

        return this._db[key];
    }
};
