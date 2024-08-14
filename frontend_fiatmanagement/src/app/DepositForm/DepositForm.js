import React, { useState, useEffect } from 'react';
import styles from './DepositForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import CustomDropdown from './DropDown';
import axios from 'axios';

const DepositForm = () => {
    const [balances, setBalances] = useState({
        INR: 0.00,
        USD: 0.00,
    });

    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [walletDetails, setWalletDetails] = useState(null);

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
        setSelectedCurrency(option.value);
    };

    const handleDeposit = () => {
        setSubmitted(true);

        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }

        if (!walletDetails) {
            setError('Wallet details are not loaded.');
            return;
        }

        const newBalance = parseFloat(walletDetails['fiat_wallet_balance']) + parsedAmount;

        axios.put('http://localhost:8000/api/fiat_wallets/wa0000000001/', {
            ...walletDetails,
            fiat_wallet_balance: newBalance,
        })
        .then(response => {
            setBalances(prevBalances => ({
                ...prevBalances,
                [selectedCurrency]: prevBalances[selectedCurrency] + parsedAmount
            }));
            setAmount('');
            setError('');
            setSubmitted(false);
            alert('Amount Deposited successfully!');
            // Consider removing the page reload and updating the UI directly
            // document.location.reload();
        })
        .catch(error => {
            setError('An error occurred while depositing the amount.');
            console.error('Error depositing amount:', error);
        });
    };

    const currencyOptions = currencies.map(currency => ({
        value: currency.currency_code,
        label: `${currency.currency_code} - ${currency.currency_country}`,
        icon: currency.currency_icon
    }));

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <button className={styles.topBarButton}>
                    <FaArrowLeft className={styles.topBarIcon} />
                </button>
                <h2 className={styles.topBarTitle}>Deposit</h2>
            </div>
            <div className={styles.cardContainer}>
                {Object.keys(balances).map(currencyCode => (
                    <div key={currencyCode} className={styles.balanceCard}>
                        <h3 className={styles.currency}>
                            {currencyCode} <span className={styles.country}>
                                {currencies.find(currency => currency.currency_code === currencyCode)?.currency_country || ''}
                            </span>
                        </h3>
                        <p className={styles.balanceLabel}>Balance:</p>
                        <p className={styles.balanceAmount}>
                            {currencyCode === 'INR' ? '₹' : '$'} {balances[currencyCode].toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
            <div className={styles.form}>
                <label className={styles.label}>Enter Amount:</label>
                <input
                    type="text"
                    className={styles.input}
                    value={amount}
                    onChange={handleAmountChange}
                />
                {submitted && error && <p className={styles.error}>{error}</p>}

                <label className={styles.label}>Choose Bank Account:</label>
                <select
                    className={styles.select}
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                    <option value="ICICI">ICICI</option>
                    <option value="BOB">BOB</option>
                </select>

                <label className={styles.label}>Choose Currency:</label>
                <CustomDropdown
                    options={currencyOptions}
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                />

                <button type="button" className={styles.submitButton} onClick={handleDeposit}>
                    SUBMIT
                </button>
            </div>
        </div>
    );
};

export default DepositForm;
