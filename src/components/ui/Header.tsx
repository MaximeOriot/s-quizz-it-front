import React from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';

interface HeaderProps {
  playerName: string;
}

const Header: React.FC<HeaderProps> = ({ playerName }) => (
  <nav className="flex justify-between items-center py-3 w-full border-b lg:px-6 border-b-secondary">
    <div className="flex gap-3 items-center">
      <img src={logo} alt="Logo S-quizz-it" className="w-20 h-auto" />
    </div>
    <div className="text-lg font-semibold">
      {playerName}
    </div>
  </nav>
);

export default Header;
