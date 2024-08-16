import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import styles from './WithdrawForm.module.css';

const WithdrawForm = () => {
    const [balances, setBalances] = useState({
        INR: 0.00,
        USD: 0.00,
        GBP: 0.00, 
        EUR: 0.00, 
        AUD: 0.00, 
        CAD: 0.00, 
    });
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState({ value: 'INR', label: 'INR' });
    const [selectedBank, setSelectedBank] = useState(null);
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [walletDetails, setWalletDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(''); 
    const [pendingAmount, setPendingAmount] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/fiat_wallets/wa0000000001/')
            .then(response => {
                setWalletDetails(response.data);
                setBalances(prevBalances => ({
                    ...prevBalances,
                    INR: parseFloat(response.data['fiat_wallet_balance'])
                }));
            })
            .catch(error => console.error('Error fetching wallet details:', error));

        fetch('http://localhost:8000/api/currencies/')
            .then(response => response.json())
            .then(data => setCurrencies(data))
            .catch(error => console.error('Error fetching currencies:', error));

        axios.get('http://localhost:8000/api/banks/')
            .then(response => setBanks(response.data))
            .catch(error => console.error('Error fetching banks:', error));
    }, []);

    const handleAmountChange = (e) => {
        let inputValue = e.target.value;
        const validInput = /^[0-9]*\.?[0-9]*$/;

        if (!validInput.test(inputValue)) {
            return;
        }

        if (inputValue.length > 1 && inputValue.startsWith('0') && inputValue[1] !== '.') {
            inputValue = inputValue.slice(1);
        }

        if (inputValue.includes('.')) {
            const parts = inputValue.split('.');
            if (parts[1].length > 2) {
                parts[1] = parts[1].slice(0, 2);
            }
            inputValue = parts.join('.');
        }

        setAmount(inputValue);

        if (submitted) {
            setError('');
        }
    };

    const handleCurrencyChange = (option) => {
        setSelectedCurrency(option);
    };

    const handleBankChange = (option) => {
        setSelectedBank(option);
    };

    const bankOptions = banks.map(bank => ({
        value: bank.id,
        label: (
            <div className={styles.bankOption}>
                <img src={bank.bank_icon} alt={bank.bank_name} className={styles.bankIcon} />
                {bank.bank_name}
            </div>
        ),
    }));

    const currencyOptions = currencies.map(currency => ({
        value: currency.currency_code,
        label: (
            <div className={styles.currencyOption}>
                <img src={currency.currency_icon} alt={currency.currency_code} className={styles.currencyIcon} />
                {currency.currency_code} - {currency.currency_country}
            </div>
        ),
    }));

    const handleWithdraw = () => {
        if (loading) return;

        setSubmitted(true);
        setLoading(true);

        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setAlertMessage('Please enter a valid amount greater than zero.');
            setLoading(false);
            return;
        }

        if (!selectedBank) {
            setAlertMessage('Please select a bank account.');
            setLoading(false);
            return;
        }

        if (!selectedCurrency) {
            setAlertMessage('Please select a currency.');
            setLoading(false);
            return;
        }

        if (!walletDetails) {
            setAlertMessage('Wallet details are not loaded.');
            setLoading(false);
            return;
        }

        if (parsedAmount > balances[selectedCurrency.value]) {
            setAlertMessage('Insufficient balance.');
            setLoading(false);
            return;
        }

        setPendingAmount(parsedAmount);
        setAlertMessage('Withdrawn successfully!');
        setLoading(false);
    };

    const handleCloseAlert = () => {
        if (pendingAmount !== null) {
            const newBalance = parseFloat(walletDetails['fiat_wallet_balance']) - pendingAmount;

            axios.put('http://localhost:8000/api/fiat_wallets/wa0000000001/', {
                ...walletDetails,
                fiat_wallet_balance: newBalance,
            })
            .then(response => {
                setBalances(prevBalances => ({
                    ...prevBalances,
                    [selectedCurrency.value]: prevBalances[selectedCurrency.value] - pendingAmount
                }));
                setAmount('');
                setError('');
                setSubmitted(false);
                setPendingAmount(null);
            })
            .catch(error => {
                setError('An error occurred while withdrawing the amount.');
                console.error('Error withdrawing amount:', error);
            });
        }
        setAlertMessage('');
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
                    options={currencyOptions}
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    className={styles.select}
                />
                <label className={styles.label}>Enter Amount:</label>
                <input
                    type="text"
                    className={styles.input}
                    value={amount}
                    onChange={handleAmountChange}
                />
                {submitted && error && <p className={styles.error}>{error}</p>}

                <label className={styles.label}>Choose Bank Account:</label>
                <Select
                    options={bankOptions}
                    value={selectedBank}
                    onChange={handleBankChange}
                    className={styles.select}
                />

                <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleWithdraw}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'WITHDRAW'}
                </button>
            </div>
        </div>
    );
};

export default WithdrawForm;
