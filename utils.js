import React from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import RNRestart from 'react-native-restart'
import eql from 'deep-eql'

export const farsify = digits => {
    if (typeof digits === 'string' || typeof digits === 'number') {
        return digits
            .toString()
            .replace(/1/g, '۱')
            .replace(/2/g, '۲')
            .replace(/3/g, '۳')
            .replace(/4/g, '۴')
            .replace(/5/g, '۵')
            .replace(/6/g, '۶')
            .replace(/7/g, '۷')
            .replace(/8/g, '۸')
            .replace(/9/g, '۹')
            .replace(/0/g, '۰')
    } else {
        return ''
    }
}

export const englishize = digits => {
    if (typeof digits === 'string' || typeof digits === 'number') {
        return digits
            .toString()
            .replace(/۱/g, '1')
            .replace(/۲/g, '2')
            .replace(/۳/g, '3')
            .replace(/۴/g, '4')
            .replace(/٤/g, '4')
            .replace(/۵/g, '5')
            .replace(/٥/g, '5')
            .replace(/۶/g, '6')
            .replace(/٦/g, '6')
            .replace(/۷/g, '7')
            .replace(/۸/g, '8')
            .replace(/۹/g, '9')
            .replace(/۰/g, '0')
    } else {
        return ''
    }
}

export const mil = digits => {
    if (digits) {
        var rx = /(\d+)(\d{3})/
        return String(digits).replace(/^\d+/, function(w) {
            while (rx.test(w)) {
                w = w.replace(rx, '$1٬$2')
            }
            return w
        })
    } else {
        return digits
    }
}

export function farsi_date_ago(number, index) {
    return [
        ['همین الآن', 'لحظاتی پیش'],
        ['%s ثانیه پیش', 'حدود %s ثانیه پیش'],
        ['1 دقیقه پیش', 'حدود 1 دقیقه پیش'],
        ['%s دقیقه پیش', 'حدود %s دقیقه پیش'],
        ['1 ساعت پیش', 'حدود 1 ساعت پیش'],
        ['%s ساعت پیش', 'حدود %s ساعت پیش'],
        ['1 روز پیش', 'حدود 1 روز پیش'],
        ['%s روز پیش', 'حدود %s روز پیش'],
        ['1 هفته پیش', 'حدود 1 هفته پیش'],
        ['%s هفته پیش', 'حدود %s هفته پیش'],
        ['1 ماه پیش', 'حدود 1 ماه پیش'],
        ['%s ماه پیش', 'حدود %s ماه پیش'],
        ['1 سال پیش', 'حدود 1 سال پیش'],
        ['%s سال پیش', 'حدود %s سال پیش']
    ][index]
}

export function parseJSON(response) {
    const statusCode = response.status
    const json = response.json()
    return Promise.all([statusCode, json])
}

export function normalized_mobile(mobile) {
    if (mobile[0] === '0') {
        mobile = mobile.slice(1)
    }
    return mobile
}

export function comparator_array_of_objects(l, r) {
    var is_equal = true
    if (!eql(l, r)) {
        is_equal = false
    } else {
        for (let i in l) {
            if (!eql(l[i], r[i])) {
                is_equal = false
                break
            }
        }
    }
    return is_equal
}

export function logout() {
    AsyncStorage.clear(error => {
        if (!error) {
            RNRestart.Restart()
        }
    })
}

export const month_index_to_name = {
    '1': 'فروردین',
    '2': 'اردیبهشت',
    '3': 'خرداد',
    '4': 'تیر',
    '5': 'مرداد',
    '6': 'شهریور',
    '7': 'مهر',
    '8': 'آبان',
    '9': 'آذر',
    '10': 'دی',
    '11': 'بهمن',
    '12': 'اسفند'
}

export function normalized_url(url) {
    if (url.slice(0, 4) !== 'http' && url.length) {
        return 'http://' + url
    }
    return url
}

export function __(list, separator = '. ') {
    // for (let member in list) {
    //     list[member] = _(list[member])
    // }
    if (Array.isArray(list)) {
        return list.join(separator)
    } else {
        return list
    }
}

export function parsed_errors(keys, errors) {
    // user__name -> {user: {name: ['some nested errors']}}
    // fullname -> {fullname: ['some plain errors']}
    return Array.isArray(errors) && keys === 'non_field_errors'
        ? __(errors)
        : keys.split('__').length === 1 && errors[keys]
        ? __(errors[keys])
        : keys.split('__').length === 2 &&
          errors[keys.split('__')[0]] &&
          errors[keys.split('__')[0]][keys.split('__')[1]]
        ? __(errors[keys.split('__')[0]][keys.split('__')[1]])
        : null
}


export function on_connection_error() {
    Alert.alert(
        'Connection Error',
        `A server error occurred.`,
        [
            {
                text: 'Ignore'
            },
            {
                text: 'Restart App',
                onPress: RNRestart.Restart
            }
        ],
        { cancelable: false }
    )
}

export function on_error(error) {
    Alert.alert(
        'Error',
        error.message || JSON.stringify(error),
        [
            {
                text: 'OK'
            },
        ],
        { cancelable: true }
    )
}
