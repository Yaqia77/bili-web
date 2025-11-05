<template>
  <div>
    <DataLoadMoreList :dataSource="dataSource" @loadData="loadDataList" :loading="loadingData">
      <template #default="{ data }">
        <VideoItem :data="data"></VideoItem>
      </template>
    </DataLoadMoreList>
  </div>
</template>
<script  setup>
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();

const dataSource = ref({});
const loadingData = ref(false);

const loadDataList = async() => {
    let params = {
        pageNo:dataSource.value.pageNo
    }
    loadingData.value = true;
    let res = await proxy.request({
        url: proxy.api.loadVideo,
        params
    });
    loadingData.value = false;
    if(!res){
        return
    }
    const dataList = dataSource.value.list
    dataSource.value = Object.assign({},res.data)
    if(res.data.pageNo>1){
        dataSource.value.list = dataList.concat(res.data.list)
    }
};
loadDataList();
</script>
<style lang="scss" scoped>
</style>