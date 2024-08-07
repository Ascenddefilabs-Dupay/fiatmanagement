"use client";
import './page.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import country_list from '../currency-conversion/country-list';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaEllipsisV, FaChevronRight } from 'react-icons/fa';
import networkOptions from '../NetworkPage/NetworkOptions'

const CurrencyConverter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCurrency = searchParams.get('currency');

    const [fromCurrency, setFromCurrency] = useState('ETH'); // Default value
    const [toCurrency, setToCurrency] = useState('INR');
    const [amount, setAmount] = useState('0');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [network, setNetwork] = useState('OP Mainnet'); // Default value
    const [buy, setBuy] = useState('ETH');
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [credit, setCredit] = useState('IMPS');
    const [provide, setProvide] = useState('Onramp Money');
    const cryptoApiKey = 'd87e655eb0580e20c381f19ecd513660587ebed07d93f102ac46a3efe32596ca';

    useEffect(() => {
        if (selectedCurrency) {
            setToCurrency(selectedCurrency);
            setShowBottomSheet(true);
        }
    }, [selectedCurrency]);

    useEffect(() => {
        const storedNetwork = localStorage.getItem('selectedNetwork');
        if (storedNetwork) {
            setNetwork(storedNetwork);
            setFromCurrency(storedNetwork); // Update fromCurrency to the selected network
        }
    }, []);

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
            if (isFiatCurrency(toCurrency) && !isFiatCurrency(fromCurrency)) {
                const response = await axios.get(
                    `https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency}&tsyms=${toCurrency}&api_key=${cryptoApiKey}`
                );
                const conversionRate = response.data[toCurrency];
                const cryptoValue = parseFloat(amount) / conversionRate;

                setResult(cryptoValue.toFixed(5));
                setError('');
            } else {
                setError('Invalid currency selection or unsupported conversion');
                setResult('');
            }
        } catch (err) {
            setError('Error fetching conversion rate');
            setResult('');
        }
    };

    useEffect(() => {
        fetchConversionRates();
    }, [amount, fromCurrency, toCurrency]);

    const handleContinue = () => {
        router.push('/Currenciespage');
    };

    const toggleBottomSheet = () => {
        setShowBottomSheet(!showBottomSheet);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
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

    useEffect(() => {
        const storedPaymentOption = localStorage.getItem('selectedPaymentOption');
        if (storedPaymentOption) {
            setCredit(storedPaymentOption);
            setShowBottomSheet(false);
        }
    }, []);

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
    
    const navigateToBuy = () => {
        router.push('/BuyPage');
    };
    const togglePaymentOptions = () => {
        setShowPaymentOptions(!showPaymentOptions);
    };

    const navigateToPaymentOptions = () => {
        router.push('/PaymentOptions');
    };

    const navigateToCurrencySelector = () => {
        router.push('/CurrencyDropdown');
    };

    const navigateToNetworkSelector = () => {
        router.push('/NetworkPage');
    };

    return (
        <div className="converterContainer">
            <div className="topBar">
                <button className="topBarButton">
                    <FaArrowLeft className="topBarIcon" />
                </button>
                <div className="topBarTitle1">Buy</div>
                <button className="topBarButton1" onClick={toggleBottomSheet}>
                    <FaEllipsisV className="topBarIcon" />
                </button>
            </div>

            <div className="amountDisplay large">
                <input
                    type="text"
                    value={amount === '' ? '0' : amount}
                    onChange={handleAmountChange}
                    className="amountInput"
                    placeholder={`Enter amount in ${toCurrency}`}
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

            <div className="paymentInfo" onClick={toggleDropdown}>
                <hr />
                <button className="networkInfo" onClick={navigateToNetworkSelector}>
                    <img src="/images/network.jpeg" alt="Network" className="icon" />
                    <span className="smallText">Network:</span>
                    <span className="networkDisplay">{network}</span>
                    <FaChevronRight className="arrow"></FaChevronRight> 
                </button>



                <div className="paymentDetails">
                    <div className="paymentRow" onClick={navigateToBuy}>
                        <img src="/images/buy.jpeg" alt="Buy" className="icon" />
                        <div className="paymentTextContainer">
                            <div className="buyContainer">
                                <span className="buyText">Buy</span>
                                <FaChevronRight className="buyIcon" />
                                <div class="spacer"></div>
                                <span className="currencyText">{fromCurrency}</span>
                            </div>
                        </div>
                    </div>
                    <div className="separator"></div> {/* Vertical line */}
                    <div className="paymentRow" onClick={navigateToPaymentOptions}>
                        <img src="/images/paywith.png" alt="Pay with" className="icon" />
                        <div className="textContainer">
                            <span className='pay'>Pay with</span>
                            <FaChevronRight className="buyIcon2" />
                            <div class="spacer"></div>
                            <div className='credit'>{credit}</div>
                        </div>
                    </div>
                </div>
                <hr />
            </div>

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
            
            <button className="continueButton" onClick={handleContinue}>
                Continue
            </button>

            {showBottomSheet && (
                <div className="bottomSheet">
                    <div className="bottomSheetHeader1">
                        <i className="fas fa-database"></i>
                        <div className="bottomSheetHeader">Change Currency</div>
                    </div>
                    <div className="bottomSheetContent">
                        <div className="bottomSheetRow" onClick={navigateToCurrencySelector}>
                            <span>{toCurrency}</span>
                            <i className="fas fa-check"></i>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencyConverter;
