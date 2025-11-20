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
import { ref, getCurrentInstance, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useCategoryStore } from "../../stores/categoryStore";
const { proxy } = getCurrentInstance();
const categoryStore = useCategoryStore();
const route = useRoute();

const dataSource = ref({ pageNo: 1, list: [], total: 0 });
const loadingData = ref(false);
const categoryIdInfo = ref({ pCategoryId: "", categoryId: "" });

const converCode2Id = (pCategoryCode, categoryCode) => {
  const map = categoryStore.categoryMap || {};
  const pCategoryId = pCategoryCode ? (map[String(pCategoryCode)]?.categoryId ?? "") : "";
  const categoryId = categoryCode ? (map[String(categoryCode)]?.categoryId ?? "") : "";
  categoryIdInfo.value = { pCategoryId, categoryId };
}

const loadDataList = async (reset = false) => {
  if (loadingData.value) return;
  if (reset) dataSource.value = { pageNo: 1, list: [], total: 0 };
  const params = {
    pageNo: dataSource.value.pageNo ?? 1,
    ...categoryIdInfo.value
  }
  loadingData.value = true;
  const res = await proxy.request({
    url: proxy.api.loadVideo,
    params
  });
  loadingData.value = false;
  if (!res) return;
  if (params.pageNo === 1) {
    dataSource.value = Object.assign({}, res.data);
  } else {
    dataSource.value.list = (dataSource.value.list || []).concat(res.data.list || []);
    dataSource.value.pageNo = res.data.pageNo;
    dataSource.value.total = res.data.total;
  }
};

const initData = async () => {
  converCode2Id(route.params.pCategoryCode, route.params.categoryCode);
  await nextTick();
  loadDataList(true);
};

// 只在 categoryMap 就绪后和 params 变化时拉取
watch(
  [() => categoryStore.categoryMap, () => String(route.params.pCategoryCode ?? ''), () => String(route.params.categoryCode ?? '')],
  ([map, pCode, code], [oldMap, oldP, oldC]) => {
    if (!map || Object.keys(map).length === 0) return;
    initData();
  },
  { immediate: true }
);

// 下拉加载更多
const loadMore = async () => {
  if (loadingData.value) return;
  if (dataSource.value.list.length >= dataSource.value.total) return;
  dataSource.value.pageNo += 1;
  await loadDataList();
};
</script>
<style lang="scss" scoped></style>