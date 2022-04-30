import React from 'react';
import '../pagecss.scss';
import CurrentWSform from '../../../../components/GetCurrent';

export default () => (
  <>
  <div className="has-text-centered">
      <div className="container">
        <h1 className="title">Working Standard Monitor</h1>
      </div>
      <CurrentWSform/>
  </div>
  </>
)