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
    Avatar,
    ActivityIndicator
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
import ErrorText from './ErrorText'
import { HOST } from '../config'
import { parseJSON, normalized_phone_number, on_connection_error, on_error, logout } from '../utils'
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

    state = {
        user_name: user_state.user.name,
        is_editing__user_name: false,
        is_sending__user_name: false,
        errors__user_name: {}
    }

    items = [{ title: 'Logout', icon: 'logout-variant', onPress: logout }]

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

    set_editing__user_name = () => {
        this.setState({ is_editing__user_name: true })
    }

    onChangeText__user_name = user_name => {
        this.setState({ user_name })
    }

    edit__user_name = () => {
        const { user_name } = this.state
        this.setState({ is_sending__user_name: true, errors__user_name: {} })
        fetch(`${HOST}/v1/users/me`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            },
            body: JSON.stringify({
                name: user_name
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_sending__user_name: false })
                if (status === 200) {
                    user_state.user.name = j.user.name
                    this.setState({ is_editing__user_name: false })
                } else if (status === 400) {
                    this.setState({ errors__user_name: j.errors })
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ is_sending__user_name: false })
                console.warn(error)
                on_connection_error()
            })
    }

    render() {
        const { user_name, is_editing__user_name, is_sending__user_name, errors__user_name } = this.state
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 26 }}>
                        {is_editing__user_name ? (
                            <>
                                <TextInput
                                    style={{
                                        textAlign: 'center',
                                        color: '#fff',
                                        fontFamily: theme.fonts.medium
                                    }}
                                    defaultValue={user_state.user.name}
                                    value={user_name}
                                    onChangeText={this.onChangeText__user_name}
                                    maxLength={36}
                                />
                                {is_sending__user_name ? (
                                    <ActivityIndicator color='#fff' style={{ marginLeft: 16 }} size={38} />
                                ) : (
                                    <IconButton
                                        icon='save'
                                        color='#fff'
                                        onPress={this.edit__user_name}
                                        style={{ marginLeft: 16 }}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        color: '#fff',
                                        fontFamily: theme.fonts.medium
                                    }}
                                >
                                    {user_state.user.name}
                                </Text>
                                <IconButton
                                    icon='edit'
                                    color='#fff'
                                    onPress={this.set_editing__user_name}
                                    style={{ marginLeft: 16 }}
                                />
                            </>
                        )}
                    </View>
                    <ErrorText errors={errors__user_name} keys='name' />
                    <Text style={{ textAlign: 'center', marginTop: 16, color: '#fff' }}>Today remaining likes:</Text>
                    <Text style={{ textAlign: 'center', color: '#fff' }}>{user_state.user.remaining_likes}</Text>
                </View>
                {this.items.map((item, index) => (
                    <Item title={item.title} icon={item.icon} onPress={item.onPress} key={item.title} />
                ))}
            </ScrollView>
        )
    }
}

export default observer(Drawer)
