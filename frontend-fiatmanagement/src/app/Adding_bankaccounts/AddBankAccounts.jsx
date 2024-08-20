// src/app/adding-bankaccounts/AddBankAccounts.jsx
"use client";
import { useState, useEffect } from 'react';
import styles from './AddBankAccount.module.css'; // Import CSS
import { FaArrowLeft } from 'react-icons/fa';

const AddBankAccounts = ({ onAddBankClick, selectedBank }) => {
  const [linkedBanks, setLinkedBanks] = useState([]);
  const [noBanksMessage, setNoBanksMessage] = useState('No linked bank accounts.');

  useEffect(() => {
    // Fetch linked banks
    const fetchLinkedBanks = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/user/linked_banks/');
        if (res.ok) {
          const data = await res.json();
          setLinkedBanks(data);
          if (data.length === 0) {
            setNoBanksMessage('No linked bank accounts.');
          } else {
            setNoBanksMessage('');
          }
        } else {
          console.error('Failed to fetch linked banks');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLinkedBanks();
  }, []);

  return (
    <div className={styles.container1}>
      <div className={styles.topBar}>
        <button className={styles.topBarButton} onClick={() => onAddBankClick()}>
          <FaArrowLeft className={styles.topBarIcon} />
        </button>
        <h2 className={styles.topBarTitle}>Linked Bank Accounts</h2>
      </div>

      {/* Display the selected bank if it exists */}
      {selectedBank && (
        <div className={styles.selectedBankContainer}>
          <h3 className={styles.selectedBankTitle}>Selected Bank</h3>
          <ul className={styles.bankList}>
            <li key={selectedBank.id} className={styles.bankItem}>
              {selectedBank.bank_icon && (
                <img
                  src={selectedBank.bank_icon}
                  alt={`${selectedBank.bank_name} icon`}
                  className={styles.bankIcon}
                />
              )}
              <span>{selectedBank.bank_name}</span>
            </li>
          </ul>
        </div>
      )}

      {linkedBanks.length > 0 ? (
        <ul className={styles.bankList}>
          {linkedBanks.map(bank => (
            <li key={bank.id} className={styles.bankItem}>
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
      ) : (
        <p className={styles.noBanksMessage}>{noBanksMessage}</p>
      )}

      <button className={styles.addBankButton} onClick={onAddBankClick}>
        Add New Bank Account
      </button>
    </div>
  );
};

export default AddBankAccounts;
