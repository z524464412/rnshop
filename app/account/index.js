/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker'
import request from'../common/request'
import config from '../common/config'
import * as Progress from 'react-native-progress';
import sha1 from 'sha1'

import {

  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  AsyncStorage,
  Image,
  AlertIOS,
  TextInput,
  Modal

} from 'react-native';
var photoOptions = {
  title: '头像',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'选择相册',
  quality:0.75,
  allowsEditing:true,
  noData:false,
  newTime:'',

  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
var width = Dimensions.get('window').width;

var CLOUDINARY = {
  'cloud_name': 'dowj9zkna',  
  'api_key': '843861538595344',  
  'api_secret': 'yGeRQ29Ir6hJXooB5ghvH710SwY',  
  'base':'http://res.cloudinary.com/dowj9zkna',
  'image':'https://api.cloudinary.com/v1_1/dowj9zkna/image/upload',
  'video':'https://api.cloudinary.com/v1_1/dowj9zkna/video/upload',
  'audio':'https://api.cloudinary.com/v1_1/dowj9zkna/raw/upload'

}
function avatar(id,type){
  if(id.indexOf('http') > -1){
    return id
  }
  if(id.indexOf('data:image') > -1){
    return id
  }
  return CLOUDINARY.base +'/' +type + '/upload/' +id
}
class Account extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
      headerTitle:'账号',
      headerStyle: { backgroundColor: "#ee735c"},
      headerRight:(
            <Text 
              style={styles.toolbarExtra} 
              onPress={this._edit}
            >
              编辑
            </Text>
        )
  })
  constructor(props) {
    super(props);
    var user = this.props.user || {};
    this.state = {
      user:user,
      avatarSource:'',
      avatarProgress:0,
      avatarUploading:false,
      modelVisible:false
    };
    
  }
  _edit(){
    console.log(12312)
    this.setState({
      modelVisible:true
    })
  }
  _closeModal(){
    this.setState({
      modelVisible:false
    })
  }
  navigatePress = ()=>{
    console.log(this.props.navigation);
  }
  componentDidMount(){
    var _this = this;
    this.props.navigation.setParams({
      navigatePress:this.navigatePress
    })
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
      var avatarData = 'data:image/jpeg;base64,'+response.data
      
      var timestamp = Date.now()
      var tags = 'app,avatar'
      var folder = 'avatar'
      var signatureURL = config.api.base + config.api.signature
      var accessToken = this.state.user.accessToken
      request.post(signatureURL,{
        accessToken:accessToken,
        timestamp:timestamp,
        folder:folder,
        tags:tags,
        type:'avatar'
      })
      .then((data)=>{
        if(data && data.success){
          // data.data
          var signature = 'folder=' +folder + '&tags='+tags + 
          '&timestamp=' + timestamp + CLOUDINARY.api_secret

          signature = sha1(signature)

          var body =  new FormData()
          body.append('folder',folder)
          body.append('signature',signature)
          body.append('tags',tags)
          body.append('timestamp',timestamp)
          body.append('api_key',CLOUDINARY.api_key)
          body.append('resource_type','image')
          body.append('file',avatarData)

          _this._upload(body)
        }
      })
      .catch((err)=>{
        console.log(err)
      })

    })
  }
  _upload(body){

    var _this =this;
    var xhr = new XMLHttpRequest()
    var url = CLOUDINARY.image
    this.setState({
      avatarUploading:true,
      avatarProgress:0
    })
    xhr.open('POST',url)
    xhr.onload = ()=>{
      if(xhr.status !== 200){
        AlertIOS.alert('请求失败')
        console.log(xhr.responseText)
        return
      }
      if(!xhr.responseText){
        AlertIOS.alert('请求失败')
        return
      }
      var response ='';
      try{
        response =JSON.parse(xhr.response)
      }
      catch(e){
        console.log(e)
        console.log('parse fails')
      }
      if(response && response.public_id){
        console.log(response)
        var user = this.state.user
        user.avatar = avatar(response.public_id,'image')
        var randomNumber = Date.now();
        _this.setState({
          user,
          randomNumber,
          avatarUploading:false,
          avatarProgress:0
        })
        _this._asyncUser()
      }
    }
    if(xhr.upload){
      xhr.upload.onprogress = (event) =>{
        if(event.lengthComputable){
          var percent =Number((event.loaded / event.total).toFixed(2))
          _this.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body)
  }
  _asyncUser(isAvatar){
    var _this =this;
    var user = this.state.user;

    if(user && user.accessToken){
      var url = config.api.base +config.api.update

      request.post(url,user)
      .then((data)=>{
        if(data && data.success){
          var user = data.data
          if(isAvatar){
            AlertIOS.alert('头像更新成功')
          }
          _this.setState({
            user
          },function(){
            AsyncStorage.setItem('user',JSON.stringify(user))
          })
        }
      })
    }

  }
  render(){
    var user = this.state.user;
    return (
      <View style={styles.container}>
        {
          user.avatar
          ?<TouchableOpacity onPress={this._pickerPhoto.bind(this)} style={styles.avatarContainer}>
            <Image source={{uri:avatar(user.avatar,'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                this.state.avatarUploading
                ?<Progress.Circle
                  showsText = {true}
                  size={75}
                  color={"#ee735c"}
                  progress={this.state.avatarProgress}
                />
                :<Image style={styles.avatar}
                  source={{uri:avatar(user.avatar,'image')}}
                >
                </Image>
              }
              </View>

              <Text style={styles.avatarTip}>
                戳这里换头像
              </Text>
            </Image>
          </TouchableOpacity>
          :<TouchableOpacity style={styles.avatarContainer} onPress={this._pickerPhoto.bind(this)}>
            <Text style={ styles.avatarTip}>
              添加头像
            </Text>
            <View style={styles.avatarBox}>
              {
                this.state.avatarUploading
                ?<Progress.Circle
                  showsText = {true}
                  size={75}
                  color={"#ee735c"}
                  progress={this.state.avatarProgress}
                />
                :<Icon 
                  name="ios-cloud-upload-outline"
                  style={styles.plusIcon}
                />
              }
              
            </View>
          </TouchableOpacity>
        }
        <Modal
          animationType={'slide'}
          visible={this.state.modelVisible}>
          <View style={styles.modelContainer}>
            <Icon
              name="ios-close-outline"
              onPress={this._closeModal.bind(this)}
              style={styles.closeIcon}/>
              <View style={styles.fieldItem}>
                <Text style={styles.label}>昵称</Text>
                <TextInput
                  placeholder={'输入你的昵称'}
                  style={styles.inputField}
                  autoCapitalize={'none'}
                  autoCorrect = {false}
                  defaultValue={user.nickname}
                  onChangeText={(text)=>{
                    this.changeUserState('nickname',text)
                  }}
                />
              </View>
          </View>
        </Modal>
      </View>
    )
  }
}

var styles = StyleSheet.create({
 container:{
    flex:1
 },
 toolbarExtra:{
  position: 'absolute',
  top:15,
  right: 10,
  textAlign: 'right',
  fontSize:14,
  fontWeight: '600',
  color:'#fff'
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
 },
 modelContainer:{
  flex:1,
  paddingTop: 50,
  backgroundColor:'#fff'
 },
 fieldItem:{
  flexDirection: 'row',
  justifyContent:'space-between',
  alignItems:'center',
  height:50,
  paddingLeft:15,
  borderRadius:15,
  borderColor:'#eee',
  borderBottomWidth: 1
 },
 label:{
  color:'#ccc',
  marginRight: 10
 },
 inputField:{
  height:50,
  flex:1,
  color:'#666',
  fontSize:14

 }


})
module.exports = Account ;
