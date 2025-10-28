<template>
  <div class="category" v-show="showType === 0">
    <div class="quick">
      <div class="quick-item dynamic">
        <div class="iconfont icon-dongtai"></div>
        <div class="info">动态</div>
      </div>
      <router-link class="quick-item hot" to="/hot" target="_blank">
        <div class="iconfont icon-bianpinghuatubiaosheji-"></div>
        <div class="info">热门</div>
      </router-link>
    </div>

    <div
      class="category-list"
      :style="{
        'grid-template-columns': `repeat(${proxy.rowCategoryCount}, 1fr)`,
      }"
    >
      <template v-for="index in showItemCount" :key="index">
        <template v-if="categoryStore.categoryList[index - 1]">
          <!-- 有子分类：使用气泡展示子分类 -->
          <el-popover
            :width="187"
            trigger="hover"
            :show-arrow="false"
            :offset="5"
            :placement="index <= proxy.rowCategoryCount ? 'top' : 'bottom'"
            v-if="
              categoryStore.categoryList[index - 1].children &&
              categoryStore.categoryList[index - 1].children.length > 0
            "
          >
            <template #reference>
              <router-link
                :class="[
                  'category-item',
                  categoryStore.categoryList[index - 1].categoryCode ==
                  route.params.pCategoryCode
                    ? 'active'
                    : '',
                ]"
                :to="`/v/${categoryStore.categoryList[index - 1].categoryCode}`"
              >
                {{ categoryStore.categoryList[index - 1].categoryName }}
              </router-link>
            </template>
            <template #default>
              <div class="child-list">
                <router-link
                  v-for="child in categoryStore.categoryList[index - 1]
                    .children"
                  :key="child.categoryCode"
                  class="child"
                  :to="`/v/${child.categoryCode}`"
                >
                  {{ child.categoryName }}
                </router-link>
              </div>
            </template>
          </el-popover>
          <!-- 无子分类：直接渲染链接 -->
          <router-link
            v-else
            :class="[
              'category-item',
              categoryStore.categoryList[index - 1].categoryCode ==
              route.params.pCategoryCode
                ? 'active'
                : '',
            ]"
            :to="`/v/${categoryStore.categoryList[index - 1].categoryCode}`"
          >
            {{ categoryStore.categoryList[index - 1].categoryName }}
          </router-link>
        </template>
      </template>

      <!-- 更多按钮 -->
      <template
        v-if="categoryStore.categoryList.length > proxy.rowCategoryCount * 2"
      >
        <el-popover
          :width="187"
          trigger="hover"
          :show-arrow="false"
          :offset="5"
          placement="bottom"
        >
          <template #reference>
            <div class="category-item btn-category-more">
              更多
              <div class="iconfont icon-more"></div>
            </div>
          </template>
          <template #default>
            <div class="child-list">
              <router-link
                v-for="item in categoryStore.categoryList.slice(
                  proxy.rowCategoryCount * 2 - 1
                )"
                :key="item.categoryCode"
                class="child"
                :to="`/v/${item.categoryCode}`"
              >
                {{ item.categoryName }}
              </router-link>
            </div>
          </template>
        </el-popover>
      </template>
    </div>
    
  </div>
  <div
      :class="['category', mouseOver ? '' : 'category-out']"
      v-show="showType == 1"
    >
      <router-link class="hot hot-out" to="/hot" target="_blank">
        <div class="iconfont icon-bianpinghuatubiaosheji-"></div>
        <div class="info">热门</div>
      </router-link>
      <div
        class="category-list"
        :style="{
          'grid-template-columns': `repeat(${proxy.rowCategoryCount}, 1fr)`,
        }"
      >
        <template
          v-for="item in categoryStore.categoryList"
          :key="item.categoryCode"
        >
          <router-link class="category-item" :to="`/v/${item.categoryCode}`">{{
            item.categoryName
          }}</router-link>
        </template>
        <div
          :class="[
            'category-op iconfont',
            mouseOver ? 'icon-xiangyou' : 'icon-xiangyou-out',
          ]"
          v-show="categoryStore.categoryList.length > proxy.rowCategoryCount"
        ></div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { useCategoryStore } from "@/stores/categoryStore";
import { useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const categoryList = ref([]);
const route = useRoute();
const categoryStore = useCategoryStore();

const props = defineProps({
  showType: {
    type: Number,
    default: 0,
  },
  mouseOver: {
    type: Boolean,
    default: false,
  },
});
const showItemCount = computed(() => {
  let count = categoryStore.categoryList.length;
  if (categoryStore.categoryList.length > proxy.rowCategoryCount * 2) {
    count = proxy.rowCategoryCount * 2 - 1;
  }
  return count;
});

onMounted(async () => {
  const result = await proxy.request({
    url: proxy.api.loadAllCategory,
  });
  if (!result) return;
  const list = result.data || [];
  categoryList.value = list;

  // 同步到 Pinia，修复渲染使用的 categoryStore 为空的问题
  const categoryMap = {};
  list.forEach((item) => {
    categoryMap[item.categoryCode] = item;
    (item.children || []).forEach((child) => {
      categoryMap[child.categoryCode] = child;
    });
  });
  categoryStore.saveCategoryMap(categoryMap);
  categoryStore.saveCategoryList(list);
});
</script>

<style lang="scss" scoped>
.category {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  .quick {
    display: flex;
    align-items: flex-start;
    margin-left: 30px;
    gap: 20px;
    margin-right: 25px;

    .quick-item {
      text-align: center;
      text-decoration: none;
      color: #61666d;
      display: flex;
      flex-direction: column;
      align-items: center;

      .iconfont {
        width: 46px;
        height: 46px;
        background: #f07775;
        color: #fff;
        font-size: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .info {
        margin-top: 8px;
        font-size: 12px;
      }

      &.dynamic {
        .iconfont {
          background: #f8a540;
        }
        .info {
          color: #61666d;
        }
      }
      &.hot {
        .info {
          color: #61666d;
        }
      }
    }
  }
  .category-list {
    width: 70%;
    display: grid;
    gap: 8px;
    .category-item {
      font-size: 14px;
      line-height: 30px;
      padding: 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 2px;
      border: 1px solid #f6f7f8;
      border-radius: 6px;
      background: #f6f7f8;
      color: #61666d;
      text-align: center;
      font-weight: 400;
      text-decoration: none;
      &:hover {
        background: #e1e3e5;
      }
    }
    .active {
      color: var(--blue);
    }
    .btn-category-more {
      .iconfont {
        font-size: 10px;
        display: inline-block;
      }
      .icon-up {
        display: none;
      }
    }
    .category-more {
      margin-left: 5px;
    }
  }
  .category-op {
    float: right;
    margin-top: 7px;
    margin-left: 5px;
  }
  .hot-out {
    width: 80px;
    height: 30px;
    display: flex;
    align-items: center;
    .icon-font {
      width: 60px;
      font-size: 25px;
      height: auto;
      background: none;
      color: #61666d;
    }
    .info {
      margin-top: 0px;
      font-size: 15px;
      color: #61666d;
    }
  }
}
.category-out {
  overflow: hidden;
  height: 32px;
}

.child-list {
  display: flex;
  flex-wrap: wrap;
  .child {
    text-decoration: none;
    color: #61666d;
    padding: 5px;
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      background: #e1e3e5;
      border-radius: 3px;
    }
  }
}
</style>