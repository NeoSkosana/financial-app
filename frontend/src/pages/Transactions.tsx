import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  date: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('/api/transactions', { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post('/api/transactions', { type, amount, description, date }, { headers: { Authorization: `Bearer ${token}` } });
      setAmount('');
      setDescription('');
      setDate('');
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select value={type} onChange={e => setType(e.target.value as 'income' | 'expense')} className="border p-2 rounded">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded mt-2 md:mt-0">
          Add
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td className="border border-gray-300 p-2 capitalize">{t.type}</td>
              <td className="border border-gray-300 p-2">${parseFloat(t.amount).toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{t.description}</td>
              <td className="border border-gray-300 p-2">{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
