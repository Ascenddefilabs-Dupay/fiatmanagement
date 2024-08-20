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

    const handleBackClick = () => {
        router.back(); // Go back to the previous page
    };

    useEffect(() => {
        axios.get('http://localhost:8000/api/user/a9e1fa8c-e2c3-47b6-8038-a207570135a7/')
            .then(response => {
                setWalletDetails(response.data);
            })
            .catch(error => window.alert('Error fetching wallet details:', error));
    }, []);

    const handleProceedClick = async () => {
        if (walletDetails) {
            try {
                const newBalance = parseFloat(amount);
                
                const response = await axios.put('http://localhost:8000/api/user/a9e1fa8c-e2c3-47b6-8038-a207570135a7/', {
                    ...walletDetails,
                    users_data_limit: newBalance,
                    limit_type: limitType // Add this if you want to include the limitType in the update
                });

                if (response.status === 200) {
                    window.alert('Limit updated successfully');
                    setAmount("")
                } else {
                    window.alert('Failed to update limit');
                }
            } catch (error) {
                window.alert('Error:', error);
            }
        } else {
            window.alert('Wallet details not loaded');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <FaArrowLeft className={styles.backArrow} onClick={handleBackClick} /> {/* Back arrow button */}
            </div>
            <div className={styles.amountContainer}>
                <label className={styles.label}>Enter Amount:</label>
                <input
                    type="number"
                    placeholder="Enter the amount"
                    className={styles.input}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
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
