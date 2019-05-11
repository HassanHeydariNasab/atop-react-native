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
import { HOST } from '../config'
import { parseJSON, normalized_phone_number, on_connection_error } from '../utils'

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    } else {
        return h(`${percentage}%`)
    }
}


class Top extends Component {
    static navigationOptions = () => {
        return {}
    }
    state = {
    }
    componentWillMount() {
        loc(this)
    }
    componentDidMount() {}
    componentWillUnmount() {
        rol()
    }

    onChange_input = event => {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        this.setState({
            [name]: value
        })
    }

    render() {
        return (
            <ScrollView style={{ backgroundColor: '#f00' }}>
                <View style={{ height: '100%', paddingHorizontal: w('10%'), paddingBottom: h('10%') }}>
                </View>
            </ScrollView>
        )
    }
}

export default observer(Top)
