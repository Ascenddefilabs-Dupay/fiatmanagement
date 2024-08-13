import { useState } from 'react';
import styles from './AddCurrencyForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddCurrencyForm() {
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyCountry, setCurrencyCountry] = useState('');
  const [currencyIcon, setCurrencyIcon] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('currency_code', currencyCode.toUpperCase());
    formData.append('currency_country', currencyCountry.toUpperCase());
    formData.append('currency_icon', currencyIcon);

    try {
      const res = await fetch('http://localhost:8000/api/currencies/', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        window.alert('Currency added successfully!');
        setCurrencyCode('');
        setCurrencyCountry('');
        setCurrencyIcon(null);
        setStatusMessage('');
        setErrors({});
      } else {
        const errorData = await res.json();
        setErrors(errorData);
        setStatusMessage('Failed to add currency.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage('An error occurred.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.topBarButton}>
          <FaArrowLeft className={styles.topBarIcon} />
        </button>
        <h2 className={styles.topBarTitle}>Add Currency</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Country:</label>
          <input
            type="text"
            value={currencyCountry}
            onChange={(e) => setCurrencyCountry(e.target.value)}
            required
            className={styles.input}
          />
          {errors.currency_country && <p className={styles.error}>{errors.currency_country}</p>}
        </div>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Currency Code:</label>
          <input
            type="text"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            required
            className={styles.input}
          />
          {errors.currency_code && <p className={styles.error}>{errors.currency_code}</p>}
        </div>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Upload Icon:</label>
          <input
            type="file"
            onChange={(e) => setCurrencyIcon(e.target.files[0])}
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton}>Add</button>
      </form>
      {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
    </div>
  );
}
