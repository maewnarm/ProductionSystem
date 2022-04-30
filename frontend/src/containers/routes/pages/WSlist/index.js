import React from 'react';
import '../pagecss.scss';
import RegisList from '../../../../components/RegisListView';

export default () => (
  <>
    <div className="has-text-centered">
      <div className="container">
        <h1 className="title">Working Standard List</h1>
      </div>
    </div>
    <div>
      <RegisList />
    </div>
  </>
)