"use client";

import { useState } from 'react';
import { 
  MdArrowUpward, 
  MdArrowDownward, 
  MdHistory, 
  MdContentCopy, 
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdSecurity
} from 'react-icons/md';
import { LuArrowLeftRight } from 'react-icons/lu';

// Types for our wallet data
interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'trade';
  amount: string;
  asset: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  address: string;
}

const Wallet = () => {
  const [balance] = useState("12,450.80");
  const [address] = useState("0x71C...8e42");
  
  // Mock transaction data
  const transactions: Transaction[] = [
    { id: '1', type: 'receive', amount: '+0.45', asset: 'BTC', status: 'completed', date: '2 hours ago', address: 'bc1qxy...z89' },
    { id: '2', type: 'send', amount: '-1,200.00', asset: 'USDT', status: 'pending', date: '5 hours ago', address: '0x32A...f92' },
    { id: '3', type: 'trade', amount: '5.20', asset: 'SOL', status: 'completed', date: 'Yesterday', address: 'Internal Swap' },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Section: Balance and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Balance Card */}
          <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Balance</p>
                  <h1 className="text-4xl md:text-5xl font-black mt-2 flex items-baseline gap-2">
                    ${balance} <span className="text-xl text-emerald-400 font-bold">+2.4%</span>
                  </h1>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <MdAccountBalanceWallet className="w-8 h-8 text-indigo-400" />
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                  <span className="text-slate-400 text-xs font-medium">Wallet Address</span>
                  <code className="text-sm font-bold text-indigo-300">{address}</code>
                  <button className="hover:text-white text-slate-400 transition-colors">
                    <MdContentCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all group">
                <div className="p-3 bg-indigo-600 text-white rounded-xl mb-2 group-hover:scale-110 transition-transform">
                  <MdArrowUpward className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Send</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all group">
                <div className="p-3 bg-emerald-600 text-white rounded-xl mb-2 group-hover:scale-110 transition-transform">
                  <MdArrowDownward className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Receive</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mid Section: Market Insights (The "Interesting" addition) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase">Staking Rewards</p>
              <p className="text-2xl font-black mt-1">12.5% APY</p>
            </div>
            <MdSecurity className="w-12 h-12 opacity-30" />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Active Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">04</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <MdHistory className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Transaction History */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Recent Transactions</h3>
            <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Asset / Type</th>
                  <th className="px-6 py-4 font-bold">Address</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'receive' ? 'bg-emerald-100 text-emerald-600' : 
                          tx.type === 'send' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tx.type === 'receive' ? <MdArrowDownward /> : tx.type === 'send' ? <MdArrowUpward /> : <LuArrowLeftRight />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 capitalize">{tx.type}</p>
                          <p className="text-xs text-slate-400 font-medium">{tx.asset}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{tx.address}</code>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600">{tx.date}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className={`text-sm font-black ${tx.type === 'receive' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.amount} {tx.asset}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wallet;