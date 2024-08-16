// src/app/adding-bankaccounts/BankList.jsx
"use client";
import { useState, useEffect } from 'react';
import styles from './BankList.module.css'; // Import CSS

const BankList = ({ onBankSelect }) => {
  const [banks, setBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/banks/');
        if (res.ok) {
          const data = await res.json();
          setBanks(data);
        } else {
          console.error('Failed to fetch banks');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchBanks();
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search banks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <ul className={styles.bankList}>
        {filteredBanks.map(bank => (
          <li 
            key={bank.id} 
            className={styles.bankItem}
            onClick={() => onBankSelect(bank)} // Notify parent of selection
          >
            {bank.bank_icon && (
              <img 
                src={bank.bank_icon} 
                alt={`${bank.bank_name} icon`} 
                className={styles.bankIcon} 
              />
            )}
            <span>{bank.bank_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankList;
