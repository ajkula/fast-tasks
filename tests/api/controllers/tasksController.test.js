const request = require('supertest');
const IPCConnectorMock = require('../connectors/IPCConnectorMock');
const { expect } = require('chai');
const sinon = require('sinon');
const Server = require('../../../api/server');
require('dotenv').config({ path: '.env.test' });

describe('Tasks Controller', () => {
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

    it('should return an error for empty body in createTask', async function () {
        const res = await request(app).post('/tasks').send();
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Bad Request");
    });

    it('should return an error for empty body in createBulkTask', async function () {
        const res = await request(app).post('/tasks/bulk').send();
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Bad Request");
    });

    it('should retrieve all tasks', async () => {
        tasksModelMock.expects("getAllTasks").once().returns([]);
        const res = await request(app).get('/tasks');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
        tasksModelMock.verify();
    });

    it('should create a new task and return a success message', async () => {
        const newTask = {
            title: "Test Task",
            content: "This is a test task",
            status: "Pending",
            priority: "Normal"
        };
        tasksModelMock.expects("createTask").once().withExactArgs(newTask).resolves();
        const res = await request(app).post('/tasks').send(newTask);
        expect(res.statusCode).to.equal(201);
        expect(res.body.message).to.equal("Created");
        tasksModelMock.verify();
    });

    it('should bulk create tasks and return a success message', async () => {
        const tasks = [{
            title: "Test Task 1",
            content: "Content for task 1",
            status: "Pending",
            priority: "Normal"
        }, {
            title: "Test Task 2",
            content: "Content for task 2",
            status: "In Progress",
            priority: "High"
        }];
        tasksModelMock.expects("bulkCreateTasks").once().withExactArgs(tasks).resolves();
        const res = await request(app).post('/tasks/bulk').send(tasks);
        expect(res.statusCode).to.equal(201);
        expect(res.body.message).to.equal("Created");
        tasksModelMock.verify();
    });

    afterEach(() => {
        tasksModelMock.restore();
    });
});
