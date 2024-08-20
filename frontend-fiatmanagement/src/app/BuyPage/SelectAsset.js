"use client";
import './SelectAsset.css';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const assets = [
    { name: 'Ethereum', symbol: 'ETH', icon: '/path/to/ethereum-icon.png' },
    { name: 'USD Coin', symbol: 'USDC', icon: '/path/to/usd-coin-icon.png' },
    { name: 'Tether', symbol: 'USDT', icon: '/path/to/tether-icon.png' },
    { name: 'Uniswap', symbol: 'UNI', icon: '/path/to/uniswap-icon.png' },
    { name: 'Chainlink', symbol: 'LINK', icon: '/path/to/chainlink-icon.png' },
    { name: 'Wrapped Bitcoin', symbol: 'WBTC', icon: '/path/to/wrapped-bitcoin-icon.png' },
    { name: 'Shiba Inu', symbol: 'SHIB', icon: '/path/to/shiba-inu-icon.png' },
    // Add more assets as needed
];

const SelectAsset = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAssetSelect = (asset) => {
        // Perform any additional actions with the selected asset if needed
        console.log(`Selected asset: ${asset.name}`);
        router.back(); // Navigate back to the previous page
    };

    const filteredAssets = assets.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="assetContainer">
            <div className="topBar">
                <button className="topBarButton" onClick={() => router.back()}>
                    <FaArrowLeft className="topBarIcon" />
                </button>
                <div className="topBarTitle">Select asset to buy</div>
            </div>
            <div className="searchBar">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="searchInput"
                />
            </div>
            <div className="assetList">
                {filteredAssets.map((asset) => (
                    <div className="assetItem" key={asset.symbol} onClick={() => handleAssetSelect(asset)}>
                        {/* <img src={asset.icon} alt={asset.name} className="assetIcon" /> */}
                        <div className="assetInfo">
                            <div className="assetName">{asset.name}</div>
                            <div className="assetSymbol">{asset.symbol}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectAsset;
