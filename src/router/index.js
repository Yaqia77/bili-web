import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    {
        path: '/',
        name: 'layout',
        component: () => import('../views/layout.vue'),
        children: [
            {
                path: '/',
                name: 'index',
                component: () => import('../views/index/index.vue')
            },
        ]
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router