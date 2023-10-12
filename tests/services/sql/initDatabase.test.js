const fs = require('fs');
const { expect } = require('chai');
const sinon = require('sinon');
const logule = require('../../../services/logger');
const { getCurrentDbVersion, createDatabase, applyMigrations, db } = require('../../../services/sql/initDatabase');

describe('Init Database', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCurrentDbVersion', () => {
    it('should return the current database version', async () => {
      sinon.stub(db, 'query').resolves({ rows: [{ version: 5 }] });
      const version = await getCurrentDbVersion();
      expect(version).to.equal(5);
    });

    it('should return 0 if an error occurs', async () => {
      sinon.stub(db, 'query').rejects(new Error('Mocked Database Error'));
      const version = await getCurrentDbVersion();
      expect(version).to.equal(0);
    });
  });

  describe('createDatabase', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should log database already exists if db exists', async () => {
      const logSpy = sinon.spy(logule, 'warn');
      sinon.stub(db, 'query').rejects(new Error('already exists'));
      await createDatabase();
      expect(logSpy.callCount).to.equal(1);
      expect(logSpy.firstCall.args[0]).to.equal('Database already exists.');
    });

    it('should log an error if another error occurs', async () => {
      const logSpy = sinon.spy(logule, 'error');
      sinon.stub(db, 'query').rejects(new Error('Mocked Database Error'));
      await createDatabase();
      expect(logSpy.calledWith('Error during Database creation.')).to.be.true;
    });
  });

  describe('applyMigrations', () => {
    it('should apply migrations in order', async () => {
      sinon.stub(db, 'query').resolves({ rows: [] });
      const scriptStub = sinon.stub(fs.promises, 'readFile');
      scriptStub.withArgs(sinon.match('001_initial_setup.sql')).resolves('Mocked SQL Content for v1');
      await applyMigrations();
      expect(scriptStub.calledWith(sinon.match('001_initial_setup.sql'))).to.be.true;
      db.query.restore();
    });

    // ... 
  });

  // ... other tests ...
});
