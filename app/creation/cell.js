
import React, { PureComponent } from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TouchableHighlight,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  StatusBar

} from 'react-native';
import request from'../common/request'
import config from '../common/config'
import Icon from 'react-native-vector-icons/Ionicons';

var width = Dimensions.get('window').width;

class Item extends PureComponent{
 
  //构造方法
  constructor(props){
      super(props);
      this.state = {
        row : this.props.row,
        up  : false
      }
  }
  _up(){    
    var that = this;
    var up = !this.state.up;
    var row = this.state.row;
    var url = config.api.base + config.api.up;
    var body = {
      id:row._id,
      up:up ? 'yes' :'no',
      accessToken:'qwe' 
    }
    request.post(url,body).then((data) =>{
      if(data.success){
          that.setState({
            up:up
          })
      }else{
        // Alert.alert('点赞失败,稍后重试！')
      }
    })
    .catch(function(err){
     alert(err)
    })
  }
  render(){
    var row = this.state.row;
    return( 
      <TouchableHighlight onPress={() => this.props.onPress(row)}>
        <View style={styles.item} >
          <Text style={styles.title}>
            {row.title}
          </Text>
          <Image 
            source = {{uri:row.thumb}}
            style={styles.thumb}
          >
            <Icon
              name='ios-play'
              size= {28}
              style={styles.play}
            />
          </Image>
            <View style={styles.itemFooter}>
              <View style={styles.handleBox}>
                <Icon
                  name={ this.state.up ? "ios-heart-outline" : "ios-heart"}
                  size={28}
                  style={[this.state.up ? styles.up : styles.down ]}
                  onPress = {this._up.bind(this)}
                />
                <Text style={styles.handleText} onPress = {this._up.bind(this)}>
                  喜欢
                </Text>
              </View>
            <View style={styles.handleBox}>
              <Icon
                name="ios-chatboxes-outline"
                size={28}
                style={styles.commentIcon}
              />
              <Text style={styles.handleText}>
                评论
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}
var styles = StyleSheet.create({
      item : {
      width:width,
      // marginBottom:10,
      backgroundColor:'#fff'
    },
    thumb:{
      width:width,
      height:width * 0.56,
      resizeMode:'cover'
    },
    title:{
      padding:10,
      fontSize:18,
      color:'#333'
    },
    itemFooter:{
      flexDirection:'row',
      justifyContent:'space-between',
      backgroundColor:'#eee'
    },
    handleBox:{
      padding:10,
      flexDirection:'row',
      justifyContent:'center',
      width:width/2 -0.5,
      backgroundColor:'#fff'
    },
    play:{
      position:'absolute',
      bottom:14,
      right:14,
      width:46,
      height:46,
      paddingTop:9,
      paddingLeft:18,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:23,
      color:'#ed7b66'
    },
    handleText:{
      paddingLeft:12,
      fontSize:18,
      color:'#333'
    },
    up:{
      fontSize:22,
      color:'#333'
    },
    down:{
      fontSize:22,
      color:'#ed7b66'
    },
    commentIcon:{
      fontSize:22,
      color:"#333"
    }

})
module.exports =Item;