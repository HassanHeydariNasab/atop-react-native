import React from 'react'
import { Text } from "react-native";
import { __ } from '../utils'

const ErrorText = ({ keys, errors }) => (
    // user__name -> {user: {name: ['some nested errors']}}
    // fullname -> {fullname: ['some plain errors']}
    <>
        {Array.isArray(errors) && keys === 'non_field_errors' ? (
            <Text style={{ marginTop: 8, marginBottom: 16, color: '#D84315' }}>{__(errors)}</Text>
        ) : keys.split('__').length === 1 && errors[keys] ? (
            <Text style={{ marginTop: 8, marginBottom: 16, color: '#D84315' }}>{__(errors[keys])}</Text>
        ) : keys.split('__').length === 2 &&
          errors[keys.split('__')[0]] &&
          errors[keys.split('__')[0]][keys.split('__')[1]] ? (
            <Text style={{ marginTop: 8, marginBottom: 16, color: '#D84315' }}>
                {__(errors[keys.split('__')[0]][keys.split('__')[1]])}
            </Text>
        ) : null}
    </>
)
export default ErrorText
