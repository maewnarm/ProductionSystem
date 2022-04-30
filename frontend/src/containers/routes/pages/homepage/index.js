import React from 'react';
import '../pagecss.scss';
import {Button} from 'reactstrap'

class homemain extends React.Component {
  state = {
    scanresult: 'No result'
  }

  openDir = () => {
    window.open('D:\\IoT\\Python')
  }

  render() {
    return (
      <div className="has-text-centered">
        <div className="container">
          <h1 className="title">Welcome {localStorage.getItem('username')} to Production System</h1>
          <h1 className="title">Developed by BPK ESD-EPPE [1007348]</h1>
        </div>
        <Button onClick={this.openDir}>Open</Button>
      </div>
    )
  }
}

export default homemain;