const https = require('https');
const fs = require('fs');
const path = require('path');
const Server = require('./server');
const logule = require('logule').init(module, "API");
const config = require("../config");
const yaml = require('js-yaml');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));
const IPCConnector = require('./connectors/IPCConnector');

const server = new Server({"LOGGER": logule, "tasksModel": new IPCConnector()});

// Load SSL certificate and private key
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../cert/private-key-no-pass.pem')), // Private key no pass
  cert: fs.readFileSync(path.join(__dirname, '../cert/certificate.pem')), // Certificate
};
const app = https.createServer(sslOptions, server.app);

server.app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
server.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.app.set("PORT", config.LISTEN_PORT);

app.listen(parseInt(server.app.get("PORT")), function () {
  logule.info('\Listening on port ' + server.app.get("PORT"));
  return true;
});