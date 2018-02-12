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
  Modal,
  Button

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
              onPress={()=>navigation.state.params._edit()}
            >
              编辑
            </Text>
        )
  })
  constructor(props) {
    super(props);
    console.log(props)
    var user = this.props.user || {};
    var that = this;
    this.state = {
      user:user,
      avatarSource:'',
      avatarProgress:0,
      avatarUploading:false,
      modelVisible:false
    };
    
  }
  _edit = ()=>{
    this.setState({
      modelVisible:true
    })
  }
  _closeModal(){
    this.setState({
      modelVisible:false
    })
  }
  componentDidMount(){
    var _this = this;
    this.props.navigation.setParams({
      _edit:this._edit
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
            _this._closeModal();
            AsyncStorage.setItem('user',JSON.stringify(user))
          })
        }
      })
    }

  }
  _changeUserState(key,value){
    var user =this.state.user
    user[key] = value
    var aa = Date.now();
    this.setState({
        user:user,
        aa:aa
    })
  }
  _logout(){
    console.log(this.props)
    //this.props._logout();
  }
  _submit(){
    this._asyncUser()
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
                    this._changeUserState('nickname',text)
                  }}
                />
              </View>

              <View style={styles.fieldItem}>
                <Text style={styles.label}>品种</Text>
                <TextInput
                  placeholder={'品种'}
                  style={styles.inputField}
                  autoCapitalize={'none'}
                  autoCorrect = {false}
                  defaultValue={user.breed}
                  onChangeText={(text)=>{
                    this._changeUserState('breed',text)
                  }}
                />
              </View>


              <View style={styles.fieldItem}>
                <Text style={styles.label}>年龄</Text>
                <TextInput
                  placeholder={'年龄'}
                  style={styles.inputField}
                  autoCapitalize={'none'}
                  autoCorrect = {false}
                  defaultValue={user.age}
                  onChangeText={(text)=>{
                    this._changeUserState('age',text)
                  }}
                />
              </View>

              <View style={styles.fieldItem}>
                <Text style={styles.label}>性别</Text>
                {
                    console.log(this.state.user.gender)
                  }
                <Icon.Button
                  onPress={()=>{
                    this._changeUserState('gender','male')
                  }}
                  style={[
                      styles.gender,
                      user.gender == 'male'  && styles.genderChecked
                    ]}
                  name='ios-paw'>男
                </Icon.Button>
                <Icon.Button
                  onPress={()=>{
                    this._changeUserState('gender','female')
                  }}
                  style={[
                      styles.gender,
                      user.gender == 'female' && styles.genderChecked
                    ]}
                  name='ios-paw-outline'>女
                  </Icon.Button>
              </View>  
              <View style={styles.btn}>
                <Button
                  title='保存'
                  color='#ee735c'
                  onPress={this._submit.bind(this)}>
                </Button>
              </View>          
          </View>
        </Modal>

        <View style={styles.btn}>
          <Button
            title='退出登录'
            color='#ee735c'
            onPress={this._logout.bind(this)}>
          </Button>
        </View> 
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
 closeIcon:{
  position:'absolute',
  width:40,
  height:40,
  fontSize:32,
  right:20,
  top:30,
  color:'#ee735c'
 },
 inputField:{
  height:50,
  flex:1,
  color:'#666',
  fontSize:14

 },
 gender:{
  backgroundColor:'#ccc'
 },
genderChecked:{
  backgroundColor:'#ee735c'
},
  btn:{
    marginTop:30,
    padding:10,
    marginLeft: 10,
    marginRight:10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius:4,
},
})
module.exports = Account ;
