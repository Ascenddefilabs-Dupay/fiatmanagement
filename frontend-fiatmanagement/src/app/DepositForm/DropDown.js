import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import styles from './CustomDropdown.module.css';

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    const selectedOption = options.find(option => option.value === value);

    return (
        <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? (
                    <>
                        <img src={selectedOption.icon} alt={selectedOption.value} className={styles.dropdownIcon} />
                        {selectedOption.label}
                    </>
                ) : (
                    'Select Currency'
                )}
                <FontAwesomeIcon icon={faChevronDown} className={styles.dropdownArrow} />
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={styles.dropdownItem}
                            onClick={() => handleSelect(option)}
                        >
                            <img src={option.icon} alt={option.value} className={styles.dropdownIcon} />
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
