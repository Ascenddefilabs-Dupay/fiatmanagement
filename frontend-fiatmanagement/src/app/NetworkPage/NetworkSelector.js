"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import networkOptions from './NetworkOptions';
import './NetworkSelector.css';

const NetworkSelector = () => {
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(networkOptions);

    useEffect(() => {
        const storedNetwork = localStorage.getItem('selectedNetwork');
        if (storedNetwork) {
            // Set initial state based on stored network if needed
            // For example, you could highlight the selected option
        }
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        
        const filtered = networkOptions.filter(option =>
            option.label.toLowerCase().includes(query)
        );
        setFilteredOptions(filtered);
    };

    const handleNetworkSelect = (network) => {
        localStorage.setItem('selectedNetwork', network);
        router.back(); // Go back to the previous page
    };

    return (
        <div className="networkSelectorContainer">
            <div className="networkSelectorHeader">
                <h2>Select Network</h2>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="searchInput"
                />
            </div>
            <div className="networkOptionsList">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            className="networkOption"
                            onClick={() => handleNetworkSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))
                ) : (
                    <div className="noResults">No results found</div>
                )}
            </div>
        </div>
    );
};

export default NetworkSelector;
