import React, { Component } from 'react'
import { View, Image } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { ActivityIndicator } from 'react-native-paper'
import RNRestart from 'react-native-restart'
import { states as user_state } from '../Stores/User'
import { states as settings_state } from '../Stores/Settings'
import { parseJSON, logout, on_connection_error, on_error } from '../utils'
import { HOST } from '../config'

export default class Drawer extends Component {
    constructor(props) {
        super(props)
        AsyncStorage.getItem('host', (error_host, host) => {
            if (host) {
                settings_state.host = host
            }
            AsyncStorage.getItem('token', (error_token, token) => {
                if (token) {
                    user_state.token = token
                    this.fetch_me()
                } else {
                    AsyncStorage.clear(error => {
                        if (!error) {
                            this.props.navigation.navigate('Login')
                        }
                    })
                }
            })
        })
    }

    fetch_me = () => {
        fetch(`${settings_state.host || HOST}/v1/users/me`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            }
        })
            .then(parseJSON)
            .then(([status, j]) => {
                if (status === 200) {
                    user_state.user = j.user
                    this.props.navigation.navigate('Main')
                } else if (status === 401) {
                    logout()
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                console.warn(error)
                on_connection_error()
            })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }
}
