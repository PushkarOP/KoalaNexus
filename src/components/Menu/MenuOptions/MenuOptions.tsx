import React from 'react';
import SettingsMenu from '@components/SettingsMenu';

const MenuOptions = () => {
  return (
    <>
      <div className={`max-h-full py-1 overflow-hidden transition-all`}>
        <a
          className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-custom-white/20 transition-colors duration-200 text-custom-white cursor-pointer text-sm'
          href='https://www.nexusmind.tech/partners'
          target='_blank'
          rel='noreferrer'
        >
          Free API
        </a>
        <SettingsMenu />
      </div>
    </>
  );
};

export default MenuOptions;
