import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-content">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
