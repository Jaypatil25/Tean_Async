let databaseMode = 'mongo';

const setDatabaseMode = (mode) => {
  databaseMode = mode;
};

const getDatabaseMode = () => databaseMode;

module.exports = { setDatabaseMode, getDatabaseMode };
