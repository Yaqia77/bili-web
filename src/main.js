import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/scss/base.scss'
import App from './App.vue'
import router from './router/index'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import VueCookies from 'vue-cookies'
const app = createApp(App)
app.use(router)
app.use(createPinia())

app.use(ElementPlus)
app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.bodyMaxWidth = 2000
app.config.globalProperties.bodyMinWidth = 1250

app.mount('#app')
