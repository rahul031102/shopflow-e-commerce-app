import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => (
  <div className="app-wrapper">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
