import React from 'react'
import {
    createStackNavigator,
    createAppContainer,
    createDrawerNavigator,
    createSwitchNavigator
} from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Splash from './Screens/Splash'
import Login from './Screens/Login'
import Drawer from './Components/Drawer'
import Top from './Screens/Top'
import CreatePost from './Screens/CreatePost'
import Posts from './Screens/Posts'

const StackNavigator = createMaterialBottomTabNavigator(
    {
        Top: {
            screen: Top
        },
        Posts: {
            screen: Posts
        },
        CreatePost: {
            screen: CreatePost
        }
    },
    { initialRouteName: 'Top', navigationOptions: {}, defaultNavigationOptions: {} }
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
