const fs = require('fs');
const Server = require('./server');
const logule = require('logule').init(module, "API");
const config = require("../config");
const yaml = require('js-yaml');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));

let server = new Server({"LOGGER": logule});
let app = server.app;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message });
  }

  return res.status(500).send({ error: err.message });
});

app.set("PORT", config.LISTEN_PORT);

app.listen(parseInt(app.get("PORT")), function () {
  logule.info('\Listening on port ' + app.get("PORT"));
  return true;
});