<template>
  <div
    class="main-container"
    :style="{
      'max-width': proxy.bodyMaxWidth + 'px',
      'min-width': proxy.bodyMinWidth + 'px',
    }"
  >
    <div class="header">
      <LayoutHeader />
    </div>
    <div class="header-fixed" v-if="showFixedHeader">
      <LayoutHeader theme="dark" />
    </div>
    <div class="category-fixed">
        <div class="category-fixed-inner">
            <Category />
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
import { ref, onMounted, getCurrentInstance } from "vue";
import { useLoginStore } from "@/stores/loginStore";

const { proxy } = getCurrentInstance();
const loginStore = useLoginStore();

const showFixedHeader = ref(false);

onMounted(() => {
  window.addEventListener("scroll", windowScrollHandler);
  // 自动登录：刷新或新标签打开时根据服务端会话还原用户信息
  autoLogin();
});
const windowScrollHandler = () => {
  const curScrollTop = window.scrollY;
  if (curScrollTop <= 20) {
    showFixedHeader.value = false;
  } else {
    showFixedHeader.value = true;
  }
};

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
  width: 100%;

  // transform: translate(0, 0);
  .header {
    margin: 0 auto;
    background-color: #7c9ce1;
    height: 180px;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    // width: 100%;
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
    // z-index: 1001;
    // left: 0;
    // right: 0;
    margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: #fff;
  }

  .body-inner {
    height: 20000px;
  }
}
</style>