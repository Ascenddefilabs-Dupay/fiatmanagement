import React, { useState, useEffect } from 'react';
import styles from './DepositForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid';


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
    const [showForm, setShowForm] = useState(true);

    // Currency symbols mapping
    const currencySymbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
        // Add more currencies as needed
    };
    

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        // Cleanup the script when component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initiateRazorpayPayment = () => {
        // setShowForm(false);
        return new Promise((resolve) => {
            if (window.Razorpay) {
                const options = {
                    key: 'rzp_test_41ch2lqayiGZ9X', // Your Razorpay API Key
                    amount: parseFloat(amount) * 100, // Amount in paisa
                    currency: currencies,
                    name: 'DUPAY',
                    description: 'Payment for currency conversion',
                    handler: function (response) {
                        setAlertMessage(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                        
                        resolve(true); // Resolve true on successful payment
                    },
                    prefill: {
                        name: 'User Name',
                        email: 'user@example.com',
                        contact: '9999999999',
                    },
                    notes: {
                        address: 'Your Address',
                    },
                    theme: {
                        color: '#F37254',
                    },
                    modal: {
                        ondismiss: function() {
                            resolve(false); // Resolve false if payment is cancelled
                        }
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                setAlertMessage("Razorpay script not loaded.");
                resolve(false);
            }
            // setShowForm(true);
        });
    };
   

    useEffect(() => {
        axios.get('http://localhost:8000/api/fiat_wallets/Wa0000000001/')
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

    const handleDeposit = async () => {
        setSubmitted(true);
    
        const parsedAmount = parseFloat(amount);
    
        // Clear any previous alert message
        setAlertMessage('');
    
        // Currency Validation
        if (!selectedCurrency) {
            setAlertMessage('Please select a currency.');
            return;
        }
    
        // Amount Validation
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setAlertMessage('Please enter a valid amount greater than zero.');
            return;
        }
    
        // Bank Validation
        if (!selectedBank) {
            setAlertMessage('Please select a bank account.');
            return;
        }
    
        if (!walletDetails) {
            setAlertMessage('Wallet details not loaded.');
            return;
        }
    
        setLoading(true);
    
        // Hide the form container before initiating Razorpay
        setShowForm(false);
    
        if (selectedCurrency.value === 'INR') {
            const paymentSuccess = await initiateRazorpayPayment();
            
            if (paymentSuccess) {
                const depositData = {
                    wallet_id: walletDetails.fiat_wallet_id,
                    currency_type: selectedCurrency.value,
                    amount: parsedAmount,
                };
                axios.post('http://localhost:8000/api/user_currencies/create_or_update/', depositData)
                .then(response => {
                    setPendingAmount(parsedAmount);
                    // setAlertMessage('Deposit successful!');
                    setBalances(prevBalances => ({
                        ...prevBalances,
                        [selectedCurrency.value]: (prevBalances[selectedCurrency.value] || 0) + parsedAmount
                    }));


                    axios.post('http://localhost:8000/api/transactions/', {
                        wallet_id:walletDetails.fiat_wallet_id,
                        transaction_amount:parsedAmount,
                        transaction_currency: selectedCurrency.value,
                        transaction_type: 'deposited',
                        fiat_address: walletDetails.fiat_wallet_address,
                        transaction_status: 'Success',
                        transaction_fee: 0.0,
                        transaction_hash: uuidv4(),
                        transaction_description: 'wallet-deposit',
                        sender_mobile_number:walletDetails.fiat_wallet_phone_number,
                        user_phone_number:walletDetails.fiat_wallet_phone_number
                      });
                      console.log(selectedCurrency.value);
                    setAmount('');
                    setError('');
                    setSubmitted(false);
                    setPendingAmount(null);
                    setLoading(false);
                    setShowForm(true); 
                })
                
                


                .catch(error => {
                    setAlertMessage('An error occurred while processing the deposit.');
                    console.error('Error depositing amount:', error);
                    setLoading(false);
                    setShowForm(true); 
                });
               
            } else {
                setAlertMessage('Payment failed or was cancelled.');
            }
    
            setShowForm(true); 
        } else {
            setShowForm(true);
            // Prepare data for the API call
            const depositData = {
                wallet_id: walletDetails.fiat_wallet_id,
                currency_type: selectedCurrency.value,
                amount: parsedAmount,
            };
            // if(selectedCurrency.value==='fiat_wallet_currency')
            // axios.put(`http://localhost:8000/api/fiat_wallets/${walletDetails.fiat_wallet_id}/`, {
            //     ...walletDetails,
            //     fiat_wallet_balance: parsedAmount,
            // })
   
            // Make the API call to update UserCurrency
            axios.post('http://localhost:8000/api/user_currencies/create_or_update/', depositData)
                .then(response => {
                    setPendingAmount(parsedAmount);
                    setAlertMessage('Deposit successful!');
                    setBalances(prevBalances => ({
                        ...prevBalances,
                        [selectedCurrency.value]: (prevBalances[selectedCurrency.value] || 0) + parsedAmount
                    }));

                    axios.post('http://localhost:8000/api/transactions/', {
                        wallet_id:walletDetails.fiat_wallet_id,
                        transaction_amount:parsedAmount,
                        transaction_currency: selectedCurrency.value,
                        transaction_type: 'deposited',
                        fiat_address: walletDetails.fiat_wallet_address,
                        transaction_status: 'Success',
                        transaction_fee: 0.0,
                        transaction_hash: uuidv4(),
                        transaction_description: 'wallet-deposit',
                        sender_mobile_number:walletDetails.fiat_wallet_phone_number,
                        user_phone_number:walletDetails.fiat_wallet_phone_number
                      });

                    
                    
            
    
                    // axios.post('http://localhost:8000/api/transactions/', transactionData)
                    //     .then(response => {
                    //         setAlertMessage('Deposit successful and transaction recorded!');
                    //     })
                    //     .catch(error => {
                    //         setAlertMessage('Deposit successful but failed to record the transaction.');
                    //         console.error('Error recording transaction:', error);
                    //     });
                    setAmount('');
                    setError('');
                    setSubmitted(false);
                    setPendingAmount(null);
                    setLoading(false);
                    setShowForm(true); 
                })
                .catch(error => {
                    setAlertMessage('An error occurred while processing the deposit.');
                    console.error('Error depositing amount:', error);
                    setLoading(false);
                    setShowForm(true); 
                });
        }
    };

    
    
    
    

    const handleLeftArrowClick = () => {
        window.location.href = 'http://localhost:3003/Crypto_Wallet/Dashboard';
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
            setLoading(false);  // Reset loading state
            document.location.reload();
        })
        .catch(error => {
            setError('An error occurred while updating the balance.');
            console.error('Error updating balance:', error);
        });
    }
    setAlertMessage('');
    setLoading(false); // Reset loading state
    setSubmitted(false); // Reset submitted state
};

   
    

    return (
        <div>
            {alertMessage && (
            <div className={styles.customAlert}>
                <p>{alertMessage}</p>
                <button onClick={handleCloseAlert} className={styles.closeButton}>OK</button>
            </div>
        )}
            {showForm && (
                <div className={styles.container}>

                    <div className={styles.topBar}>
                        <button className={styles.topBarButton}>
                            <FaArrowLeft className={styles.topBarIcon} onClick={handleLeftArrowClick} />
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
                                {currencySymbols[selectedCurrency.value] || ''}{' '}
                                {balances[selectedCurrency.value]?.toFixed(2) || '0.00'}
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
                 )}
    </div>
    );
};

export default DepositForm;
