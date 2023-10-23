const request = require('supertest');
const IPCConnectorMock = require('../connectors/IPCConnectorMock');
const { expect } = require('chai');
const sinon = require('sinon');
const Server = require('../../../api/server');
require('dotenv').config({ path: '.env.test' });

describe('Auth Controller', () => {
  let app, tasksModelMock, container, serverInstance;

  beforeEach(() => {
      container = {
          tasksModel: new IPCConnectorMock(),
          LOGGER: {
              error: console.error,
              warn: console.log,
              debug: console.log,
              info: console.log,
          }
      };

      if (tasksModelMock) {
          tasksModelMock.restore();
      }
      tasksModelMock = sinon.mock(container.tasksModel);
      serverInstance = new Server(container);
      app = serverInstance.app;
  });
  

  describe('POST /login', () => {
    it('should return a bad request error for missing body', async () => {
      const res = await request(app).post('/login').send();
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal('Bad Request');
    });

    it('should successfully login with valid body', async () => {
      tasksModelMock.expects('login')
        .once()
        .resolves({ success: true });
      const res = await request(app).post('/login')
        .send({ username: 'user', pass: 'pass' });
      console.log(res.body);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      tasksModelMock.verify();
    });
  });

  describe('POST /signin', () => {
    it('should return a bad request error for missing body', async () => {
      const res = await request(app).post('/signin').send();
      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.equal('Bad Request');
    });

    it('should successfully signin with valid body', async () => {
      tasksModelMock.expects('signin')
        .once()
        .resolves({ success: true });
      const res = await request(app).post('/signin')
        .send({ username: 'user', pass: 'pass' });
        console.log(res.body);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      tasksModelMock.verify();
    });
  });

  afterEach(() => {
      tasksModelMock.restore();
  });
});
