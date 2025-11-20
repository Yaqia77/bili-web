<template>
    <div>
        <div class="category-video-body">
            <div :class="['category-list', categoryFixed ? 'category-fixed' : '']" id="category-list">
                <div class="category-title">
                    {{ categoryStore.currentPCategory?.categoryName || '' }}
                </div>
                <div :class="['category-item', isActive('') ? 'active' : '']" @click="jump('')">
                    首页
                </div>

                <div v-for="item in (categoryStore.currentPCategory?.children || [])" :key="item.categoryCode"
                    :class="['category-item', isActive(item.categoryCode) ? 'active' : '']"
                    @click="jump(item.categoryCode)">
                    {{ item.categoryName }}
                </div>
            </div>
        </div>
        <VideoList />
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import VideoList from '@/views/videolist/index.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useNavActionStore } from '@/stores/navActionStore'
import { useRoute, useRouter } from 'vue-router'
import { eventBus } from "@/eventbus/eventBus.js";
const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const navActionStore = useNavActionStore()

const categoryFixed = ref(false)
const categoryTopDistance = ref(200)
let initScrollTop = 0
let scrollDown = true

const jump = (categoryCode = '') => {
    const name = route.name ? String(route.name) : '' 
    const params = { ...route.params, categoryCode: categoryCode ? String(categoryCode) : '' }
    if (name) {
        router.push({ name, params }).catch(()=>{})
    }
}

const isActive = (code = '') => {
    const current = String(route.params.categoryCode ?? '')
    return current === String(code ?? '')
}

const scrollHandler = (curScrollTop) => {
    categoryFixed.value = true
    if (curScrollTop - initScrollTop > 0) scrollDown = true
    else scrollDown = false
    initScrollTop = curScrollTop
    if (curScrollTop >= categoryTopDistance.value) {
        if (scrollDown) navActionStore.setFixedHeader(false)
        else navActionStore.setFixedHeader(true)
    } else {
        categoryFixed.value = false
        navActionStore.setFixedHeader(false)
    }
}

onMounted(() => {
    const el = document.getElementById('category-list')
    categoryTopDistance.value = el ? el.getBoundingClientRect().top : 200
    navActionStore.setShowHeader(true)
    navActionStore.setFixedHeader(false)
    navActionStore.setFixedCategory(false)
    navActionStore.setShowCategory(true)
    // 关键：首次进入时同步父分类
    categoryStore.setcurrentPCategory(String(route.params.pCategoryCode ?? ''))
    eventBus.on('windowScroll', (curScrollTop) => {
        scrollHandler(curScrollTop)
    })
})
onUnmounted(() => {
    eventBus.off('windowScroll')
})
// 关键：路由变化时同步父分类
watch(
    () => String(route.params.pCategoryCode ?? ''),
    (val) => {
        categoryStore.setcurrentPCategory(String(val ?? ''))
    }
)
</script>

<style lang="scss" scoped>
.category-video-body {
    margin-top: 30px;

    .category-list {
        display: flex;
        align-items: center;
        line-height: 30px;
        position: sticky;
        top: 0px;
        height: 60px;
        background: #fff;
        z-index: 2;

        .category-title {
            font-size: 24px;
            margin-right: 40px;
            cursor: pointer;
            color: #000;
        }

        .category-item {
            margin-right: 40px;
            font-size: 15px;
            cursor: pointer;
            /* 初始下划线透明，选中时变色显示 */
            border-bottom: 3px solid transparent;
            color: #000;

            &:hover {
                color: var(--blue);
                border-bottom-color: var(--blue);
            }
        }

        .active {
            color: var(--blue);
            border-bottom-color: var(--blue);
        }
    }

    /* 修正类名为 category-fixed */
    .category-fixed {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
}
</style>