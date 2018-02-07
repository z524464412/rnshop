/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import { AppRegistry, AsyncStorage } from 'react-native';
import Login from './app/account/login'

import RootScene from './app/RootScene'
export default class rnshop extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      logined:false,
      user:null
    };
  }
  componentDidMount(){
    this._asyncAppStatus();
  }
  _asyncAppStatus(){
    var _this = this;
    AsyncStorage.getItem('user')
      .then((data) =>{
        var user
        var newState={}
         if(data){
            user = JSON.parse(data)
         }
         if(user && user.accessToken){
            newState.user = user;
            newState.logined =true;
         }else{
          newState.logined =false;
         }
        _this.setState(newState);
      })
  }
  _afterLogin(user){
    var _this = this;
    // console.log(user)
    user = JSON.stringify(user);
    AsyncStorage.setItem('user',user)
    .then(() => {
      _this.setState({
        logined:true,
        user:user
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }
  render() {
    if(this.state.logined){
      return <Login afterLogin={this._afterLogin.bind(this)}/>
    }
    return (
        <RootScene />
    );
  }
}
AppRegistry.registerComponent('rnshop', () => rnshop);
