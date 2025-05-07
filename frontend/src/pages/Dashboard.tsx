import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
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
    fetchTransactions();
  }, []);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const balance = income - expense;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Income</h2>
          <p className="text-2xl">${income.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Expense</h2>
          <p className="text-2xl">${expense.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold">Balance</h2>
          <p className="text-2xl">${balance.toFixed(2)}</p>
        </div>
      </div>
      <Link to="/transactions" className="text-blue-600 underline">View Transactions</Link>
    </div>
  );
};

export default Dashboard;
