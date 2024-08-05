"use client";
import './style.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import country_list from './country-list' // Adjust the path as needed
import '@fortawesome/fontawesome-free/css/all.min.css';

function CurrencyExchange() {
    const [tab, setTab] = useState("currency");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("INR");
    const [amount, setAmount] = useState("100");
    const [exchangeRate, setExchangeRate] = useState(null);
    const [singleExchangeRate, setSingleExchangeRate] = useState(null);
    const [error, setError] = useState(null);
    const apiKey = "EcvTG6QwSxtpGSMcvOW1wTjNRUWktskP"; // CurrencyBeacon API Key
    const cryptoApiKey = "d87e655eb0580e20c381f19ecd513660587ebed07d93f102ac46a3efe32596ca"; // Replace with your crypto API key

    const isFiatCurrency = (currency) => {
        return country_list.hasOwnProperty(currency);
    };

    const fetchExchangeRate = () => {
        if (tab === "currency") {
            axios.get(`https://api.currencybeacon.com/v1/convert?from=${fromCurrency}&to=${toCurrency}&amount=1&api_key=${apiKey}`)
                .then((res) => {
                    if (res.data && res.data.response) {
                        setSingleExchangeRate(res.data.response.value);
                        setExchangeRate(res.data.response.value * parseFloat(amount));
                        setError(null);
                    } else {
                        setError('Error fetching exchange rate');
                        setExchangeRate(null);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError('Error fetching exchange rate');
                    setExchangeRate(null);
                });
        } else {
            axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency}&tsyms=${toCurrency}&api_key=${cryptoApiKey}`)
                .then((res) => {
                    if (res.data && res.data[toCurrency]) {
                        setSingleExchangeRate(res.data[toCurrency]);
                        setExchangeRate(res.data[toCurrency] * parseFloat(amount));
                        setError(null);
                    } else {
                        setError('Error fetching cryptocurrency rate');
                        setExchangeRate(null);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setError('Error fetching cryptocurrency rate');
                    setExchangeRate(null);
                });
        }
    };

    useEffect(() => {
        fetchExchangeRate();
    }, [fromCurrency, toCurrency, amount, tab]);

    const formattedSingleExchangeRate = singleExchangeRate !== null ? singleExchangeRate.toFixed(2) : null;
    const formattedTotalAmount = exchangeRate !== null ? exchangeRate.toFixed(2) : null;

    return (
        <div className="wrapper">
            <header>Currency Exchange</header>
            <div className="tabs">
                <button className={tab === "currency" ? "active" : ""} onClick={() => setTab("currency")}>Currency</button>
                <button className={tab === "crypto" ? "active" : ""} onClick={() => setTab("crypto")}>Crypto</button>
            </div>
            <form>
                <div className="amount">
                    <p>Enter Amount</p>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>  
                <div className="drop-list">
                    <div className="from">
                        <p>From</p>
                        <div className="select-box">
                            {tab === "currency" && (
                                <>
                                    {isFiatCurrency(fromCurrency) && (
                                        <img src={`https://flagcdn.com/48x36/${country_list[fromCurrency].toLowerCase()}.png`} alt="flag" />
                                    )}
                                    <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                                        {Object.keys(country_list).map((currencyCode) => (
                                            <option key={currencyCode} value={currencyCode}>
                                                {currencyCode}
                                            </option>
                                        ))}
                                        {/* Add crypto currencies */}
                                        <option value="BTC">BTC</option>
                                        <option value="ETH">ETH</option>
                                    </select>
                                </>
                            )}
                            {tab === "crypto" && (
                                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="ETH">Ethereum (ETH)</option>
                                    <option value="USDT">Tether (USDT)</option>
                                    <option value="BNB">Binance Coin (BNB)</option>
                                    <option value="USDC">USD Coin (USDC)</option>
                                    <option value="XRP">XRP (XRP)</option>
                                    <option value="BUSD">Binance USD (BUSD)</option>
                                    <option value="ADA">Cardano (ADA)</option>
                                    <option value="DOGE">Dogecoin (DOGE)</option>
                                    <option value="MATIC">Polygon (MATIC)</option>
                                    <option value="SOL">Solana (SOL)</option>
                                    <option value="DOT">Polkadot (DOT)</option>
                                    <option value="SHIB">Shiba Inu (SHIB)</option>
                                    <option value="LTC">Litecoin (LTC)</option>
                                    <option value="TRX">Tron (TRX)</option>
                                    <option value="AVAX">Avalanche (AVAX)</option>
                                    {/* Add more cryptocurrencies as needed */}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="icon">
                        <i className="fa fa-exchange-alt"></i>
                    </div>
                    <div className="to">
                        <p>To</p>
                        <div className="select-box">
                            {tab === "currency" && (
                                <>
                                    {isFiatCurrency(toCurrency) && (
                                        <img src={`https://flagcdn.com/48x36/${country_list[toCurrency].toLowerCase()}.png`} alt="flag" />
                                    )}
                                    <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                                        {Object.keys(country_list).map((currencyCode) => (
                                            <option key={currencyCode} value={currencyCode}>
                                                {currencyCode}
                                            </option>
                                        ))}
                                        {/* Add crypto currencies */}
                                        <option value="BTC">BTC</option>
                                        <option value="ETH">ETH</option>
                                    </select>
                                </>
                            )}
                            {tab === "crypto" && (
                                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                                    {Object.keys(country_list).map((currencyCode) => (
                                        <option key={currencyCode} value={currencyCode}>
                                            {currencyCode}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
                <div className="exchange-rate">
                    {error ? (
                        error
                    ) : (
                        <>
                            <span>
                                {tab === "currency" ? (
                                    `Exchange Rate (1 ${fromCurrency}): ${formattedSingleExchangeRate} ${toCurrency}`
                                ) : (
                                    `Crypto Exchange Rate (1 ${fromCurrency}): ${formattedSingleExchangeRate} ${toCurrency}`
                                )}
                            </span>
                            <br />
                            <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                                Total Amount: {formattedTotalAmount} {toCurrency}
                            </span>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default CurrencyExchange;
