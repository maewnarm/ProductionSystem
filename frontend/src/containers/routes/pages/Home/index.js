import React from 'react';
import '../pagecss.scss';
import HomePage from '../../../../components/Homepage'

export default () => (
  <div className="has-text-centered">
    <div className="container">
      <h1 className="title">Welcome {localStorage.getItem('username')} to Initial Stage Control Visualize</h1>
      <h1 className="title">Developed by BPK ESD-EPPE [1007348]</h1>
    </div>
    <HomePage />
  </div>
)