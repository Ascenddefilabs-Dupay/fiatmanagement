import { useState } from 'react';
import { useRouter } from 'next/navigation';
import country_list from '../currency-conversion/country-list';
import styles from './CurrencySelector.module.css';

const CurrencySelector = () => {
  const [search, setSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const router = useRouter();

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    router.push(`/Country_Conversion?currency=${currency}`);
  };

  const filteredCurrencies = Object.entries(country_list).filter(([currency]) =>
    currency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.currencySelector}>
      <h2>Change Currency</h2>
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleSearchChange}
        className={styles.searchInput}
      />
      <div className={styles.currencyList}>
        {filteredCurrencies.map(([currency]) => (
          <div
            key={currency}
            className={`${styles.currencyItem} ${selectedCurrency === currency ? styles.selected : ''}`}
            onClick={() => handleCurrencySelect(currency)}
          >
            {currency}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;
