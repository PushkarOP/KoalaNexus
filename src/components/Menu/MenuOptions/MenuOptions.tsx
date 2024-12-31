import React from 'react';
import SettingsMenu from '@components/SettingsMenu';
import { GoogleSync } from '@components/GoogleSync/GoogleSync';
import isElectron from '@utils/electron';
import DesktopLink from './DesktopLink';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

const MenuOptions = () => {
  return (
    <>
      <div className={`max-h-full py-1 overflow-hidden transition-all`}>
        <SettingsMenu />
      </div>
    </>
  );
};

export default MenuOptions;
