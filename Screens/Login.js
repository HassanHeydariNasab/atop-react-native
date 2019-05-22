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
import ErrorText from '../Components/ErrorText'
import { states as user_state } from '../Stores/User'
import { states as snackbar_state } from '../Stores/Snackbar'
import { states as settings_state } from '../Stores/Settings'
import { HOST } from '../config'
import { parseJSON, normalized_mobile, on_connection_error, on_error } from '../utils'
import { theme } from '../index'

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
        is_user_exists: false,
        errors_request_code: {},
        errors_register: {},
        errors_login: {}
    }

    componentWillMount() {
        loc(this)
    }

    componentDidMount() {
        settings_state.host = HOST
        AsyncStorage.setItem('host', HOST)
    }

    componentWillUnmount() {
        rol()
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
        const { country_code, mobile } = this.state
        this.setState({ is_submitting: true, errors_request_code: {} })
        fetch(`${settings_state.host}/v1/request_code`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: country_code + normalized_mobile(mobile)
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_submitting: false })
                if (status === 201) {
                    this.setState({ is_request_code_passed: true, is_user_exists: j.is_user_exists })
                } else if (status === 400) {
                    this.setState({ errors_request_code: j.errors })
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
        const { country_code, mobile, code, name } = this.state
        this.setState({ is_submitting: true, errors_register: {} })
        fetch(`${settings_state.host}/v1/register`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: country_code + normalized_mobile(mobile),
                code,
                name
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_submitting: false })
                if (status === 201) {
                    user_state.token = j.token
                    this.fetch_me()
                    AsyncStorage.setItem('token', j.token, () => {
                        snackbar_state.message = 'You have been registered and logged in.'
                        snackbar_state.is_visible = true
                        this.props.navigation.navigate('Main')
                    })
                } else if (status === 400) {
                    this.setState({ errors_register: j.errors })
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
        const { country_code, mobile, code } = this.state
        this.setState({ is_submitting: true, errors_login: {} })
        fetch(`${settings_state.host}/v1/login`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: country_code + normalized_mobile(mobile),
                code
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                console.warn(status, j)
                this.setState({ is_submitting: false })
                if (status === 200) {
                    user_state.token = j.token
                    this.fetch_me()
                    AsyncStorage.setItem('token', j.token, () => {
                        snackbar_state.message = 'You are logged in.'
                        snackbar_state.is_visible = true
                        this.props.navigation.navigate('Main')
                    })
                } else if (status === 400) {
                    this.setState({ errors_login: j.errors })
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
        fetch(`${settings_state.host}/v1/users/me`, {
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
        const {
            mobile,
            code,
            name,
            country_code,
            is_request_code_passed,
            is_submitting,
            is_user_exists,
            errors_request_code,
            errors_register,
            errors_login
        } = this.state
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
                    {!is_request_code_passed ? (
                        <>
                            <View style={{ flexDirection: 'column' }}>
                                <TextInput
                                    placeholder='country code'
                                    keyboardType='numeric'
                                    value={country_code}
                                    onChangeText={_country_code => this.setState({ country_code: _country_code })}
                                    returnKeyType='next'
                                    ref={ref => {
                                        this.country_code_field = ref
                                    }}
                                    onSubmitEditing={this.mobile_field_focus}
                                />
                                <TextInput
                                    placeholder='mobile'
                                    keyboardType='numeric'
                                    value={mobile}
                                    onChangeText={_mobile => this.setState({ mobile: _mobile })}
                                    returnKeyType='go'
                                    ref={ref => {
                                        this.mobile_field = ref
                                    }}
                                    onSubmitEditing={this.submit_request_code}
                                    style={{ marginTop: 12 }}
                                    error={errors_request_code.mobile}
                                />
                                <ErrorText errors={errors_request_code} keys='mobile' />
                            </View>
                            <Button
                                onPress={this.submit_request_code}
                                loading={is_submitting}
                                mode='contained'
                                style={{ marginTop: 12 }}
                                dark
                            >
                                {'Login / Register'}
                            </Button>
                            <TextInput
                                label='Server URL'
                                placeholder={`for example: ${HOST}`}
                                value={settings_state.host}
                                onChangeText={_host => {
                                    settings_state.host = _host
                                    AsyncStorage.setItem('host', _host)
                                }}
                                style={{ marginTop: 60 }}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={{ marginBottom: 16 }}>
                                {`The validation code was sent to ${country_code + normalized_mobile(mobile)}`}
                            </Text>
                            {!is_user_exists ? (
                                <>
                                    <TextInput
                                        placeholder='name'
                                        keyboardType='default'
                                        value={name}
                                        onChangeText={name => this.setState({ name })}
                                        returnKeyType='next'
                                        ref={ref => {
                                            this.name_field = ref
                                        }}
                                        onSubmitEditing={this.code_field_focus}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <ErrorText errors={errors_register} keys='name' />
                                </>
                            ) : null}
                            <TextInput
                                placeholder='code'
                                keyboardType='numeric'
                                value={code}
                                onChangeText={_code => this.setState({ code: _code })}
                                returnKeyType='go'
                                ref={ref => {
                                    this.code_field = ref
                                }}
                                onSubmitEditing={is_user_exists ? this.submit_login : this.submit_register}
                            />
                            <ErrorText errors={errors_register} keys='code' />
                            <ErrorText errors={errors_login} keys='code' />
                            <Button
                                onPress={is_user_exists ? this.submit_login : this.submit_register}
                                loading={is_submitting}
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
