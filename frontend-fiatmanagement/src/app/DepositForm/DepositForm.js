import React, { useState, useEffect } from 'react';
import styles from './DepositForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';

const DepositForm = () => {
    const [balances, setBalances] = useState({});
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState({ value: 'INR', label: 'INR' });
    const [selectedBank, setSelectedBank] = useState(null);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [banks, setBanks] = useState([]);
    const [walletDetails, setWalletDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAmount, setPendingAmount] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/fiat_wallets/wa0000000001/')
            .then(response => {
                setWalletDetails(response.data);
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

    useEffect(() => {
        if (walletDetails) {
            axios.get(`http://localhost:8000/api/user_currencies/?wallet_id=${walletDetails.fiat_wallet_id}`)
                .then(response => {
                    const userCurrencies = response.data.reduce((acc, currency) => {
                        acc[currency.currency_type] = parseFloat(currency.balance);
                        return acc;
                    }, {});
                    setBalances(userCurrencies);
                })
                .catch(error => console.error('Error fetching user currencies:', error));
        }
    }, [walletDetails, selectedCurrency]);

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

    const handleBankChange = (selectedOption) => {
        setSelectedBank(selectedOption);
    };

    const handleCurrencyChange = (option) => {
        setSelectedCurrency(option);
    };

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
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: '#2a2a2a',
            borderColor: '#555',
            color: 'white',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#2a2a2a',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'white',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#777' : '#2a2a2a',
            color: 'white',
        }),
    };
    const handleDeposit = () => {
        setSubmitted(true);
    
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }
    
        if (!walletDetails) {
            setError('Wallet details not loaded.');
            return;
        }
    
        setLoading(true);
    
        // Prepare data for the API call
        const depositData = {
            wallet_id: walletDetails.fiat_wallet_id,
            currency_type: selectedCurrency.value,
            amount: parsedAmount,
        };
    
        // Make the API call to update UserCurrency
        axios.post('http://localhost:8000/api/user_currencies/create_or_update/', depositData)
            .then(response => {
                setPendingAmount(parsedAmount);
    
                // If currency is INR, store the alert message to update FiatWallet later
                if (selectedCurrency.value === 'INR') {
                    setAlertMessage('Deposit successful! Click OK .');
                    
                } else {
                    setAlertMessage('Deposit successful!');
                    
                    // Update the user currency balance directly
                    setBalances(prevBalances => ({
                        ...prevBalances,
                        [selectedCurrency.value]: (prevBalances[selectedCurrency.value] || 0) + parsedAmount
                    }));
                    setAmount('');
                    setError('');
                    setSubmitted(false);
                    setPendingAmount(null);
                }
    
                setLoading(false);
            })
            .catch(error => {
                setError('An error occurred while processing the deposit.');
                console.error('Error depositing amount:', error);
                setLoading(false);
            });
    };
    
    const handleCloseAlert = () => {
        if (pendingAmount !== null && selectedCurrency.value === 'INR') {
            const newBalance = parseFloat(walletDetails.fiat_wallet_balance) + pendingAmount;
    
            axios.put(`http://localhost:8000/api/fiat_wallets/${walletDetails.fiat_wallet_id}/`, {
                ...walletDetails,
                fiat_wallet_balance: newBalance,
            })
            .then(() => {
                setBalances(prevBalances => ({
                    ...prevBalances,
                    [selectedCurrency.value]: (prevBalances[selectedCurrency.value] || 0) + pendingAmount
                }));
                setAmount('');
                setError('');
                setSubmitted(false);
                setPendingAmount(null);
                // setAlertMessage('Balance updated successfully.');
                document.location.reload()
            })
            .catch(error => {
                setError('An error occurred while updating the balance.');
                console.error('Error updating balance:', error);
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
                <h2 className={styles.topBarTitle}>Deposit</h2>
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
                        {selectedCurrency.value === 'INR' ? '₹' : '$'} {balances[selectedCurrency.value]?.toFixed(2) || '0.00'}
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
                    styles={customSelectStyles}
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
                    styles={customSelectStyles}
                />

                <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleDeposit}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'SUBMIT'}
                </button>
            </div>
        </div>
    );
};

export default DepositForm;
