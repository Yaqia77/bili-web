import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    {
        path:'/',
        name:'layout',
        component:()=>import('../views/layout.vue')
    },
]


const router = createRouter({
    history:createWebHistory(),
    routes
})

export default router