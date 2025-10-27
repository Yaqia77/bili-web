<template>
  <div
    class="image-panel"
    ref="coverRef"
    :style="{
      'border-radius': borderRadius,
      width: width ? width + 'px' : '100%',
      height: width ? width * scale + 'px' : '100%',
    }"
  >
    <el-image
      :lazy="lazy"
      :src="fileSource || fileImage"
      :fit="fit"
      v-if="fileSource || fileImage"
      @click="showViewerHandler"
    >
      <template #placeholder>
        <div
          class="loading"
          :style="{
            height: loadingHeight + 'px',
          }"
        >
          <img :src="proxy.utils.getLocalImage('playing.gif')" alt="" />
        </div>
      </template>
    </el-image>
    <div v-else class="no-image">
        登录
    </div>
    <el-image-viewer
      v-if="showViewer"
      :high-resolution="true"
      @close="
        () => {
          showViewer = false;
        }
      "
      :url-list="imageList"
      :teleported="true"
    />
  </div>
</template>
<script setup>
import { ref, computed, getCurrentInstance,onMounted } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  source: {
    type: [String, File],
  },
  width: {
    type: Number,
  },
  fit: {
    type: String,
    default: "scale-down",
  },
  preview: {
    type: Boolean,
    default: false,
  },
  defaultImage: {
    type: String,
  },
  img404: {
    type: String,
    default: "404.png",
  },
  borderRadius: {
    type: String,
    default: "5px",
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  scale: {
    type: Number,
    default: 0.6,
  },
});

const fileImage = ref();
const fileSource = computed(() => {
    if(!props.source && !props.defaultImage){
        fileImage.value = null
        return null
    }
    if(!props.source && !props.defaultImage){
        return proxy.utils.getLocalImage(props.defaultImage)
    }
    if(props.source instanceof File){
        let img = new FileReader()
        img.readAsDataURL(props.source)
        img.onload = ({
            target
        })=>{
            fileImage.value = target.result
        }
        return
    }else if(typeof props.source === 'string'){
        return `${props.api.sourcePath}${props.source}`
    }else{
        return
    }
})

const imageList = computed(() => {
    if(!props.preview){
        return []
    }
    const sourceImg = props.api.sourcePath + props.source.replace(props.imageThumbnailSuffix, "")
    return [sourceImg]
})

const showViewer = ref(false)
const showViewerHandler = () => {
    if(!props.preview){
        return
    }
    showViewer.value = true
}
const coverRef = ref(null)
const loadingHeight = ref(0)
onMounted(() => {
    // 图片加载完成后，设置 loading 高度
    loadingHeight.value = coverRef.value.clientHeight * props.scale
})



</script>
<style lang="scss" scoped>
.image-panel {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  background: #00AEEC;

  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  :deep(.is-loading) {
    display: none;
  }

  :deep(.el-image__wrapper) {
    position: relative;
    vertical-align: top;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .icon-image-error {
    margin: 0 auto;
    font-size: 20px;
    color: #838383;
    height: 100%;
  }

  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    img {
      width: 20px;
    }
  }

  .no-image {
    text-align: center;
    color: #fff;    
    background: #00AEEC;
    font-size:14px;
  }
}
</style>
