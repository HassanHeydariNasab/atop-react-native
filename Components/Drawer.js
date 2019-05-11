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
            borderBottomWidth: 0.7,
            borderBottomColor: '#e0e0e0'
        }}
    >
        <Icon name={icon} size={32} color='#B0BEC5' style={{ paddingLeft: 12 }} />
        <Title style={{ padding: 12, fontSize: 14 }}>{title}</Title>
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
        this.props.navigation.navigate('Businesses')
    }

    goto_Posts = () => {
        this.props.navigation.navigate('Posts')
    }

    // eslint-disable-next-line react/sort-comp
    items = [
        { title: 'Top', icon: 'home', onPress: this.goto_Businesses },
        { title: 'Posts', icon: 'card-text-outline', onPress: this.goto_Posts },
        { title: 'Logout', icon: 'logout-variant', onPress: logout }
    ]

    render() {
        return (
            <ScrollView
                style={{
                    display: 'flex',
                    backgroundColor: '#fafafa',
                    paddingBottom: 12,
                    elevation: 3
                }}
                contentContainerStyle={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            >
                <View
                    style={{
                        width: '100%',
                        borderBottomWidth: 0.7,
                        borderBottomColor: '#e0e0e0',
                        paddingVertical: h('5%'),
                        alignItems: 'center'
                    }}
                >
                    {user_state.user.avatar ? (
                        <Image
                            style={{
                                width: vmin(20),
                                height: vmin(20),
                                borderRadius: w('100%'),
                                borderWidth: 1.6,
                                borderColor: theme.colors.text
                            }}
                            source={{
                                uri: user_state.user.avatar
                            }}
                            height={vmin(20)}
                            width={vmin(20)}
                            defaultSource={default_avatar}
                            resizeMode='cover'
                        />
                    ) : (
                        <Image
                            style={{
                                width: vmin(20),
                                height: vmin(20),
                                borderRadius: w('100%'),
                                borderWidth: 1.6,
                                borderColor: theme.colors.text
                            }}
                            source={default_avatar}
                            height={vmin(20)}
                            width={vmin(20)}
                            defaultSource={default_avatar}
                            resizeMode='cover'
                        />
                    )}
                    <Text style={{ textAlign: 'center', marginTop: '5%' }}>{user_state.user.name}</Text>
                </View>
                {this.items.map((item, index) => (
                    <Item title={item.title} icon={item.icon} onPress={item.onPress} key={item.title} />
                ))}
            </ScrollView>
        )
    }
}

export default observer(Drawer)
