"use client";
import './page.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import country_list from '../currency-conversion/country-list';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';

const CurrencyConverter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCurrency = searchParams.get('currency');

    const [fromCurrency, setFromCurrency] = useState('ETH');
    const [toCurrency, setToCurrency] = useState('INR');
    const [amount, setAmount] = useState('0');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [network, setNetwork] = useState('OP Mainnet');
    const [buy, setBuy] = useState('ETH');
    const [credit, setCredit] = useState('IMPS');
    const [provide, setProvide] = useState('Onramp Money');
    const apiKey = '1kBQlsFCsldQKeOuJHp36pwAmkV8HpBV';
    const cryptoApiKey = 'd87e655eb0580e20c381f19ecd513660587ebed07d93f102ac46a3efe32596ca';

    useEffect(() => {
        if (selectedCurrency) {
            setFromCurrency(selectedCurrency);
            setShowBottomSheet(true);
        }
    }, [selectedCurrency]);

    const isFiatCurrency = (currency) => {
        return country_list.hasOwnProperty(currency);
    };

    const fetchConversionRates = async () => {
        if (!fromCurrency || !toCurrency || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Please enter valid input');
            setResult('');
            return;
        }

        try {
            let conversionRate;
            let cryptoValue;

            if (isFiatCurrency(toCurrency) && !isFiatCurrency(fromCurrency)) {
                const response = await axios.get(
                    `https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency}&tsyms=${toCurrency}&api_key=${cryptoApiKey}`
                );
                conversionRate = response.data[toCurrency];
                cryptoValue = parseFloat(amount) / conversionRate;
            } else if (!isFiatCurrency(toCurrency) && isFiatCurrency(fromCurrency)) {
                const response = await axios.get(
                    `https://api.exchangerate-api.com/v4/latest/${toCurrency}`
                );
                conversionRate = response.data.rates[fromCurrency];
                cryptoValue = parseFloat(amount) * conversionRate;
            } else {
                setError('Invalid currency selection');
                setResult('');
                return;
            }

            if (conversionRate) {
                setResult(cryptoValue.toFixed(2));
                setError('');
            } else {
                setError('Error fetching conversion rate');
                setResult('');
            }
        } catch (err) {
            setError('Error fetching conversion rate');
            setResult('');
        }
    };

    useEffect(() => {
        if (toCurrency === 'INR') {
            fetchConversionRates();
        }
    }, [amount, fromCurrency, toCurrency]);

    const handleContinue = () => {
        router.push('/Currenciespage');
    };

    const toggleBottomSheet = () => {
        setShowBottomSheet(!showBottomSheet);
    };

    const handleNetworkClick = () => {
        setShowBottomSheet(true);
    };

    const handleKeypadClick = (key) => {
        setAmount(prevAmount => {
            if (key === '←') {
                const newAmount = prevAmount.slice(0, -1);
                return newAmount === '' ? '0' : newAmount;
            } else if (key === '.') {
                if (!prevAmount.includes('.')) {
                    return prevAmount === '' ? '0.' : prevAmount + '.';
                }
                return prevAmount;
            } else {
                if (prevAmount === '0' && key !== '.') {
                    return key;
                } else {
                    return prevAmount + key;
                }
            }
        });
    };

    const handleNetworkChange = (network) => {
        setNetwork(network);
    };

    const handleBuyChange = (buy) => {
        setBuy(buy);
    };

    const handleCreditChange = (credit) => {
        setCredit(credit);
    };

    const handleProvideChange = (provide) => {
        setProvide(provide);
    };

    const handleCurrencyChange = (currency) => {
        setToCurrency(currency);
        setShowBottomSheet(false);
    };

    const handleAmountChange = (e) => {
        let value = e.target.value;

        if (value.startsWith('0') && value.length > 1 && !value.includes('.')) {
            value = value.replace(/^0+/, '');
        }

        setAmount(value);
    };

    const navigateToCurrencySelector = () => {
        router.push('/CurrencyDropdown');
    };

    return (
        <div className="converterContainer">
        <div className="topBar">
            <button className="topBarButton">
                <FaArrowLeft className="topBarIcon" />
            </button>
            <div className="topBarTitle">Buy</div>
            <button className="topBarButton" onClick={toggleBottomSheet}>
                <FaEllipsisV className="topBarIcon" />
            </button>
        </div>

            <div className="amountDisplay">
                <input
                    type="text"
                    value={amount === '' ? '0' : amount}
                    onChange={handleAmountChange}
                    className="amountInput"
                    placeholder="Enter amount in INR"
                />
                <div className="amountContainer">
                    <span className="amountLabel">{toCurrency}</span>
                </div>
            </div>
            <div className="amountDisplay">
                <input
                    type="text"
                    value={result === '' ? '0' : result}
                    className="amountInput"
                    readOnly
                />
                <div className="amountContainer">
                    <span className="amountLabel">{fromCurrency}</span>
                </div>
            </div>
            <div className="resultDisplay">
                {error && <div className="error">{error}</div>}
            </div>
            <hr />
            <div className="paymentInfo" onClick={handleNetworkClick}>
                <div className="networkInfo">
                    <img src="/images/network.jpeg" alt="Network" className="icon" />
                    <span className="smallText">Network:</span>
                    <div className="select-box">
                        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                            {Object.keys(country_list).map((currencyCode) => (
                                <option key={currencyCode} value={currencyCode}>
                                    {currencyCode}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="paymentDetails">
                    <div className="paymentRow">
                        <img src="/images/buy.jpeg" alt="Buy" className="icon" />
                        <div className="paymentTextContainer">
                            <div className="buyContainer">
                                <span className="buyText">Buy</span>
                                <i className="fas fa-chevron-right buyIcon"></i>
                                <span className="currencyText">{fromCurrency}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="paymentDetails">
    <div className="paymentRow">
        <img src="/images/paywith.png" alt="Pay with" className="icon" />
        <div className="textContainer">
            <span>Pay with</span>
            <div>{credit}</div>
        </div>
    </div>

    <div className="paymentRow">
        <div className="textContainer">
            <span>Using</span>
            <div className="usingContainer">
                <div>{provide}</div>
                
            </div>
        </div>
    </div>
</div>

            </div>
            <hr />
            <div className="keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'].map((key) => (
                    <button
                        key={key}
                        className="keypadButton"
                        onClick={() => handleKeypadClick(key)}
                    >
                        {key}
                    </button>
                ))}
            </div>
            <hr />
            <button className="continueButton" onClick={handleContinue}>
                Continue
            </button>
            
        {showBottomSheet && (
            <div className="bottomSheet">
                <div className="bottomSheetHeader">Change Currency</div>
                <div className="bottomSheetContent">
                    <div className="bottomSheetRow" onClick={navigateToCurrencySelector}>
                        <span>{toCurrency}</span>
                        <span>{fromCurrency}</span>
                        
                        <i className="fas fa-check"></i>
                    </div>
                    {/* <div className="bottomSheetRow" onClick={() => handleCurrencyChange('INR')}>
                        <span>INR</span>
                        <i className="fas fa-check"></i>
                    </div> */}
                </div>
                <div className="bottomSheetFooter">
                    The conversion rates are indicative and may vary slightly.
                </div>
            </div>
        )}
    </div>
    );
};

export default CurrencyConverter;
