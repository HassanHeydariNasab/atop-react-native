import React, { Component } from 'react'
import { View, Image, FlatList, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Button, Text, TextInput, Title, Surface, IconButton } from 'react-native-paper'
import {
    widthPercentageToDP as w,
    heightPercentageToDP as h,
    listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react'
import ErrorText from '../Components/ErrorText'
import { states as user_state } from '../Stores/User'
import { states as snackbar_state } from '../Stores/Snackbar'
import { HOST } from '../config'
import { parseJSON, normalized_phone_number, on_connection_error, on_error } from '../utils'
import { theme } from '../index'

const vmin = percentage => {
    if (h('100%') > w('100%')) {
        return w(`${percentage}%`)
    }
    return h(`${percentage}%`)
}

const LIMIT = 12

const PostCard = ({ post, onPress_like, is_sending_like }) => (
    <Surface
        style={{
            width: '100%',
            marginTop: 18,
            borderRadius: 0,
            elevation: 2,
            backgroundColor: '#fff'
        }}
    >
        <Text style={{ fontFamily: theme.fonts.medium, textAlign: 'auto', margin: 12, textAlign: 'center' }}>
            {post.user.name}
        </Text>
        <Text style={{ fontFamily: theme.fonts.regular, textAlign: 'auto', margin: 12 }}>{post.text}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {is_sending_like ? (
                <ActivityIndicator
                    color={theme.colors.text}
                    size='large'
                    style={{ alignSelf: 'flex-start', marginRight: 12, marginTop: 12 }}
                />
            ) : (
                <IconButton icon='thumb-up' onPress={onPress_like} />
            )}
            <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.placeholder }}>{post.liked}</Text>
        </View>
    </Surface>
)

class Posts extends Component {
    static navigationOptions = () => {
        return {
            tabBarIcon: ({ focused, horizontal, tintColor }) => (
                <Icon name='card-text-outline' size={18} color={tintColor} />
            )
        }
    }

    state = {
        posts: null,
        offset: 0,
        has_next: true,
        is_fetching_posts: false,
        is_refreshing_posts: false
    }

    componentWillMount() {
        loc(this)
    }

    componentDidMount() {
        this.fetch_posts()
    }

    componentWillUnmount() {
        rol()
    }

    onChangeText_text = text => {
        this.setState({ text })
    }

    fetch_posts = () => {
        const { posts, offset } = this.state
        this.setState({ is_fetching_posts: true })
        fetch(`${HOST}/v1/posts?offset=${offset}&limit=${LIMIT}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            }
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ is_fetching_posts: false, is_refreshing_posts: false })
                if (status === 200) {
                    const has_next = Array.isArray(j.posts) && j.posts.length > 0
                    if (Array.isArray(posts)) {
                        this.setState({ posts: [...posts, ...j.posts], offset: offset + LIMIT, has_next })
                    } else {
                        this.setState({ posts: j.posts, offset: offset + LIMIT, has_next })
                    }
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

    like_post = post_id => {
        this.setState({ [`is_sending_like_${post_id}`]: true })
        fetch(`${HOST}/v1/posts/${post_id}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: user_state.token
            },
            body: JSON.stringify({ liked: true })
        })
            .then(parseJSON)
            .then(([status, j]) => {
                this.setState({ [`is_sending_like_${post_id}`]: false })
                if (status === 200) {
                    for (const i in this.state.posts) {
                        if (this.state.posts[i]._id === j.post._id) {
                            const posts = [...this.state.posts]
                            posts[i] = j.post
                            this.setState({ posts })
                            break
                        }
                    }
                    user_state.user.remaining_likes -= 1
                } else {
                    console.warn(status, j)
                    on_error(j)
                }
            })
            .catch(error => {
                this.setState({ [`is_sending_like_${post_id}`]: false })
                console.warn(error)
                on_connection_error()
            })
    }

    onRefresh_posts = () => {
        this.setState({ is_refreshing_posts: true, has_next: true, posts: null, offset: 0 }, () => {
            this.fetch_posts()
        })
    }

    onEndReached_posts = () => {
        const { has_next } = this.state
        if (has_next) {
            this.fetch_posts()
        }
    }

    render_empty_posts = () => {
        return (
            <Text
                style={{
                    height: h('80%'),
                    width: '100%',
                    textAlignVertical: 'center',
                    textAlign: 'center',
                    padding: 20,
                    color: theme.colors.placeholder
                }}
            >
                {`Not Found :(`}
            </Text>
        )
    }

    renderItem_post = ({ item, index }) => (
        <PostCard
            post={item}
            onPress_like={() => {
                this.like_post(item._id)
            }}
            is_sending_like={this.state[`is_sending_like_${item._id}`]}
        />
    )

    keyExtractor_post = (item, index) => item._id.toString()

    render() {
        const { posts, is_fetching_posts, is_refreshing_posts } = this.state
        return (
            <FlatList
                data={posts}
                renderItem={this.renderItem_post}
                keyExtractor={this.keyExtractor_post}
                ListFooterComponent={
                    is_fetching_posts ? (
                        <ActivityIndicator color={theme.colors.primary} size='large' style={{ marginTop: 18 }} />
                    ) : (
                        <View style={{ height: 18 }} />
                    )
                }
                ListEmptyComponent={Array.isArray(posts) && posts.length === 0 ? this.render_empty_posts : null}
                onRefresh={this.onRefresh_posts}
                refreshing={is_refreshing_posts}
                onEndReached={this.onEndReached_posts}
                style={{ backgroundColor: '#f5f5f5' }}
            />
        )
    }
}

export default observer(Posts)
