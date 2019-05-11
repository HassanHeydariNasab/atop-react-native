import { observable } from 'mobx'

export const states = observable({
    is_visible: false,
    message: '',
    actoin: {label: 'بستن', onPress: () => {}}
})
