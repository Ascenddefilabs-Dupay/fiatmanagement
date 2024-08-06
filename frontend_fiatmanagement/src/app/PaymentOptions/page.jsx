"use client";
import PaymentOptions from './PaymentOptions'

const CurrencyPage = () => {
  return (
    <div className="container">
      <PaymentOptions />
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          
        }
      `}</style>
    </div>
  );
};

export default CurrencyPage;
