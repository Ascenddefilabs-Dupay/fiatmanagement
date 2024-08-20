import { useState } from 'react';
import styles from './AddBankForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddBankForm() {
  const [bankName, setBankName] = useState('');
  const [bankIcon, setBankIcon] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('bank_name', bankName);
    formData.append('bank_icon', bankIcon);

    try {
      const res = await fetch('http://localhost:8000/api/banks/', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        window.alert('Bank added successfully!');
        setBankName('');
        setBankIcon(null);
        setStatusMessage('');
        setErrors({});
      } else {
        const errorData = await res.json();
        setErrors(errorData);
        setStatusMessage('Failed to add bank.');
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
        <h2 className={styles.topBarTitle}>Add Bank</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Bank Name:</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            className={styles.input}
          />
          {errors.bank_name && <p className={styles.error}>{errors.bank_name}</p>}
        </div>
        <div className={styles.fieldContainer}>
          <label className={styles.label}>Upload Icon:</label>
          <input
            type="file"
            onChange={(e) => setBankIcon(e.target.files[0])}
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
