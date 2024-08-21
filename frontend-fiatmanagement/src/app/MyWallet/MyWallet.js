import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa'; 
import styles from './MyWallet.module.css';

const MyWallet = () => {
    const router = useRouter();
    const [balances, setBalances] = useState({
        INR: 0.00,
        USD: 0.00,
        GBP: 0.00,
        EUR: 0.00,
        AUD: 0.00,
        CAD: 0.00,
    });
    const [selectedCurrency, setSelectedCurrency] = useState({ value: 'INR', label: 'INR' });
    const [selectedCountry, setSelectedCountry] = useState('India');
    const [selectedCurrencyImage, setSelectedCurrencyImage] = useState(''); 
    const [currencies, setCurrencies] = useState([]);
    const [walletDetails, setWalletDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch wallet details and user currencies
        axios.get('http://localhost:8000/api/user_currencies/?wallet_id=wa0000000001')
            .then(response => {
                const userCurrencies = response.data;
                const updatedBalances = {};
                userCurrencies.forEach(currency => {
                    updatedBalances[currency.currency_type] = parseFloat(currency.balance);
                });
                setBalances(prevBalances => ({
                    ...prevBalances,
                    ...updatedBalances,
                }));
            })
            .catch(error => console.error('Error fetching user currencies:', error));
    
        fetch('http://localhost:8000/api/currencies/')
            .then(response => response.json())
            .then(data => {
                setCurrencies(data);
                // Set default currency image
                const defaultCurrency = data.find(currency => currency.currency_code === 'INR');
                if (defaultCurrency) {
                    setSelectedCurrencyImage(defaultCurrency.currency_icon);
                    setSelectedCountry(defaultCurrency.currency_country);
                }
            })
            .catch(error => console.error('Error fetching currencies:', error));
    }, []);
    

    useEffect(() => {
        // Update image when currency changes
        const selected = currencies.find(currency => currency.currency_code === selectedCurrency.value);
        if (selected) {
            setSelectedCurrencyImage(selected.currency_icon);
            setSelectedCountry(selected.currency_country);
        }
    }, [selectedCurrency, currencies]);

    const filteredCurrencies = currencies.filter(currency =>
        currency.currency_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.currency_country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currencyOptions = filteredCurrencies.map(currency => ({
        value: currency.currency_code,
        label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={currency.currency_icon}
                    alt={currency.currency_code}
                    style={{ marginRight: 8, width: 20, height: 20 }}
                />
                {currency.currency_code} - {currency.currency_country}
            </div>
        ),
    }));

    const handleCurrencyChange = (option) => {
        setSelectedCurrency(option);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            const foundCurrency = filteredCurrencies.find(currency =>
                currency.currency_code.toLowerCase() === searchQuery.toLowerCase() ||
                currency.currency_country.toLowerCase() === searchQuery.toLowerCase()
            );
            if (foundCurrency) {
                setSelectedCurrency({ value: foundCurrency.currency_code, label: foundCurrency.currency_code });
            } else {
                alert('Currency not found');
            }
        }
    };

    const handleSetLimitClick = () => {
        router.push('/SetLimit');
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

    return (
        <div className={styles.walletContainer}>
            <div className={styles.header}>
                <FaArrowLeft className={styles.backArrow} />
                <h2 className={styles.title}>My Wallet</h2>
            </div>
            <div className={styles.balanceCard}>
                <div className={styles.balanceDetails}>
                    <img 
                        src={selectedCurrencyImage} 
                        alt={selectedCurrency.value} 
                        className={styles.currencyImage} 
                    />
                    <div className={styles.currencyText}>
                        <span className={styles.currencyCode}>{selectedCurrency.value}</span>
                        <span className={styles.currencyCountry}>{selectedCountry}</span>
                    </div>
                    <div className={styles.balanceAmount}>
                        ₹ {balances[selectedCurrency.value] ? balances[selectedCurrency.value].toFixed(2) : '0.00'}
                    </div>
                </div>
            </div>
            <button className={styles.setLimitButton} onClick={handleSetLimitClick}>SET LIMIT</button>
            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search currency..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                />
            </div>
            <label className={styles.label}>Choose Currency:</label>
            <Select
                options={currencyOptions}
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                styles={customSelectStyles}
            />
        </div>
    );
};

export default MyWallet;
