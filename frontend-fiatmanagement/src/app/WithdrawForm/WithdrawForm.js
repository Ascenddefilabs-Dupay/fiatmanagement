import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './WithdrawForm.module.css';
import { v4 as uuidv4 } from 'uuid';

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
    const [isOkButtonDisabled, setIsOkButtonDisabled] = useState(false);
    const [walletDetails, setWalletDetails] = useState(null);

    
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
        
        return new Promise((resolve) => {
            if (window.Razorpay) {
                const options = {
                    key: 'rzp_test_41ch2lqayiGZ9X', // Your Razorpay API Key
                    amount: parseFloat(amount) * 100, // Amount in paisa
                    currency: currencies,
                    name: 'DUPAY',
                    description: 'Payment for currency conversion',
                    handler: function (response) {
                        // setShowForm(true);
                        // setAlertMessage("Payment successful");
                        
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
            
        });
    };

    useEffect(() => {
        // Fetch wallet details from UserCurrencies table
        axios.get('http://localhost:8000/api/fiat_wallets/Wa0000000001/')
            .then(response => {
                setWalletDetails(response.data);
            })
            .catch(error => console.error('Error fetching wallet details:', error));
        axios.get(`http://localhost:8000/api/user_currencies/?wallet_id=Wa0000000001`)
            .then(response => {
                const userCurrencies = response.data;
                const newBalances = {};
    
                userCurrencies.forEach(currency => {
                    newBalances[currency.currency_type] = parseFloat(currency.balance);
                });
    
                setBalances(prevBalances => ({ ...prevBalances, ...newBalances }));
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

    const handleWithdraw = async () => {
        if (loading) return;
        setLoading(true);
    
        const parsedAmount = parseFloat(amount);
    
        if (!selectedCurrency) {
            setAlertMessage('Please select a currency.');
            setLoading(false);
            return;
        }
    
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setAlertMessage('Please enter a valid amount.');
            setLoading(false);
            return;
        }
        if (!selectedBank) {
            setAlertMessage('Please select a bank account.');
            setLoading(false);
            return;
        }
    
        if (parsedAmount > balances[selectedCurrency.value]) {
            setAlertMessage('Insufficient balance.');
            setLoading(false);
            return;
        }
    
        if (selectedCurrency.value === 'INR') {
            setShowForm(false);
            const paymentSuccess = await initiateRazorpayPayment();
            if (paymentSuccess) {
                // Update balance before showing the alert
                setBalances(prevBalances => ({
                    ...prevBalances,
                    [selectedCurrency.value]: prevBalances[selectedCurrency.value] - parsedAmount
                }));
                axios.post('http://localhost:8000/api/transactions/', {
                    wallet_id:walletDetails.fiat_wallet_id,
                    transaction_amount:parsedAmount,
                    transaction_currency: selectedCurrency.value,
                    transaction_type: 'withdrawn',
                    fiat_address: walletDetails.fiat_wallet_address,
                    transaction_status: 'Success',
                    transaction_fee: 0.0,
                    transaction_hash: uuidv4(),
                    transaction_description: 'wallet-withdraw',
                    sender_mobile_number:walletDetails.fiat_wallet_phone_number,
                    user_phone_number:walletDetails.fiat_wallet_phone_number
                  });
                setPendingAmount(parsedAmount);
                setAlertMessage('Withdrawn successfully!');
                setShowForm(true);
            } else {
                setShowForm(true);
                setAlertMessage('Payment failed or was cancelled.');
            }
        } else {
            setShowForm(true);
            // Update balance before showing the alert
            setBalances(prevBalances => ({
                ...prevBalances,
                [selectedCurrency.value]: prevBalances[selectedCurrency.value] - parsedAmount
            }));
            axios.post('http://localhost:8000/api/transactions/', {
                        wallet_id:walletDetails.fiat_wallet_id,
                        transaction_amount:parsedAmount,
                        transaction_currency: selectedCurrency.value,
                        transaction_type: 'withdrawn',
                        fiat_address: walletDetails.fiat_wallet_address,
                        transaction_status: 'Success',
                        transaction_fee: 0.0,
                        transaction_hash: uuidv4(),
                        transaction_description: 'wallet-withdraw',
                        sender_mobile_number:walletDetails.fiat_wallet_phone_number,
                        user_phone_number:walletDetails.fiat_wallet_phone_number
                      });
    
            setPendingAmount(parsedAmount);
            setAlertMessage('Withdrawn successfully!');
        }
    
        setLoading(false);
    };

    const handleLeftArrowClick = () => {
        window.location.href = 'http://localhost:3003/Crypto_Wallet/Dashboard';
    };
    
    const handleCloseAlert = () => {
        if (pendingAmount !== null && !isOkButtonDisabled) {
            setIsOkButtonDisabled(true); // Disable the button only when processing a pending amount
    
            axios.post('http://localhost:8000/api/user_currencies/withdraw/', {
                wallet_id: 'Wa0000000001',
                currency_type: selectedCurrency.value,
                amount: pendingAmount
            })
            
            
            .then(response => {
                const { user_currency_balance } = response.data;
    
                setBalances(prevBalances => ({
                    ...prevBalances,
                    [selectedCurrency.value]: user_currency_balance
                }));
                setAmount('');
                setPendingAmount(null); // Reset pendingAmount to avoid multiple deductions
                setAlertMessage('');
            })
            .catch(error => {
                setShowForm(true);
                console.error('Error withdrawing amount:', error);
                setAlertMessage('Failed to withdraw the amount. Please try again.');
            })
            .finally(() => {
                setIsOkButtonDisabled(false); // Re-enable the button after the process is complete
            });
        } else {
            // For all other alerts, simply close the alert
            setAlertMessage('');
            setPendingAmount(null); // Reset pendingAmount even if there was no actual withdrawal
        }
        setAlertMessage("");
    };
    
    
    
    

    const customSelectStyles = {
        control: (base) => ({ ...base, backgroundColor: '#2a2a2a', borderColor: '#555', color: 'white' }),
        menu: (base) => ({ ...base, backgroundColor: '#2a2a2a' }),
        singleValue: (base) => ({ ...base, color: 'white' }),
        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#777' : '#2a2a2a', color: 'white' }),
    };

    return (
        <div>
            {alertMessage && (
            <div className={styles.customAlert}>
                <p>{alertMessage}</p>
                <button 
                    onClick={handleCloseAlert} 
                    className={styles.closeButton} 
                    disabled={pendingAmount !== null && isOkButtonDisabled}
                >
                    OK
                </button>

            </div>
            
            )}
            {showForm && (
        <div className={styles.container}>
        
            <div className={styles.topBar}>
                <button className={styles.topBarButton}>
                    <FaArrowLeft className={styles.topBarIcon} onClick={handleLeftArrowClick}/>
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

                            {/* <p className={styles.balanceLabel}>Balance:</p> */}
                            <p className={styles.balanceAmount}>
                                {currencySymbols[selectedCurrency.value] || ''}{' '}
                                {balances[selectedCurrency.value]?.toFixed(2) || '0.00'}
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
        )}
        </div>
    );
};

export default WithdrawForm;
