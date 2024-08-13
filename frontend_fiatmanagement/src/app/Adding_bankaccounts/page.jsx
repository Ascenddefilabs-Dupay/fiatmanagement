// src/app/adding-bankaccounts/page.jsx
"use client";
import { useState, useEffect } from 'react';
import AddBankAccounts from './AddBankAccounts'; // Import components
import BankList from './BankList';
import styles from './AddBankAccount.module.css'; // Import CSS

const AddingBankAccountsPage = () => {
  const [view, setView] = useState('add'); // State to toggle views
  const [selectedBank, setSelectedBank] = useState(null); // State for selected bank

  const handleAddBankClick = () => {
    setView('bankList'); // Switch view to BankList
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank); // Set selected bank
    setView('add'); // Switch back to AddBankAccounts view
  };

  return (
    <div className={styles.container}>
      {view === 'add' ? (
        <AddBankAccounts
          onAddBankClick={handleAddBankClick}
          selectedBank={selectedBank} // Pass selected bank to AddBankAccounts
        />
      ) : (
        <BankList onBankSelect={handleBankSelect} /> // Pass function to BankList
      )}
    </div>
  );
};

export default AddingBankAccountsPage;
