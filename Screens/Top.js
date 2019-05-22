import React, { Component } from 'react'
import { View, Image, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Button, Text, TextInput, Title } from 'react-native-paper'
import {
    widthPercentageToDP as w,
    heightPercentageToDP as h,
    listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react'
import { states as user_state } from '../Stores/User'
import { states as snackbar_state } from '../Stores/Snackbar'
import { states as settings_state } from '../Stores/Settings'
import { parseJSON, normalized_phone_number, on_connection_error } from '../utils'
import { theme } from '../index'

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    }
    return h(`${percentage}%`)
}

class Top extends Component {
    static navigationOptions = () => {
        return {
            tabBarIcon: ({ focused, horizontal, tintColor }) => (
                <Icon name='arrow-up-circle-outline' size={18} color={tintColor} />
            )
        }
    }

    state = { post: {} }

    onDidFocus = null

    componentWillMount() {
        loc(this)
    }

    componentDidMount() {
        const { navigation } = this.props
        this.fetch_top_post()
        this.onDidFocus = navigation.addListener('didFocus', payload => {
            this.fetch_top_post()
        })
    }

    componentWillUnmount() {
        rol()
        this.onDidFocus.remove()
    }

    fetch_top_post = () => {
        this.setState({ is_fetching_post: true })
        fetch(`${settings_state.host}/v1/posts?offset=0&limit=1`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            }
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_fetching_post: false, is_refreshing_post: false })
                if (status === 200) {
                    this.setState({ post: j.posts[0] })
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ is_fetching_posts: false, is_refreshing_posts: false })
                console.warn(error)
                on_connection_error()
            })
    }

    render() {
        const { post } = this.state
        return (
            <View
                style={{
                    flex: 1,
                    width: '100%',
                    paddingHorizontal: w('10%'),
                    paddingBottom: h('10%'),
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text style={{ fontFamily: theme.fonts.medium, marginBottom: 20 }}>{post?.user?.name}</Text>
                <Text style={{ fontFamily: theme.fonts.regular, margin: 18 }}>{post?.text}</Text>
            </View>
        )
    }
}

export default observer(Top)
