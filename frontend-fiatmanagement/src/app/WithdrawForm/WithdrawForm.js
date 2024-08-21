import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './WithdrawForm.module.css';

const WithdrawForm = () => {
    const [balances, setBalances] = useState({ INR: 0.00, USD: 0.00, GBP: 0.00, EUR: 0.00, AUD: 0.00, CAD: 0.00 });
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState({ value: 'INR', label: 'INR' });
    const [selectedBank, setSelectedBank] = useState(null);
    const [banks, setBanks] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingAmount, setPendingAmount] = useState(null);

    useEffect(() => {
        // Fetch wallet details
        axios.get('http://localhost:8000/api/fiat_wallets/wa0000000001/')
            .then(response => {
                const { fiat_wallet_balance } = response.data;
                setBalances(prevBalances => ({ ...prevBalances, INR: parseFloat(fiat_wallet_balance) }));
            })
            .catch(error => console.error('Error fetching wallet details:', error));

        // Fetch currencies
        axios.get('http://localhost:8000/api/currencies/')
            .then(response => setCurrencies(response.data))
            .catch(error => console.error('Error fetching currencies:', error));

        // Fetch banks
        axios.get('http://localhost:8000/api/banks/')
            .then(response => setBanks(response.data))
            .catch(error => console.error('Error fetching banks:', error));
    }, []);

    const handleAmountChange = (e) => {
        let inputValue = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(inputValue)) {
            inputValue = inputValue.replace(/^0+/, '') || '0';
            const [integer, fraction = ''] = inputValue.split('.');
            setAmount(integer + (fraction ? '.' + fraction.slice(0, 2) : ''));
        }
    };

    const handleCurrencyChange = (option) => setSelectedCurrency(option);
    const handleBankChange = (option) => setSelectedBank(option);

    const handleWithdraw = () => {
        if (loading) return;
        setLoading(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > balances[selectedCurrency.value]) {
            setAlertMessage('Invalid amount or insufficient balance.');
            setLoading(false);
            return;
        }

        if (!selectedBank) {
            setAlertMessage('Please select a bank account.');
            setLoading(false);
            return;
        }

        setPendingAmount(parsedAmount);
        setAlertMessage('Withdrawn successfully!');
        setLoading(false);
    };

    const handleCloseAlert = () => {
        if (pendingAmount !== null) {
            const newBalance = balances[selectedCurrency.value] - pendingAmount;

            axios.put(`http://localhost:8000/api/fiat_wallets/wa0000000001/`, { fiat_wallet_balance: newBalance })
                .then(() => {
                    setBalances(prevBalances => ({ ...prevBalances, [selectedCurrency.value]: newBalance }));
                    setAmount('');
                    setPendingAmount(null);
                    setAlertMessage('');
                })
                .catch(error => console.error('Error withdrawing amount:', error));
        }
    };

    const customSelectStyles = {
        control: (base) => ({ ...base, backgroundColor: '#2a2a2a', borderColor: '#555', color: 'white' }),
        menu: (base) => ({ ...base, backgroundColor: '#2a2a2a' }),
        singleValue: (base) => ({ ...base, color: 'white' }),
        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#777' : '#2a2a2a', color: 'white' }),
    };

    return (
        <div className={styles.container}>
            {alertMessage && (
                <div className={styles.customAlert}>
                    <p>{alertMessage}</p>
                    <button onClick={handleCloseAlert} className={styles.closeButton}>OK</button>
                </div>
            )}
            <div className={styles.topBar}>
                <button className={styles.topBarButton}>
                    <FaArrowLeft className={styles.topBarIcon} />
                </button>
                <h2 className={styles.topBarTitle}>Withdraw</h2>
            </div>
            <div className={styles.cardContainer}>
                <div className={styles.balanceCard}>
                    <div className={styles.currencyInfo}>
                        <img
                            src={currencies.find(currency => currency.currency_code === selectedCurrency.value)?.currency_icon || ''}
                            alt={selectedCurrency.value}
                            className={styles.currencyIconInCard}
                        />
                        <h3 className={styles.currency}>
                            {selectedCurrency.value} 
                            <span className={styles.country}>
                                {currencies.find(currency => currency.currency_code === selectedCurrency.value)?.currency_country || ''}
                            </span>
                        </h3>
                    </div>
                    <p className={styles.balanceLabel}>Balance:</p>
                    <p className={styles.balanceAmount}>
                        {selectedCurrency.value === 'INR' ? '₹' : '$'} {balances[selectedCurrency.value].toFixed(2)}
                    </p>
                </div>
            </div>
            <div className={styles.form}>
                <label className={styles.label}>Choose Currency:</label>
                <Select
                    options={currencies.map(currency => ({
                        value: currency.currency_code,
                        label: (
                            <div className={styles.currencyOption}>
                                <img src={currency.currency_icon} alt={currency.currency_code} className={styles.currencyIcon} />
                                {currency.currency_code} - {currency.currency_country}
                            </div>
                        ),
                    }))}
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    styles={customSelectStyles}
                />
                <label className={styles.label}>Enter Amount:</label>
                <input
                    type="text"
                    className={styles.input}
                    value={amount}
                    onChange={handleAmountChange}
                />
                <label className={styles.label}>Choose Bank Account:</label>
                <Select
                    options={banks.map(bank => ({
                        value: bank.id,
                        label: (
                            <div className={styles.bankOption}>
                                <img src={bank.bank_icon} alt={bank.bank_name} className={styles.bankIcon} />
                                {bank.bank_name}
                            </div>
                        ),
                    }))}
                    value={selectedBank}
                    onChange={handleBankChange}
                    styles={customSelectStyles}
                />
                <button onClick={handleWithdraw} className={styles.submitButton} disabled={loading}>
                    Withdraw
                </button>
            </div>
        </div>
    );
};

export default WithdrawForm;
