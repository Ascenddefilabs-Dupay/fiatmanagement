"use client";
import CurrencySelector from './CurrencySelector';

const CurrencyPage = () => {
  return (
    <div className="container">
      <CurrencySelector />
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #000;
        }
      `}</style>
    </div>
  );
};

export default CurrencyPage;
