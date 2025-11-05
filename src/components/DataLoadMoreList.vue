<template>
  <div
    :class="[layoutType == 'grid' ? 'data-list-grid' : '']"
    :style="{ 'grid-template-columns': `repeat(${gridCount},1fr)` }"
  >
    <template v-for="item in dataSource.list">
      <slot :data="item"> </slot>
    </template>
  </div>
  <div class="bottom-loading" v-if="loading">
    <img :src="getLocalImage('playing.gif')" />数据加载中....
  </div>
  <div
    class="reach-bottom"
    v-if="
      dataSource.pageNo >= dataSource.totalPage &&
      !loading &&
      dataSource.list.length > 0
    "
  >
    {{ loadEndMsg }}
  </div>

  <NaData
    :msg="loadEndMsg"
  ></NaData>
</template>
<script  setup>
import { getLocalImage } from "@/utils/utils.js";
import { onMounted, onUnmounted } from "vue";
import { eventBus } from "@/eventbus/eventBus.js";

const emit = defineEmits(["loadData"]);
const srollHandler = (curScrollTop) =>{
  if(window.innerHeight + curScrollTop < document.body.scrollHeight){
    return;
  }
  if(props.loading || props.dataSource.pageNo >= props.dataSource.pageTotal){
    return;
  }
  // 触发加载更多数据事件
  props.dataSource.pageNo++;
  emit("loadData");
}

onMounted(() => {
  eventBus.on("scroll", (curScrollTop) => {
    srollHandler(curScrollTop);
  });
});

onUnmounted(() => {
  eventBus.off("scroll");
});

const props = defineProps({
  dataSource: {
    type: Object,
    default: {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadEndMsg: {
    type: String,
    default: "没有更多了",
  },
  // 布局类型，可选值为 grid 
  layoutType: {
    type: String,
    default: "grid",
  },
  // 网格布局下，每行视频项的数量
  gridCount: {
    type: Number,
    default: 5,
  },
});

</script>
<style lang="scss" scoped>
.data-list-grid {
  display: grid;
  gap: 20px;
  padding-bottom: 10px;
}
.reach-bottom {
  text-align: center;
  line-height: 40px;
  color: var(--text3);
}
.bottom-loading {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text3);
  img {
    width: 20px;
    margin-right: 10px;
  }
}
</style>