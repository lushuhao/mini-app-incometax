/**
 * 代理微信默认方法
 */
import {fetch} from './api'
import {routers, navigateTo} from './router'

// 封装默认的request
wx.fetch = fetch

wx.routers = routers

wx.safeNavigateTo = navigateTo
