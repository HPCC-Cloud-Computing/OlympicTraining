module.exports = function (RED) {
    "use strict";
    var reconnect = RED.settings.mysqlReconnectTime || 20000;
    var mysqldb = require('mysql');

    function MySQLNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
        this.tz = n.tz || "local";

        this.connected = false;
        this.connecting = false;

        this.dbname = n.db;
        this.setMaxListeners(0);
        var node = this;

        function checkVer() {
            node.connection.query("SELECT version();", [], function (err, rows) {
                if (err) {
                    node.connection.release();
                    node.error(err);
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: "Bad Ping"
                    });
                    doConnect();
                }
            });
        }

        function doConnect() {
            node.connecting = true;
            node.emit("state", "connecting");
            if (!node.pool) {
                node.pool = mysqldb.createPool({
                    host: node.host,
                    port: node.port,
                    user: node.credentials.user,
                    password: node.credentials.password,
                    database: node.dbname,
                    timezone: node.tz,
                    insecureAuth: true,
                    multipleStatements: true,
                    connectionLimit: 25
                });
            }

            node.pool.getConnection(function (err, connection) {
                node.connecting = false;
                if (err) {
                    node.emit("state", err.code);
                    node.error(err);
                    node.tick = setTimeout(doConnect, reconnect);
                } else {
                    node.connection = connection;
                    node.connected = true;
                    node.emit("state", "connected");
                    node.connection.on('error', function (err) {
                        node.connected = false;
                        node.connection.release();
                        node.emit("state", err.code);
                        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                            doConnect(); // silently reconnect...
                        } else if (err.code === 'ECONNRESET') {
                            doConnect(); // silently reconnect...
                        } else {
                            node.error(err);
                            doConnect();
                        }
                    });
                    if (!node.check) {
                        node.check = setInterval(checkVer, 290000);
                    }
                }
            });
        }

        this.connect = function () {
            if (!this.connected && !this.connecting) {
                doConnect();
            }
        };

        this.on('close', function (done) {
            if (this.tick) {
                clearTimeout(this.tick);
            }
            if (this.check) {
                clearInterval(this.check);
            }
            node.connected = false;
            node.emit("state", " ");
            node.pool.end(function (err) {
                done();
            });
        });
    }
    RED.nodes.registerType("MySQLdatabase", MySQLNode, {
        credentials: {
            user: {
                type: "text"
            },
            password: {
                type: "password"
            }
        }
    });


    function MySQLQueryNode(n) {
        RED.nodes.createNode(this, n);
        this.mydb = n.mydb;
        this.mydbConfig = RED.nodes.getNode(this.mydb);
        this.bindQuery = n.bindQuery;
        this.queryString = n.queryString;
        this.outputTo = n.outputTo;

        if (this.mydbConfig) {
            this.mydbConfig.connect();
            var node = this;
            node.mydbConfig.on("state", function (info) {
                if (info === "connecting") {
                    node.status({
                        fill: "grey",
                        shape: "ring",
                        text: info
                    });
                } else if (info === "connected") {
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: info
                    });
                } else {
                    if (info === "ECONNREFUSED") {
                        info = "connection refused";
                    }
                    if (info === "PROTOCOL_CONNECTION_LOST") {
                        info = "connection lost";
                    }
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: info
                    });
                }
            });

            node.on("input", function (msg) {
                if (node.mydbConfig.connected) {
                    let queryString = node.queryString;
                    if (queryString.length == 0) {
                        queryString = msg.query;
                    }
                    // console.log(queryString);
                    var bind = Array.isArray(msg.bindQuery) ? msg.bindQuery : [];
                    // console.log(bind);
                    node.mydbConfig.connection.query(queryString, bind, function (err, rows) {
                        if (err) {
                            node.error(err, msg);
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "Error"
                            });
                        } else {
                            msg[node.outputTo] = rows;
                            node.send(msg);
                            node.status({
                                fill: "green",
                                shape: "dot",
                                text: "OK"
                            });
                        }
                    });
                } else {
                    node.error("Database not connected", msg);
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: "not yet connected"
                    });
                }
            });

            node.on('close', function () {
                node.mydbConfig.removeAllListeners();
                node.status({});
            });
        } else {
            this.error("MySQL database not configured");
        }
    }
    RED.nodes.registerType("mysql-query", MySQLQueryNode);
};