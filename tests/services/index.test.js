/* const sinon = require('sinon');
const { expect } = require('chai');
const pm2 = require('pm2');
const initFile = require('../../services');

describe('PM2 Message Handling', () => {
  let pm2BusOnStub;

  beforeEach(() => {
    pm2BusOnStub = sinon.stub();
    sinon.stub(pm2, 'launchBus').callsFake((callback) => {
      callback(null, { on: pm2BusOnStub });
    });

    // ... Stubs: logule, createTask, etc.
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should handle a valid "API/POST/createTask" message', async () => {
    const handleCreateTaskSpy = sinon.spy(initFile, 'handleCreateTask');
    initFile.init();

    const mockMessage = {
      raw: { data: { topic: 'API/POST/createTask', task: 'Sample Task' } },
      process: { pm_id: 123 }
    };

    expect(pm2BusOnStub.calledOnce).to.be.true;
    pm2BusOnStub.getCall(0).args[1](mockMessage);

    expect(handleCreateTaskSpy.calledOnce).to.be.true;
    expect(handleCreateTaskSpy.firstCall.args[0].task).to.equal('Sample Task');
  });

  // ... other handlers ...
}); */
