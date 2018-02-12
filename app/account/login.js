import React, { PureComponent } from 'react';
import {CountDownText} from 'react-native-sk-countdown'
import request from'../common/request'
import config from '../common/config'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  AlertIOS
} from 'react-native';
// create a component
class Login extends PureComponent {
       //设置导航栏 
  static navigationOptions = ({ navigation }) => ({
      headerTitle:'登录页面',
      headerStyle: { backgroundColor: "#ee735c"},
  })
  constructor(props) {
    super(props);
    this.state = {
       props :props,
       data:[],
       text:'',
       codeSent:false,
       phoneNumber:'',
       verifyCode:'',
       countingDone:false,
    };
  }
  _submit(){
    var _this = this;
    var phoneNumber = this.state.phoneNumber;
    var verifyCode = this.state.verifyCode;
      if(!phoneNumber){
        return AlertIOS.alert('手机号不能为空!')
      }
      if(!verifyCode){
        return AlertIOS.alert('验证码不能为空!')
      }
    var body = {
      phoneNumber : phoneNumber,
      verifyCode:verifyCode
    }
    var verifyURL= config.api.base + config.api.verify

    request.post(verifyURL,body)
      .then((data)=>{
        if(data && data.success){
          _this.props.afterLogin(data.data)
        }
        else{
          AlertIOS.alert('获取验证码失败,请检查手机号是否正确')
        }
      })
      .catch((err)=>{
        AlertIOS.alert('系统错误!!')
      })
  }
  
  _sendVerifyCode(){
    var that = this;
    var phoneNumber = this.state.phoneNumber;

      if(!phoneNumber){
        return AlertIOS.alert('手机号不能为空!')
      }
    var body = {
      phoneNumber : phoneNumber
    }
    var signupURL= config.api.base + config.api.signup
    console.log(body)
    console.log(signupURL)
    request.post(signupURL,body)
      .then((data)=>{
        console.log(data)
        if(data && data.success){
          that._showVerifyCode()
        }
        else{
           console.log(data)
          AlertIOS.alert('获取验证码失败,请检查手机号是否正确')
        }
      })
      .catch((err)=>{
         console.log(err)
        AlertIOS.alert('获取验证码失败,请检查手机号是否正确')
      })
  }
  _showVerifyCode(){
    this.setState({
      codeSent:true
    })
  }
  _countingDone(){
    this.setState({
      countingDone:true
    })
  }
  render(){
    return (
        <View style={styles.container}>
            <View style={styles.signupBox}>
                <Text style={styles.title}>快速登录</Text>
                <TextInput
                  style={styles.inputField}
                  onChangeText={(text) => {
                      this.setState({
                        phoneNumber:text
                      })
                      console.log(this.state.phoneNumber)
                    }
                  }
                  placeholder='输入手机号'
                  autoCaptialize={'none'}
                  autoCorrect={false}
                  KeyboardType={'number-pad'}
                />
                {
                  this.state.codeSent
                  ? <View style={styles.verifyCodeBox}>
                        <TextInput
                          style={styles.inputField,styles.VerifyInput}
                          onChangeText={(text) => {
                              this.setState({
                                verifyCode:text
                              })
                            }
                          }
                          placeholder='输入验证码'
                          autoCaptialize={'none'}
                          autoCorrect={false}
                          KeyboardType={'number-pad'}
                        />
                        {
                          this.state.countingDone
                          ?
                          <View style={styles.countBtn}>
                            <Button
                              color='#fff' 
                              title='获取验证码'
                              onPress={this._sendVerifyCode.bind(this)}>
                            </Button>
                          </View>
                          : <CountDownText
                            style={styles.countBtn}
                            countType='seconds' // 计时类型：seconds / date
                            auto={true} // 自动开始
                            afterEnd={this._countingDone.bind(this)} // 结束回调
                            timeLeft={10} // 正向计时 时间起点为0秒
                            step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                            startText='获取验证码' // 开始的文本
                            endText='获取验证码' // 结束的文本
                            intervalText={(sec) =>'剩余秒数' + sec} // 定时的文本回调
                            />
                        }
                    </View>
                  : null
                }
                
                {
                  this.state.codeSent
                  ? <View style={styles.btn}>
                      <Button
                        title='登录'
                        color='#ee735c'
                        onPress={this._submit.bind(this)}>
                      </Button>
                    </View>
                  : <View style={styles.btn}>
                      <Button
                        color='#ee735c' 
                        title='注册'
                        onPress={this._sendVerifyCode.bind(this)}>
                      </Button>
                    </View>
                }
            </View> 
          </View>
    )

  }
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    padding: 10,
    backgroundColor:"#f3f3f3",
  },
  signupBox:{
    marginTop: 30,
  },
  title:{
    marginBottom: 20,
    color: '#333',
    fontSize: 20,
    textAlign: 'center',
  },
  inputField:{
    height: 40,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4
  },
  VerifyInput:{
    flex:1,
    height: 40,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4
  },
  verifyCodeBox:{
    marginTop:10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countBtn:{
    height:40,
    marginLeft:8,
    backgroundColor:'#ee735c',
    borderColor:'#ee735c',
    borderRadius:2,
    width: 130,
  },
  btn:{
    marginTop:30,
    padding:10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius:4,
  }

})
module.exports = Login ;
