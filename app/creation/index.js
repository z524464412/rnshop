/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
  Alert
} from 'react-native';

import request from'../common/request'
import config from '../common/config'
import Item from './cell'
var cachedResults = {
  nextPage:1,
  items:[],
  total:0
}
class List extends PureComponent {
  //设置导航栏 
  static navigationOptions = ({ navigation }) => ({
      headerTitle:'首页',
      headerStyle: { backgroundColor: "#ee735c"},
  })
  constructor(props) {
      super(props);
      this.state ={
        props :props,
        data : [],
        isLoadingTail:false,
        isRefreshing:false
      }
  }
  componentDidMount(){
    this._fetchData(1)
  }
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
    request.get(config.api.base+config.api.creations,{
      accessToken:'abcdef',
      page:page
    })
      .then((data) =>{
        if(data.success){
          var items = cachedResults.items.slice();
          if(page != 0 ){
            items = items.concat(data.data)
            cachedResults.nextPage += 1 
          }else{
            items = []
            items = data.data;
          }
          cachedResults.items = items
          cachedResults.total = data.total
          setTimeout(()=>{
            if(page != 0){
                that.setState({
                  isLoadingTail:false,
                  data : cachedResults.items
                })
            }else{
                that.setState({
                  isRefreshing:false,
                  data : cachedResults.items
                })
            }
          },500)
          
        }
      })
      .catch((error)=>{
        if(page != 0){
          this.setState({
            isLoadingTail:false,
          })
        }else{
          this.setState({
            isRefreshing:false,
          })
        }
      })
  }
  refreshing(){
    var that = this;
    if(that.state.isRefreshing){
      return 
    }
    that.setState({
      isRefreshing:true
    })
    that._fetchData(0)
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
  onCellSelected(row: Object){
    console.log(row)
    this.props.navigation.navigate('Details', { data: row })
  }
  _renderItem = (row: Object) => {
     return (
        <Item 
          row={row.item} 
          onPress={this.onCellSelected.bind(this)} 
        />
     )
  }
  _keyExtractor = (item, index) => item._id;
  _footer(){
    if(!this._hasMore() && cachedResults.total != 0){
      return (
          <View style={styles.loadingMore}>
              <Text style={styles.loadingText}>没有更多</Text>
          </View>
        )
    }
    return <ActivityIndicator
        animating={this.state.animating}
        style={styles.loadingMore}
        size="large"
      />
  }

  _separator = () => {
      return <View style={{height:10}}/>;
  }
  render (){
    return (
      <View style={styles.container}>
          <View style={{flex:1}}>
              <FlatList 
                  // ref={(flatList)=>this._flatList = flatList}

                  // ListHeaderComponent={this._header}
                 
                  //显示底部
                  ListFooterComponent={this._footer.bind(this)}
                  //列表之间的间隙
                  // ItemSeparatorComponent={this._separator}

                  data={ this.state.data }
                  renderItem={this._renderItem}

                  onRefresh={this.refreshing.bind(this)}
                  
                  refreshing={false}


                  //预加载触发时与底部的距离
                  onEndReachedThreshold={0}
                  //预加载方法触发
                  onEndReached={this._fetchMoreData.bind(this)}

                  //设置key
                  keyExtractor={this._keyExtractor}


                  //空数据是显示
                  // ListEmptyComponent={
                  //   <Text>还没有数据哦</Text>
                  // }
                 
                  
                  // 设置为true则变为水平布局模式。
                  // horizontal={true}
                  // 设置横向多少列
                  // numColumns ={3}
                  //横向间隙样式
                  // columnWrapperStyle={{borderWidth:2,borderColor:'black',paddingLeft:20}}

                  //是否显示滚动条
                  // showsVerticalScrollIndicator={false}


                  // 自动调节内容内偏移，控制是否自动调节内容内偏移以便于一个
                  // navigation bar或者tab bar或者toolbar不挡住Scrollview中的内容。
                  // 默认是true
                  onEndReachedThreshold={true}
                  automaticallyAdjustContentInsets={false}
                  >

              </FlatList>
          </View>
      </View>
    )
  }
}

var styles = StyleSheet.create({
    container:{
      flex:1,
      backgroundColor:"#F5FCFF"
    },
    header:{
      paddingTop:25,
      paddingBottom:12,
      backgroundColor:'#ee735c'
    },
    headerTitle:{
      color:"#fff",
      fontSize:16,
      textAlign:'center',
      fontWeight:'200'
    },
    loadingMore:{
      marginVertical:20
    },
    loadingText:{
      color:'#777',
      textAlign:'center'
    }
})
export default List;
