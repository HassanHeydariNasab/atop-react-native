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
import { observer } from 'mobx-react'
import { states as user_state } from '../Stores/User'
import { states as snackbar_state } from '../Stores/Snackbar'
import { HOST } from '../config'
import { parseJSON, normalized_mobile, on_connection_error, on_error } from '../utils'

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    }
    return h(`${percentage}%`)
}

class Login extends Component {
    static navigationOptions = () => {
        return {}
    }

    state = {
        country_code: '',
        mobile: '',
        name: '',
        code: '',
        is_submitting: false,
        is_request_code_passed: false,
        is_user_exists: false
    }

    componentWillMount() {
        loc(this)
    }

    componentDidMount() {}

    componentWillUnmount() {
        rol()
    }

    onChange_input = event => {
        const { target } = event
        const value = target.type === 'checkbox' ? target.checked : target.value
        const { name } = target
        this.setState({
            [name]: value
        })
    }

    code_field_focus = () => {
        this.code_field.focus()
    }

    mobile_field_focus = () => {
        this.mobile_field.focus()
    }

    goto_request_code = () => {
        this.setState({ is_request_code_passed: false })
    }

    submit_request_code = () => {
        this.setState({ is_submitting: true })
        fetch(`${HOST}/v1/request_code`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: this.state.country_code + normalized_mobile(this.state.mobile)
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_submitting: false })
                if (status === 201) {
                    this.setState({ is_request_code_passed: true, is_user_exists: j.is_user_exists })
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ is_submitting: false })
                console.warn(error)
                on_connection_error()
            })
    }

    submit_register = () => {
        fetch(`${HOST}/v1/register`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: this.state.country_code + normalized_mobile(this.state.mobile),
                code: this.state.code,
                name: this.state.name
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_submitting: false })
                if (status === 201) {
                    user_state.token = j.token
                    AsyncStorage.setItem('token', j.token, () => {
                        snackbar_state.message = 'You have been registered and logged in.'
                        snackbar_state.is_visible = true
                        this.props.navigation.navigate('Main')
                    })
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ is_submitting: false })
                console.warn(error)
                on_connection_error()
            })
    }

    submit_login = () => {
        fetch(`${HOST}/v1/login`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: this.state.country_code + normalized_mobile(this.state.mobile),
                code: this.state.code
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                console.warn(status, j)
                this.setState({ is_submitting: false })
                if (status === 200) {
                    user_state.token = j.token
                    AsyncStorage.setItem('token', j.token, () => {
                        snackbar_state.message = 'You are logged in.'
                        snackbar_state.is_visible = true
                        this.props.navigation.navigate('Main')
                    })
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ is_submitting: false })
                console.warn(error)
                on_connection_error()
            })
    }

    fetch_me = () => {
        fetch(`${HOST}/v1/users/me`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            }
        })
            .then(parseJSON)
            .then(([status, j]) => {
                console.warn(j)
                if (status === 200) {
                    user_state.user = j.user
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

    country_code_field = null

    mobile_field = null

    name_field = null

    code_field = null

    render() {
        return (
            <ScrollView style={{ backgroundColor: '#fafafa' }}>
                <View style={{ height: '100%', paddingHorizontal: w('10%'), paddingBottom: h('10%') }}>
                    <View
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: h('10%'),
                            marginBottom: h('5%')
                        }}
                    >
                        <Image
                            source={require('../Images/logo.png')}
                            height={48}
                            width={48}
                            style={{ height: vmin(20), width: vmin(20) }}
                        />
                        {/* <Title>اتاپ</Title> */}
                    </View>
                    {!this.state.is_request_code_passed ? (
                        <>
                            <View style={{ flexDirection: 'column' }}>
                                <TextInput
                                    placeholder='country code'
                                    keyboardType='numeric'
                                    value={this.state.country_code}
                                    onChangeText={country_code => this.setState({ country_code })}
                                    returnKeyType='next'
                                    ref={ref => {
                                        this.country_code_field = ref
                                    }}
                                    onSubmitEditing={this.mobile_field_focus}
                                />
                                <TextInput
                                    placeholder='mobile'
                                    keyboardType='numeric'
                                    value={this.state.mobile}
                                    onChangeText={mobile => this.setState({ mobile })}
                                    returnKeyType='go'
                                    ref={ref => {
                                        this.mobile_field = ref
                                    }}
                                    onSubmitEditing={this.submit_request_code}
                                    style={{ marginTop: 12 }}
                                />
                            </View>
                            <Button
                                onPress={this.submit_request_code}
                                loading={this.state.is_submitting}
                                mode='contained'
                                style={{ marginTop: 12 }}
                                dark
                            >
                                {'Login / Register'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text style={{ marginBottom: 16 }}>
                                {`The validation code was sent to ${normalized_mobile(this.state.mobile)}`}
                            </Text>
                            {!this.state.is_user_exists ? (
                                <>
                                    <TextInput
                                        placeholder='name'
                                        keyboardType='default'
                                        value={this.state.name}
                                        onChangeText={name => this.setState({ name })}
                                        returnKeyType='next'
                                        ref={ref => {
                                            this.name_field = ref
                                        }}
                                        onSubmitEditing={this.code_field_focus}
                                        style={{ marginBottom: 12 }}
                                    />
                                </>
                            ) : null}
                            <TextInput
                                placeholder='code'
                                keyboardType='numeric'
                                value={this.state.code}
                                onChangeText={code => this.setState({ code })}
                                returnKeyType='go'
                                ref={ref => {
                                    this.code_field = ref
                                }}
                                onSubmitEditing={this.state.is_user_exists ? this.submit_login : this.submit_register}
                            />
                            <Button
                                onPress={this.state.is_user_exists ? this.submit_login : this.submit_register}
                                loading={this.state.is_submitting}
                                mode='contained'
                                style={{ marginTop: 12 }}
                                dark
                            >
                                {'OK'}
                            </Button>
                            <Button mode='text' style={{ marginTop: 32 }} onPress={this.goto_request_code}>
                                Another mobile
                            </Button>
                        </>
                    )}
                </View>
            </ScrollView>
        )
    }
}

export default observer(Login)
