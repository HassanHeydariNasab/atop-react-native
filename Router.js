import React from 'react'
import {
    createStackNavigator,
    createAppContainer,
    createDrawerNavigator,
    createSwitchNavigator
} from 'react-navigation'
import Splash from './Screens/Splash'
import Login from './Screens/Login'
import Drawer from './Components/Drawer'
import Top_ from './Screens/Top'

const StackNavigator = createStackNavigator(
    {
        Top_: {
            screen: Top_
        },
        // Posts: {
        //     screen: Posts
        // },
        // Post: {
        //     screen: Post
        // },
        // CreatePost: {
        //     screen: CreatePost
        // },
        // Settings: {
        //     screen: Settings
        // }
    },
    { initialRouteName: 'Top_', navigationOptions: {}, defaultNavigationOptions: {} }
)

const DrawerNavigator = createDrawerNavigator(
    {
        StackNavigator: {
            screen: StackNavigator
        }
    },
    { contentComponent: Drawer, drawerPosition: 'left' }
)

const Login_or_Main = createSwitchNavigator(
    {
        Splash: {
            screen: Splash
        },
        Login: {
            screen: Login
        },
        Main: {
            screen: DrawerNavigator
        }
    },
    { initialRouteName: 'Splash' }
)

export default createAppContainer(Login_or_Main)
