import React from 'react';
import '../pagecss.scss';
import StationSetting from '../../../../components/StationSetting'

export default () => (
  <div className="has-text-centered">
      <div className="container">
        <h1 className="title">Station Setting</h1>
      </div>
      <StationSetting/>
  </div>
)