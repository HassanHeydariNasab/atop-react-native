import { LOCAL_HOST, PRODUCTION_HOST, DEBUG } from './local_config'

export const HOST = DEBUG ? LOCAL_HOST : PRODUCTION_HOST
