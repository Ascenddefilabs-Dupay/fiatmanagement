import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './SetLimit.module.css';
import axios from 'axios';

const SetLimit = () => {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [walletDetails, setWalletDetails] = useState(null);
    const [limitType, setLimitType] = useState('Daily');
    const [alertMessage, setAlertMessage] = useState(''); // State for alert message
    const [error, setError] = useState(''); // State for error message
    const [submitted, setSubmitted] = useState(false); // State for submission tracking

    const handleBackClick = () => {
        router.back(); // Go back to the previous page
    };

    useEffect(() => {
        axios.get('http://localhost:8000/api/user/5eaad320-560b-45b1-8b87-d6eb1dced6fe/')
            .then(response => {
                setWalletDetails(response.data);
            })
            .catch(error => setAlertMessage('Error fetching wallet details'));
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

    const handleProceedClick = async () => {
        setSubmitted(true);
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }

        if (walletDetails) {
            try {
                const response = await axios.put('http://localhost:8000/api/user/5eaad320-560b-45b1-8b87-d6eb1dced6fe/', {
                    ...walletDetails,
                    users_data_limit: parsedAmount,
                    limit_type: limitType
                });

                if (response.status === 200) {
                    setAlertMessage('Limit updated successfully');
                    setAmount('');
                    setError(''); // Clear the error if successful
                } else {
                    setAlertMessage('Failed to update limit');
                }
            } catch (error) {
                setAlertMessage('Error updating limit');
            }
        } else {
            setAlertMessage('Wallet details not loaded');
        }
    };

    const handleCloseAlert = () => {
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
            <div className={styles.header}>
                <FaArrowLeft className={styles.backArrow} onClick={handleBackClick} /> {/* Back arrow button */}
            </div>
            <div className={styles.amountContainer}>
                <label className={styles.label}>Enter Amount:</label>
                <input
                    type="text"
                    placeholder="Enter the amount"
                    className={styles.input}
                    value={amount}
                    onChange={handleAmountChange}
                />
                {submitted && error && <p className={styles.error}>{error}</p>} {/* Error message */}
            </div>
            <label className={styles.label}>Limit Type:</label>
            <select
                className={styles.select}
                value={limitType}
                onChange={(e) => setLimitType(e.target.value)}
            >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
            </select>
            <button className={styles.proceedButton} onClick={handleProceedClick}>PROCEED</button>
        </div>
    );
};

export default SetLimit;
