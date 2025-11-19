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
            },{
                path: '/v/:pCategoryCode',
                name: 'categoryVideo',
                component: () => import('../views/categoryvideo/index.vue')
            },{
                path: '/v/:pCategoryCode/:categoryCode',
                name: 'subCategoryVideo',
                component: () => import('../views/categoryvideo/index.vue')
            },{
                path: '/video/:videoId',
                name: 'videoDetail',
                component: () => import('../views/videodetail/index.vue')
            },
        ]
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router