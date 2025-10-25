import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/scss/base.scss'
import App from './App.vue'
import router from './router/index'
// 使用本地 iconfont 样式（优先），避免依赖 CDN 不可用
import '@/assets/icons/iconfont.css'
// 禁用虚拟 svg 注册导入（若需要 svg-sprite 可改为由插件自动注入或手动启用）
// import 'virtual:svg-icons-register'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueCookies from 'vue-cookies'
import Cover from '@/components/Cover.vue'
import Avatar from '@/components/Avatar.vue'
import Dialog from '@/components/Dialog.vue'
import Verify from '@/utils/verify.js'
import Request from './utils/request'
import Message from './utils/Message'
import {Api} from "@/utils/api"
import Utils from "@/utils/utils.js"

const app = createApp(App)
app.use(router)
app.use(createPinia())

app.use(ElementPlus)

app.component("Dialog",Dialog)
app.component("Cover",Cover)
app.component("Avatar",Avatar)

app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.bodyMaxWidth = 1920
app.config.globalProperties.bodyMinWidth = 1250

app.config.globalProperties.verify = Verify
app.config.globalProperties.request = Request
app.config.globalProperties.message = Message
app.config.globalProperties.api = Api
app.config.globalProperties.utils = Utils
app.config.globalProperties.imageThumbnailSuffix = "_thumbnail.jpg"

app.mount('#app')

// plugins: [ vue(), createSvgIconsPlugin({
//   iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
//   symbolId: 'icon-[name]'
// }) ]
