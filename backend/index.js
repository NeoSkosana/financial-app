require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// User model
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});

// Transaction model
const Transaction = sequelize.define('Transaction', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, allowNull: false }
});

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// Sync DB
sequelize.sync();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: 'User already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['id', 'username'] });
  res.json(user);
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  const transactions = await Transaction.findAll({ where: { userId: req.user.id } });
  res.json(transactions);
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { type, amount, description, date } = req.body;
  if (!type || !amount || !date) return res.status(400).json({ message: 'Missing fields' });
  const transaction = await Transaction.create({ userId: req.user.id, type, amount, description, date });
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, date } = req.body;
  const transaction = await Transaction.findOne({ where: { id, userId: req.user.id } });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  transaction.type = type || transaction.type;
  transaction.amount = amount || transaction.amount;
  transaction.description = description || transaction.description;
  transaction.date = date || transaction.date;
  await transaction.save();
  res.json(transaction);
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const transaction = await Transaction.findOne({ where: { id, userId: req.user.id } });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  await transaction.destroy();
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
