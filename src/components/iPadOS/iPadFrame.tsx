
import React from 'react';

interface iPadFrameProps {
  children: React.ReactNode;
}

export const iPadFrame: React.FC<iPadFrameProps> = ({ children }) => {
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
