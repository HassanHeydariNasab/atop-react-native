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
import ErrorText from '../Components/ErrorText'

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    }
    return h(`${percentage}%`)
}

class CreatePost extends Component {
    static navigationOptions = () => {
        return {
            tabBarIcon: ({ focused, horizontal, tintColor }) => (
                <Icon name='pencil-outline' size={18} color={tintColor} />
            ),
            title: 'Write'
        }
    }

    state = { text: '', errors_create_post: {} }

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

    onChangeText_text = text => {
        this.setState({ text })
    }

    create_post = () => {
        const { text } = this.state
        this.setState({ is_submitting: true, errors_create_post: {} })
        fetch(`${settings_state.host}/v1/posts`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            },
            body: JSON.stringify({
                text
            })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_submitting: false })
                if (status === 201) {
                    snackbar_state.message = 'Your post was sent.'
                    snackbar_state.is_visible = true
                    this.setState({ text: '' })
                } else if (status === 400) {
                    this.setState({ errors_create_post: j.errors })
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

    render() {
        const { text, errors_create_post } = this.state
        return (
            <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
                <View style={{ height: '100%', paddingHorizontal: w('10%'), paddingBottom: h('10%') }}>
                    <TextInput
                        placeholder='Write something interesting...'
                        value={text}
                        onChangeText={this.onChangeText_text}
                        mode='outlined'
                        multiline
                        numberOfLines={10}
                        style={{ marginTop: 30 }}
                    />
                    <ErrorText errors={errors_create_post} keys='text' />
                    <Button mode='contained' style={{ marginTop: 12 }} onPress={this.create_post}>
                        send
                    </Button>
                </View>
            </ScrollView>
        )
    }
}

export default observer(CreatePost)
