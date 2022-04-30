import React from 'react';
import '../pagecss.scss';
import MItemSettingPage from '../../../../components/MItemSetting'

export default () => (
  <div className="has-text-centered">
      <div className="container">
        <h1 className="title">Item List Setting</h1>
      </div>
      <MItemSettingPage/>
  </div>
)