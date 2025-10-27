<template>
  <router-view></router-view>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
 let categoryList = [];
 let categoryMap ={}


 const loadCategory = async() =>{
  let result = await request({
    url:api.loadAllCategory,
  })
  if(!result){
    return;
  }
  categoryList = result.data || []
  result.data.forEach(item => {
    categoryMap[item.categoryCode] = item
    item.children.forEach(child => {
      categoryMap[child.categoryCode] = child
    })
  })
  categoryStore.saveCategoryMap(categoryMap)
  categoryStore.saveCategoryList(categoryList)
 }
//  onMounted(() => {
//   useCategoryStore().saveCategoryMap(categoryMap)
//   useCategoryStore().saveCategoryList(categoryList)
//  })
</script>

<style scoped>

</style>
