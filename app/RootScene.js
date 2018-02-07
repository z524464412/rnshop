//import liraries
import React, { PureComponent } from 'react'
import { StatusBar } from 'react-native'
import { StackNavigator, TabNavigator, TabBarBottom } from 'react-navigation';

import TabBarItem from './components/TabBarItem'

import List from './creation/index'
import Edit from './edit/index'
import Account from './account/index'

import Details from './creation/detail'

// create a component
class RootScene extends PureComponent {
    constructor() {
        super()
        StatusBar.setBarStyle('dark-content')
    }
    render() {
        return (
            <Navigator/>
        );
    }
}

const Tab = TabNavigator(
    {
        List:{
            screen:List,
            navigationOptions:({ navigation }) =>({
                tabBarIcon:({focused,tintColor}) =>(
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('./images/icon/ios7-videocam-outline.png')}
                        selectedImage={require('./images/icon/ios7-videocam.png')}
                    /> 
                )
            })
        },
        Edit:{
            screen :Edit,
            navigationOptions:({ navigation }) =>({
                tabBarIcon :({ focused ,tintColor }) =>(
                    <TabBarItem
                        tintColor={tintColor}
                        focused ={ focused }
                        normalImage={require('./images/icon/ios7-recording-outline.png')}
                        selectedImage={require('./images/icon/ios7-recording.png')}
                    />
                )
            })
        },
        Account:{
            screen:Account,
            navigationOptions:({navigation})=>({
                tabBarIcon:({ focused,tintColor}) =>(
                    <TabBarItem
                        tintColor={tintColor}
                        focused ={ focused }
                        normalImage={require('./images/icon/ios7-more-outline.png')}
                        selectedImage={require('./images/icon/ios7-more.png')}
                    />
                )
            })
        }
    },
    {
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        animationEnabled: true,
        lazy: false,
        tabBarOptions: {
            showLabel:false,
            activeTintColor: '#ee735c',
            inactiveTintColor: '#979797',
            style: { backgroundColor: '#ffffff' },
        },
    }

);

const Navigator = StackNavigator(
    {
        
        Tab: { screen: Tab },
        Details:{screen:Details}
        // Web: { screen: WebScene },
        // GroupPurchase: { screen: GroupPurchaseScene },
       
    },
    {
        navigationOptions: {
            // headerStyle: { backgroundColor: '#06C1AE' },
            headerBackTitle: null,
            headerTintColor: '#333333',
            showIcon: false,
        },
    }
);
//make this component available to the app
export default RootScene;
