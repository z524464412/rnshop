import React,{ PureComponent } from 'react'
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
  ScrollView,
  TouchableOpacity,
  Alert} from 'react-native'
  var width = Dimensions.get('window').width;
  import Icon from 'react-native-vector-icons/Ionicons';
  import Video from 'react-native-video'
  import request from'../common/request'
  import config from '../common/config'

  var cachedResults = {
    nextPage:1,
    items:[],
    total:0
  }
  class detail extends PureComponent{
    static navigationOptions = ({ navigation }) => ({
        headerTitle:'详情',
        headerStyle: { backgroundColor: "#ee735c"},
    });

    constructor(props) {
      super(props);
      this.state = {
          info: {},
          rate:1,
          videoLoaded:false,
          muted:false,
          resizeMode:'contain',
          repeat:false,

          paused:false,
          videoProgress:0.01,
          videoTotal:0,
          currentTime:0,

          playing:true,

          videoOK:true,
          comments:[],

          isLoadingTail:false,
          isRefreshing:false

      }
    };
    componentWillMount(){
      this._fetchData(1)
    };
    _fetchData(page){
      var that = this;
      if(page == 0){
        this.setState({
          isRefreshing:true
        })
      }else{
        this.setState({
          isLoadingTail:true,
         })
      }
      var url =config.api.base+ config.api.comment
      request.get(url,{
        id:124,
        accessToken:'123a',
        page:page
      })
      .then(function(data){
        console.log(data)
        if(data && data.success){
          var comments = data.data;
          if(comments && comments.length >0){
            that.setState({
              comments:comments
            })
          }
        }
      })
      .catch((error)=>{
        console.log(error)
      })
    }
    _onLoadStart(){
      console.log('load start')  
    }
    _onLoad(){
      console.log('loads')  
    }
    _onProgress(data){
      if(!this.state.videoLoaded){
          this.setState({
            videoLoaded: true
          })
      }
      var duration = data.playableDuration
      var currentTime = data.currentTime
      var percent = Number(currentTime/duration.toFixed(2))
      var newState={
        videoTotal:duration,
        currentTime:Number(data.currentTime.toFixed(2)),
        videoProgress:percent
      }
      if(!this.state.videoLoaded){
        newState.videoLoaded = true
      }
      if(!this.state.playing){
        newState.playing = false
      }
      this.setState(newState)
    }
    _onEnd(){
      this.setState({
        videoProgress:1,
        playing:false
      })
    }
    _onError(e){
      this.setState({
        videoOK:false,
        videoLoaded:true
      })
      
    }
    _rePlay(){
      this.setState({
        playing:true
      })
      this.refs.videoPlayer.seek(0)
    }
    _pause(){
      if(!this.state.paused){
        this.setState({
          paused:true
        })
      }
        
    }
    _resume(){
      if(this.state.paused){
        this.setState({
          paused:false
        })
      }
    }
    _renderItem = (info) => {
      console.log(info)
      return (
        <View key={info.item._id} style={styles.replyBox}>
            <Image style={styles.replyAvatar} 
              source={{uri:info.item.replyBy.avatar}}/>
            <View style={styles.reply}>
              <Text style={styles.replyNickname}>{info.item.replyBy.nickName}</Text>
              <Text style={styles.replyContent}>{info.item.content}</Text>
            </View>
          </View>
     )
    }
    _hasMore(){
      return cachedResults.items.length !== cachedResults.total
    }
    _fetchMoreData(){
       if(!this._hasMore() || this.state.isLoadingTail){
        return 
      }
      var page = cachedResults.nextPage;
      this._fetchData(page) 
    }
    _keyExtractor = (item, index) => item._id;
  	render(){
      let info = this.props.navigation.state.params.data;
  		return (
  			<View>
          <View style={styles.videoBox}>
            <Video
              ref='videoPlayer'
              source={{uri:info.video}}
              style={styles.video}
              volume={1.0}
              paused={this.state.paused}
              rate={this.state.rate}
              muted={this.state.muted}
              resizeMode={this.state.resizeMode}
              repeat={this.state.repeat}
              
              onLoadStart = {this._onLoadStart}
              onLoad= {this._onLoad}
              onProgress = {this._onProgress.bind(this)}
              onEnd={this._onEnd.bind(this)}
              onError={this._onError.bind(this)}
            />
            {
              !this.state.videoOK && <Text style={styles.failText}>加载失败</Text>

            }
            {
              !this.state.videoLoaded && 
              <ActivityIndicator color='#ee735c' style={styles.loading}/>
            }
            {
              this.state.videoLoaded && this.state.playing
              ? <TouchableOpacity onPress={this._pause.bind(this)} style={
                styles.pauseBtn}>
                  {
                    this.state.paused
                    ? <Icon 
                      onPress={this._resume.bind(this)} 
                      name="ios-play"
                      size={48}
                      style={styles.resumeIcon}
                      />
                    : <Text></Text>
                  }
                </TouchableOpacity>
              : null
            }
            {
              this.state.videoLoaded && !this.state.playing
              ? <Icon
                onPress={this._rePlay.bind(this)}
                name='ios-play'
                size={ 48 }
                style={styles.playIcon}/>
              : null
            }
            <View style={styles.progressBox}>
              <View style={[styles.progressBar,
                {width:width * this.state.videoProgress}]}>
              </View>
            </View>  
          </View>
          <ScrollView style={styles.scrollBox}>
             <View style={styles.infoBox}>
              <Image style={styles.avatar} 
                source={{uri:info.author.avatar}}/>
              <View style={styles.descBox}>
                <Text style={styles.nickName}>{info.author.nickName}</Text>
                <Text style={styles.title}>{info.title}</Text>
              </View>
            </View>
            {
              console.log(this.state)
            }
            <View style={{flex:1}}>
              <FlatList
                data={this.state.comments}
                renderItem={ this._renderItem }
                keyExtractor={this._keyExtractor}

                initialNumToRender={2}
                //预加载触发时与底部的距离
                onEndReachedThreshold={0}
                //预加载方法触发
                onEndReached={this._fetchMoreData.bind(this)}
                onEndReachedThreshold={true}
                automaticallyAdjustContentInsets={false}
              />
            </View>
          </ScrollView>
  			</View>
  		)
  	}
  };
  var styles = StyleSheet.create({
    container:{
      flex:1,
      alignItems:'center',
      backgroundColor:'#f5fcff'
    },
    videoBox:{
        width:width,
        height:width * 0.56,
        backgroundColor:'#000'
    },
    video:{
      width:width,
      height:width * 0.56,
      backgroundColor:'#000'
    },
    failText:{
      position:'absolute',
      left:0,
      top:90,
      color:'#fff',
      width:width,
      textAlign:'center',
      alignSelf:'center',
      // backgroundColor:'transparent'
    },
    loading:{
      position:'absolute',
      left:0,
      top:80,
      width:width,
      alignSelf:'center',
      backgroundColor:'transparent'

    },
    progressBox:{
      width:width,
      height:4,
      backgroundColor:'#ccc'
    },
    progressBar:{
      width:1,
      height:4,
      backgroundColor:'#ff6600'
    },
    playIcon:{
      position:'absolute',
      left:width / 2 -30,
      top:90,
      right:14,
      width:60,
      height:60,
      paddingTop:8,
      paddingLeft:22,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:30,
      color:'#ed7b66'
    },
    pauseBtn:{
      position:'absolute',
      left:0,
      top:0,
      width: width,
      height: width * 0.56,
    },
    resumeIcon:{
      position:'absolute',
      left:width / 2 -30,
      top:80,
      right:14,
      width:60,
      height:60,
      paddingTop:8,
      paddingLeft:22,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:30,
      alignSelf:'center',
      color:'#ed7b66'
    },
    scrollBox:{
      width:width,
      height:width * 1,
      marginTop:10
    },
    infoBox:{
      width:width,
      flexDirection:'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    avatar:{
      width: 60,
      height:60,
      marginRight: 10,
      marginLeft: 10,
      borderRadius:30
    },
    descBox:{
      flex:1
    },
    nickName:{
      fontSize: 18,
    },
    title:{
      marginTop: 8,
      fontSize: 16,
      color: '#666'
    },
    replyBox:{
      flexDirection:'row',
      justifyContent:'flex-start',
      marginTop:10
    },
    replyAvatar:{
      width:40,
      height:40,
      marginRight:10,
      marginLeft:10,
      borderRadius:20
    },
    replyNickname:{
      color:'#666'
    },
    replyContent:{
      marginTop:4,
      color:'#666'
    },
    reply:{
      flex:1
    }
  })
  export default detail;

