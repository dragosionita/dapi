Config = require('../../config');

let logUrls = [];

let utils = {

    formatTime: function (seconds) {
        function pad(s) {
            return (s < 10 ? '0' : '') + s;
        }

        let hours = Math.floor(seconds / (60*60));
        let minutes = Math.floor(seconds % (60*60) / 60);
        seconds = Math.floor(seconds % 60);

        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    },

    getUptime: function () {
        return (this.formatTime(process.uptime()));
    },

    log: function (url, method, statusCode, ghost) {
        if (url == "/favicon.ico") return;
        if (url.substr(url.length - 7) == '.js.map') return;

        logUrls.unshift({url: url, method: method, status_code: statusCode, ghost: ghost});

        if (logUrls.length > 6)
            logUrls.splice(6, logUrls.length);
    },

    getLogs: function () {
        return logUrls;
    },

    getServerInfo: function () {
        return {
            port: Config.server.port,
            api: Config.api.domain
        }
    }
};

module.exports = utils;