<template>
  <div>
    <DataLoadMoreList :dataSource="dataSource" @loadData="loadDataList" :loading="loadingData">
      <template #default="{ data }">
        <VideoItem :data="data"></VideoItem>
      </template>
    </DataLoadMoreList>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, watch } from "vue";
import { useRoute } from "vue-router";
import { useCategoryStore } from "../../stores/categoryStore";
const { proxy } = getCurrentInstance();
const categoryStore = useCategoryStore();
const route = useRoute();

const dataSource = ref({ pageNo: 1, list: [] });
const loadingData = ref(false);
const categoryIdInfo = ref({ pCategoryId: "", categoryId: "" });
// 新增：防止initData重复执行的锁
const isInitLoading = ref(false);

// 不再缓存 categoryMap，运行时取最新值
const converCode2Id = (pCategoryCode, categoryCode) => {
  const map = categoryStore.categoryMap || {};
  const pCategoryId = pCategoryCode ? (map[String(pCategoryCode)]?.categoryId ?? "") : "";
  const categoryId = categoryCode ? (map[String(categoryCode)]?.categoryId ?? "") : "";
  categoryIdInfo.value = { pCategoryId, categoryId };
}

const loadDataList = async () => {
  // 避免加载中重复请求
  if (loadingData.value) return;
  const params = {
    pageNo: dataSource.value.pageNo ?? 1,
    ...categoryIdInfo.value
  }
  loadingData.value = true;
  try {
    const res = await proxy.request({
      url: proxy.api.loadVideo,
      params
    });
    if (!res) return;
    const prevList = dataSource.value.list || [];
    dataSource.value = { ...res.data };
    if ((res.data.pageNo ?? 1) > 1) {
      dataSource.value.list = prevList.concat(res.data.list || []);
    }
  } finally {
    loadingData.value = false;
  }
};

const initData = async () => {
  // 防重复：正在初始化时直接返回
  if (isInitLoading.value) return;
  isInitLoading.value = true;
  try {
    dataSource.value = { pageNo: 1, list: [] };
    converCode2Id(route.params.pCategoryCode, route.params.categoryCode);
    await loadDataList();
  } finally {
    isInitLoading.value = false;
  }
};

// 合并监听：同时监听categoryMap和路由参数（包含pCategoryCode+categoryCode）
watch(
  () => [
    categoryStore.categoryMap,
    String(route.params.pCategoryCode ?? ''),
    String(route.params.categoryCode ?? '')
  ],
  ([newCategoryMap, pCategoryCode, categoryCode]) => {
    // 条件：categoryMap已加载 + 至少有一个分类参数
    if (
      newCategoryMap && 
      Object.keys(newCategoryMap).length > 0 && 
      (pCategoryCode || categoryCode)
    ) {
      // 设置当前父分类（适配原逻辑）
      if (pCategoryCode) {
        categoryStore.setcurrentPCategory(pCategoryCode);
      }
      // 执行初始化（带防重复锁）
      initData();
    }
  },
  { immediate: true, deep: true }
);
</script>
<style lang="scss" scoped></style>