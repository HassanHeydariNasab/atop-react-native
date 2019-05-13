import React, { Component } from 'react'
import { View, TouchableOpacity, Image, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
    Button,
    Text,
    IconButton,
    TextInput,
    Searchbar,
    Card,
    Title,
    Subheading,
    Surface,
    Avatar
} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
    widthPercentageToDP as w,
    heightPercentageToDP as h,
    listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen'
import { NavigationAction } from 'react-navigation'
import { observer } from 'mobx-react'
import { states as user_state } from '../Stores/User'
import { logout } from '../utils'
import { theme } from '../index'

const default_avatar = require('../Images/profile_picture_placeholder.png')

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    }
    return h(`${percentage}%`)
}

const Item = ({ title, onPress, icon }) => (
    <TouchableOpacity
        onPress={onPress}
        style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10
        }}
    >
        <Icon name={icon} size={32} color='#fff' style={{ paddingLeft: 20 }} />
        <Title style={{ padding: 12, fontSize: 14, color: '#fff' }}>{title}</Title>
    </TouchableOpacity>
)

class Drawer extends Component {
    static navigationOptions = ({ navigation }) => {
        return {}
    }

    componentWillMount() {
        loc(this)
    }

    componentDidMount() {}

    componentWillUnmount() {
        rol()
    }

    goto_Top = () => {
        this.props.navigation.navigate('Top')
    }

    goto_Posts = () => {
        this.props.navigation.navigate('Posts')
    }

    goto_CreatePost = () => {
        this.props.navigation.navigate('CreatePost')
    }

    // eslint-disable-next-line react/sort-comp
    items = [
        { title: 'Top', icon: 'home', onPress: this.goto_Top },
        { title: 'Posts', icon: 'card-text-outline', onPress: this.goto_Posts },
        { title: 'Write a Post', icon: 'pencil-outline', onPress: this.goto_CreatePost },
        { title: 'Logout', icon: 'logout-variant', onPress: logout }
    ]

    render() {
        return (
            <ScrollView
                style={{
                    display: 'flex',
                    backgroundColor: theme.colors.primary,
                    paddingBottom: 12,
                    elevation: 3
                }}
                contentContainerStyle={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            >
                <View
                    style={{
                        width: '100%',
                        paddingVertical: h('5%'),
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ textAlign: 'center', marginTop: '5%', color: '#fff' }}>{user_state.user.name}</Text>
                </View>
                {this.items.map((item, index) => (
                    <Item title={item.title} icon={item.icon} onPress={item.onPress} key={item.title} />
                ))}
            </ScrollView>
        )
    }
}

export default observer(Drawer)
