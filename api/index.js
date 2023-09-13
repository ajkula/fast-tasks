const fs = require('fs');
const Server = require('./server');
const logule = require('logule').init(module, "API");
const config = require("../config");
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));

let server = new Server({"LOGGER": logule});
let app = server.app;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.set("PORT", config.LISTEN_PORT);

app.listen(parseInt(app.get("PORT")), function () {
  logule.info('\Listening on port ' + app.get("PORT"));
  return true;
});