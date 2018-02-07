/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
// import ImagePicker from 'react-native-image-picker';
// var ImagePicker = require('react-native-image-picker');
import ImagePicker from 'react-native-image-picker'
import {

  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  AsyncStorage,
  Image


} from 'react-native';
var photoOptions = {
  title: '头像',
  cancelBUttonTitle:'取消',
  takePhotoButtonTitle:'拍照',
  clooseFromLibraryButtonTitle:'选择相册',
  quality:0.75,
  allowsEditing:true,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
var width = Dimensions.get('window').width;

class Account extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
      headerTitle:'账号',
      headerStyle: { backgroundColor: "#ee735c"},
  })
  constructor(props) {
    super(props);
    var user = this.props.user || {};
    this.state = {
      user:user,
      avatarSource:''
    };
    
  }
  
  componentDidMount(){
    var _this = this;
    AsyncStorage.getItem('user')
    .then((data)=>{
      var user = ''
      if(data){
        user = JSON.parse(data);
      }
      if(user && user.accessToken){
        _this.setState({
          user:user
        })
      }
    })
  }
  _pickerPhoto(){
      var  _this = this;
      ImagePicker.showImagePicker(photoOptions, (response) => {
      if (response.didCancel) {
        return
      }
      var avatarData = 'data:image/jpegbase64,'+response.data
      var user =_this.state.user
      user.avatar = avatarData
      _this.setState({
          user: user
      })
    })
  }
  render(){
    var user = this.state.user;
    return (
      <View style={styles.container}>
        {
          !user.avatar
          ?<TouchableOpacity onPress={this._pickerPhoto.bind(this)} style={styles.avatarContainer}>
            <Image source={{uri:user.avatar}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Image style={styles.avatar}
                  source={{uri:user.avatar}}
                >
                </Image>
              </View>
              <Text style={styles.avatarTip}>
                戳这里换头像
              </Text>
            </Image>
          </TouchableOpacity>
          :<View style={styles.avatarContainer}>
            <Text style={ styles.avatarTip}>
              添加头像
            </Text>
            <TouchableOpacity style={styles.avatarBox}>
              <Icon 
                name="ios-cloud-upload-outline"
                style={styles.plusIcon}
              />
            </TouchableOpacity>
          </View>
        }
      </View>
    )
  }
}

var styles = StyleSheet.create({
 container:{
    flex:1
 },
 avatarContainer:{
  width:width,
  height: 140,
  alignItems:'center',
  justifyContent: 'center',
  backgroundColor:'#666'
 },
 avatarTip:{
  color:'#fff',
  backgroundColor:'transparent',
  fontSize:14
 },
 avatarBox:{
  marginTop:15,
  alignItems:'center',
  justifyContent:'center',
  backgroundColor:'transparent',
 },
 avatar:{
  marginBottom: 15,
  width:width * 0.2,
  height:width * 0.2,
  resizeMode: 'cover',
  borderRadius: width * 0.1,
  borderColor:'#666',
  borderWidth:1
 },
 plusIcon:{
  padding: 20,
  paddingLeft: 25,
  paddingRight: 25,
  color: '#fff',
  fontSize: 32,
  backgroundColor:'transparent',
  borderColor:'#666',
  borderWidth:1,
  borderRadius:8
 }

})
module.exports = Account ;
