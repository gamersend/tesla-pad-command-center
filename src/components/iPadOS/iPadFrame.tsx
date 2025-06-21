
import React from 'react';

interface IPadFrameProps {
  children: React.ReactNode;
}

export const IPadFrame: React.FC<IPadFrameProps> = ({ children }) => {
  return (
    <div className="tesla-ipad-frame">
      <div className="ipad-device-frame">
        <div className="ipad-screen">
          {children}
        </div>
        <div className="ipad-home-indicator"></div>
      </div>
    </div>
  );
};
