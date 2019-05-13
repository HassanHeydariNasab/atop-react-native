import React, { Component } from 'react'
import { AppRegistry, I18nManager, StatusBar, Linking, Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Provider as PaperProvider, DefaultTheme, Snackbar } from 'react-native-paper'
import RNRestart from 'react-native-restart'
import { observer } from 'mobx-react'
import { states as snackbar_state } from './Stores/Snackbar'
import { states as user_state } from './Stores/User'
import { name as appName } from './app.json'
import { HOST } from './config'
import { parseJSON, on_connection_error, logout, cheapest_tier, farsify, farsi_date_ago } from './utils'
import Router from './Router'
import NavigationService from './NavigationService'

// eslint-disable-next-line import/prefer-default-export
export const theme = {
    ...DefaultTheme,
    roundness: 4,
    colors: {
        ...DefaultTheme.colors,
        primary: '#26A69A',
        accent: '#6855F9',
        text: '#052C49',
        placeholder: '#607D8B',
        divider: '#E3E8EB',
        background: '#f5f5f5'
    },
    fonts: {
        ...DefaultTheme.fonts,
        black: 'Vazir-Black',
        bold: 'Vazir-Bold',
        medium: 'Vazir-Medium',
        regular: 'Vazir-Regular',
        light: 'Vazir-Light',
        thin: 'Vazir-Thin'
    }
}

class App extends Component {
    componentWillMount() {
        I18nManager.allowRTL(false)
        if (I18nManager.isRTL) {
            RNRestart.Restart()
        }
        // I18nManager.forceRTL(true)
        // if (!I18nManager.isRTL) {
        //     RNRestart.Restart()
        // }
    }

    componentDidMount() {
        Linking.addEventListener('url', this._handleOpenURL)
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this._handleOpenURL)
    }

    _handleOpenURL = event => {
        const { url } = event
        if (url === 'atop://post') {
            NavigationService.navigate('Post')
        }
    }

    onDismiss_snackbar = () => {
        snackbar_state.is_visible = false
    }

    onPress_snackbar_action = () => {
        snackbar_state.is_visible = false
    }

    set_ref_to_Router = ref => {
        NavigationService.setTopLevelNavigator(ref)
    }

    pre_goto_post = () => {
        // If the current route is Splash, token is not provided yet.
        // So we grab the token from AsyncStorage and postpone fetch_profile
        if (!user_state.token) {
            AsyncStorage.getItem('token', (error, token) => {
                if (token) {
                    user_state.token = token
                } else {
                    AsyncStorage.clear(error_ => {
                        if (!error_) {
                            NavigationService.navigate('Login')
                        }
                    })
                }
            })
        } else {
            this.fetch_post(post_id)
        }
    }

    goto_post = post => {
        NavigationService.navigate('Post', { post })
    }

    fetch_post = post_id => {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
        if (user_state.token) {
            headers.Authorization = `JWT ${user_state.token}`
        }
        this.setState({ is_fetching_post: true })
        fetch(`${HOST}/posts/${post_id}/`, { method: 'GET', headers })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_fetching_post: false })
                if (status === 200) {
                    this.goto_post(j)
                } else if (status === 401) {
                    logout()
                } else {
                    console.warn(status, j)
                }
            })
            .catch(error => {
                this.setState({ is_fetching_post: false })
                console.warn(error)
                on_connection_error()
            })
    }

    render() {
        return (
            <PaperProvider theme={theme}>
                <>
                    <StatusBar backgroundColor='#052D49' barStyle='light-content' />
                    <Snackbar
                        visible={snackbar_state.is_visible}
                        onDismiss={this.onDismiss_snackbar}
                        action={snackbar_state.action}
                        duration={4000}
                    >
                        {snackbar_state.message}
                    </Snackbar>
                    <Router ref={this.set_ref_to_Router} />
                </>
            </PaperProvider>
        )
    }
}

AppRegistry.registerComponent(appName, () => observer(App))
