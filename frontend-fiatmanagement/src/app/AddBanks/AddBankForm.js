import { useState } from 'react';
import styles from './AddBankForm.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AddBankForm() {
  const [bankName, setBankName] = useState('');
  const [bankIcon, setBankIcon] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState('');

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

        setAlertMessage('Bank added successfully!');
        router.push ('http://localhost:3003/Crypto_Wallet/Dashboard')
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
  const handleLeftArrowClick = () => {
    window.location.href = 'http://localhost:3003/Crypto_Wallet/Dashboard';
};
const handleCloseAlert = () => {
  setAlertMessage("");
}

  return (
    <div className={styles.container}>
      {alertMessage && (
                <div className={styles.customAlert}>
                    <p>{alertMessage}</p>
                    <button onClick={handleCloseAlert} className={styles.closeButton}>OK</button>
                </div>
            )}
      <div className={styles.topBar}>
        <button className={styles.topBarButton}>
          <FaArrowLeft className={styles.topBarIcon} onClick={handleLeftArrowClick}/>
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
