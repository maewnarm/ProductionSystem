import React from 'react';
import '../pagecss.scss';
import FaultListPage from '../../../../components/FaultList'

export default () => (
  <div className="has-text-centered">
      <div className="container">
        <h1 className="title">Fault List Setting</h1>
      </div>
      <FaultListPage/>
  </div>
)