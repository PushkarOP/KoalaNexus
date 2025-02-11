import React from 'react';
import SettingsMenu from '@components/SettingsMenu';
import ApiIcon from '@icon/ApiIcon';

const MenuOptions = () => {
  return (
    <>
      <div className={`max-h-full py-1 overflow-hidden transition-all`}>
        <SettingsMenu />
        <a
          className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-custom-white/20 transition-colors duration-200 text-custom-white cursor-pointer text-sm'
          href='https://www.nexusmind.tech/partners'
          target='_blank'
          rel='noreferrer'
        >
          <ApiIcon className='w-4 h-4' /> Free API
        </a>
      </div>
    </>
  );
};

export default MenuOptions;
