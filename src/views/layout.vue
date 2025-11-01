<template>
  <div
    class="main-container"
    :style="{
      'max-width': proxy.bodyMaxWidth + 'px',
      'min-width': proxy.bodyMinWidth + 'px',
    }"
  >
    <div
      class="header"
      :style="{
        'background-image': `url(${
          backgroundImage
            ? backgroundImage
            : getLocalImage('header-img.png')
        })`,
      }"
    >
      <LayoutHeader />
    </div>
    <div class="header-fixed" v-if="showFixedHeader">
      <LayoutHeader theme="dark" />
    </div>
    <div
      class="category-fixed"
      v-show="navActionStore.fixedCategory && showFixedCategory"
      :style="{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
      }"
      @mouseover="lineCategoryMouseHandler(1)"
      @mouseout="lineCategoryMouseHandler(0)"
    >
      <div class="category-fixed-inner">
        <Category :showType="1" :mouseOver="mouseOver" />
      </div>
    </div>
    <div
      class="body-container"
      :style="{
        'max-width': proxy.bodyMaxWidth + 'px',
        'min-width': proxy.bodyMinWidth + 'px',
        '--body-padding': proxy.bodyPadding + 'px',
      }"
    >
      <div class="category">
        <Category :showType="0" />
      </div>
      <div class="body-main">
        <router-view />
      </div>
    </div>
    <div class="body-inner"></div>
    <Account />
  </div>
</template>
<script setup>
import Category from "@/views/Category.vue";
import Account from "@/views/account/Account.vue";
import LayoutHeader from "@/components/LayoutHeader.vue";
import { ref, onMounted, getCurrentInstance, onUnmounted, computed } from "vue";
import { useLoginStore } from "@/stores/loginStore";
import { useNavActionStore } from "@/stores/navActionStore";
import { eventBus } from "@/eventbus/eventBus.js";
import { useCategoryStore } from "@/stores/categoryStore.js";
import {getLocalImage} from "@/utils/utils.js";
const categoryStore = useCategoryStore();
const { proxy } = getCurrentInstance();
const loginStore = useLoginStore();
const navActionStore = useNavActionStore();

const showFixedHeader = ref(false);
const showFixedCategory = ref(false);

const mouseOver = ref(false);
const lineCategoryMouseHandler = (type) => {
  mouseOver.value = type == 1;
};

onMounted(() => {
  window.addEventListener("scroll", windowScrollHandler);
  window.addEventListener("resize", windowResizeHandler);
  // 自动登录：刷新或新标签打开时根据服务端会话还原用户信息
  autoLogin();
});
onUnmounted(() => {
  window.removeEventListener("scroll", windowScrollHandler);
  window.removeEventListener("resize", windowResizeHandler);
});

const showFixedTopHandler = () => {
  const curScrollTop = window.scrollY;
  if (curScrollTop <= 20) {
    showFixedHeader.value = false;
  } else {
    showFixedHeader.value = true;
  }
  if (curScrollTop >= 250) {
    showFixedCategory.value = true;
  } else {
    showFixedCategory.value = false;
  }
};
const windowScrollHandler = () => {
  var curScrollTop = window.scrollY;
  showFixedTopHandler(curScrollTop);
  eventBus.emit("scroll", curScrollTop);
};
const windowResizeHandler = () => {
  eventBus.emit("resize");
};

const backgroundImage = computed(() => {
  const background = categoryStore.currentPCategory?.background;

  return background ? proxy.api.sourcePath + background : null;
});

const autoLogin = async () => {
  try {
    const result = await proxy.request({
      url: proxy.api.autoLogin,
      // 静默自动登录：不弹错误
      showLoading: false,
      errorCallback: () => {},
    });
    if (result && result.data) {
      loginStore.saveUserInfo(result.data);
    }
  } catch (_e) {
    // 未登录或会话失效，保持未登录状态
  }
};
</script>
<style lang="scss" scoped>
.main-container {
  background: #fff;
  margin: 0px auto;
  min-height: calc(100vh);
  // width: 100%;
  position: relative;
  // transform: translate(0, 0);
  .header {
    margin: 0 auto;
    background-color: #7c9ce1;
    height: 180px;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    width: 100%;
    background-image: url(../assets/header-img.png);
    background-size: cover;
    // transform: translate(0, 0)
  }

  .header-fixed {
    position: fixed;
    width: 100%;
    // 关键修改：用#{}包裹v-bind，避免Sass解析错误
    max-width: #{"v-bind(proxy.bodyMaxWidth)px"};
    top: 0;
    z-index: 1001;
    // margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: #fff;
  }
  .category-fixed {
    position: fixed;
    z-index: 1000;
    // top:64px;
    width: 100%;
    background: #fff;
    padding: 10px 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    margin-top: -116px;
    .category-fixed-inner {
      margin: 0 auto;
    }
  }
  .body-container {
    padding: 0px var(--body-padding);
    .category {
      margin-top: 20px;
    }
  }

  .body-inner {
    height: 20000px;
  }
}

@media screen and (max-width: 1500px) {
  .main-container {
    .body-container {
      padding: 0px 60px;
    }
  }
}
</style>