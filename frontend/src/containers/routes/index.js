import React from 'react'
import { Switch, Route } from 'react-router-dom'
import './route.scss';

import homepage from './pages/homepage'
import Home from './pages/Home'
import WSList from './pages/WSlist'
import StationSetting from './pages/Station Setting'
import WSMonitor from './pages/WSMonitor'
import OperationRatio from './pages/Operation Ratio'
import ResultList from './pages/Result List'
import FaultList from './pages/Fault List'
import MOperationRatio from './pages/mOperation Ratio'
import MLineSetting from './pages/mLine Setting'
import MItemSetting from './pages/mItem Setting'
import MWork from './pages/mWork'
import RecordData from './pages/RecordData'
//import ApproveData from './pages/RecordApprove'
import EditControlitems from './pages/EditControlitems'
import DocView from './pages/DocView'
import DocSetting from './pages/DocSetting'

class swi extends React.Component {
  componentDidMount() {
    console.log(localStorage.getItem('username'))
    console.log(this.props.pr.auth)
  }

  render() {
    return (
      <div className="route-body" >
        {this.props.pr.auth ?
          <Switch >
            <Route exact path="/" component={homepage} />
            <Route exact path="/home" component={Home} />
            <Route exact path="/wslist" component={WSList} />
            <Route exact path="/wsmonitor" component={WSMonitor} />
            <Route exact path="/stationsetting" component={StationSetting} />
            <Route exact path="/operationratio" component={OperationRatio} />
            <Route exact path="/resultlist" component={ResultList} />
            <Route exact path="/faultlist" component={FaultList} />
            <Route exact path="/moperationratio" component={MOperationRatio} />
            <Route exact path="/mlinesetting" component={MLineSetting} />
            <Route exact path="/mitemsetting" component={MItemSetting} />
            <Route exact path="/mwork" component={MWork} />
            <Route exact path="/recorddata" component={RecordData} />
            {/*<Route exact path="/recordapprove" component={ApproveData} />*/}
            <Route exact path="/editcontrolitems" component={EditControlitems} />
            <Route exact path="/docview" component={DocView} />
            <Route exact path="/docsetting" component={DocSetting} />
          </Switch>
          :
          <p className="login-request-text">Please Login ...</p>
        }
      </div>
    )
  }
}

export default swi