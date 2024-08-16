"use client";

import SelectAsset from './SelectAsset';

const SelectAssetPage = () => {
  return (
    <div className="container">
      <SelectAsset />
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

export default SelectAssetPage;