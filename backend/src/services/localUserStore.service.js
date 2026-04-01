const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dataFile = path.join(dataDir, 'users.json');

const ensureStoreFile = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
};

const readUsers = async () => {
  await ensureStoreFile();
  const content = await fs.readFile(dataFile, 'utf8');

  try {
    return JSON.parse(content);
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8');
    return [];
  }
};

const writeUsers = async (users) => {
  await ensureStoreFile();
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2), 'utf8');
};

const matchesQuery = (user, query) =>
  Object.entries(query).every(([key, value]) => user[key] === value);

const findOne = async (query) => {
  const users = await readUsers();
  return users.find((user) => matchesQuery(user, query)) || null;
};

const create = async ({ name, email, password, role = 'user' }) => {
  const users = await readUsers();

  const user = {
    _id: crypto.randomUUID(),
    name,
    email,
    password,
    role,
    phone: '',
    bio: '',
    avatarUrl: '',
    country: '',
    city: '',
    postalCode: '',
    taxId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  await writeUsers(users);

  return user;
};

const findById = async (id) => {
  const users = await readUsers();
  return users.find((user) => user._id === id) || null;
};

module.exports = { findOne, create, findById };
