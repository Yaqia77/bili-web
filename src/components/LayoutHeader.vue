<template>
  <div :class="['header-bar', 'header-bar-' + props.theme]">
    <div class="menu">
      <el-popover
        :width="categoryPartCount * (150 + 21) + 24"
        trigger="hover"
        :show-arrow="false"
        :offset="22"
        placement="bottom"
      >
        <template #reference>
          <router-link class="iconfont icon-wf_Bzhan" to="/">首页</router-link>
        </template>
        <div class="nav-list">
          <div class="nav-part" v-for="index in categoryPartCount" :key="index">
            <router-link
              class="nav-item"
              v-for="item in categoryStore.categoryList.slice(
                (index - 1) * partCount,
                index * partCount
              )"
              :key="item.id"
              :to="`/v/${item.categoryCode}`"
            >
              <span class="icon" v-if="item.icon">
                <img :src="`${proxy.api.sourcePath}${item.icon}`" />
              </span>
              <span class="category-name">
                {{ item.categoryName }}
              </span>
            </router-link>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="search-body">
      <div class="search-panel">
        <div class="search-panel-inner">
          <div class="input-panel">
            <input type="text" />
            <div class="iconfont icon-sousuo"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="user-panel">
      <div
        class="user-avatar"
        @click="login"
        @mouseenter="onAvatarEnter"
        @mouseleave="onAvatarLeave"
      >
        <template v-if="Object.keys(loginStore.userInfo).length > 0">
          <Avatar
            class="avatar"
            :avatar="loginStore.userInfo.avatar"
            :userId="loginStore.userInfo.userId"
            :width="35"
            :lazy="false"
          ></Avatar>
          <div
            class="user-info-panel"
            :class="{ visible: userPanelShow }"
            @mouseenter="onPanelEnter"
            @mouseleave="onPanelLeave"
          >
            <div class="nick-name">{{ loginStore.userInfo.nickName }}</div>
            <div class="count-info">
              <!-- 这里可以放统计与菜单条目 -->
            </div>
            <div class="logout" @click.stop="doLogout">退出登录</div>
          </div>
        </template>
        <Avatar v-else class="avatar" :width="35" @click="login"></Avatar>
        <div
          class="login-tooltip"
          v-if="Object.keys(loginStore.userInfo).length === 0"
          :class="{ visible: tooltipShow }"
          @mouseenter="onTooltipEnter"
          @mouseleave="onTooltipLeave"
        >
          <div class="login-tooltip-content">
            <div class="login-tooltip-title">登录后你可以：</div>
            <ul class="login-tooltip-list">
              <li><i class="iconfont icon-hd"></i> 免费看高清视频</li>
              <li><i class="iconfont icon-lishi"></i> 多端同步播放记录</li>
              <li><i class="iconfont icon-danmushu"></i> 发表弹幕/评论</li>
              <li><i class="iconfont icon-bofang"></i> 热门番剧影视看不停</li>
            </ul>
            <el-button type="primary" @click.stop="login" class="login-btn"
              >立即登录</el-button
            >
            <div class="login-tooltip-register">
              首次使用？<a href="#" @click.stop="login">点我注册</a>
            </div>
          </div>
        </div>
      </div>
      <div class="user-panel-item">
        <div class="iconfont icon-youxiang"></div>
        <div>消息</div>
      </div>
      <div class="user-panel-item">
        <div class="iconfont icon-shoucang"></div>
        <div>收藏</div>
      </div>
      <div class="user-panel-item">
        <div class="iconfont icon-lishi"></div>
        <div>历史</div>
      </div>
      <div class="user-panel-item">
        <div class="iconfont icon-chuangzuozhezhongxin"></div>
        <div>创作者中心</div>
      </div>
      <div class="btn-upload">
        <el-button type="primary" @click="() => {}" size="large">
          <span class="iconfont icon-24px"></span>
          <span>投稿</span>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, computed } from "vue";
import { useLoginStore } from "@/stores/loginStore";
import { useCategoryStore } from "@/stores/categoryStore";
const loginStore = useLoginStore();
const categoryStore = useCategoryStore();
const { proxy } = getCurrentInstance();

const props = defineProps({
  theme: {
    type: String,
    default: "light", // light | dark
  },
});
const showTooltip = ref(false);
const tooltipShow = ref(false);
const userPanelShow = ref(false);
let hideTimer = null;
const UNLOGGED_DELAY = 900; // 未登录提示的隐藏延迟更长（进一步加长）
const LOGGED_DELAY = 400; // 已登录信息框的隐藏延迟
const login = () => {
  // 已登录时不再弹出登录框
  if (Object.keys(loginStore.userInfo).length > 0) {
    return;
  }
  loginStore.setLogin(true);
  //点击登录后，关闭弹窗，设置display为none，使用document.querySelector获取弹窗元素
  const loginTooltip = document.querySelector(".login-tooltip");
  loginTooltip.style.display = "none";
};
console.log("1111", proxy.api.sourcePath);

// 悬停交互：头像与弹窗之间无缝切换
const onAvatarEnter = () => {
  if (Object.keys(loginStore.userInfo).length > 0) {
    userPanelShow.value = true;
  } else {
    tooltipShow.value = true;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};
const onAvatarLeave = () => {
  hideTimer = setTimeout(
    () => {
      if (Object.keys(loginStore.userInfo).length > 0) {
        userPanelShow.value = false;
      } else {
        tooltipShow.value = false;
      }
      hideTimer = null;
    },
    Object.keys(loginStore.userInfo).length > 0 ? LOGGED_DELAY : UNLOGGED_DELAY
  );
};
const onPanelEnter = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  userPanelShow.value = true;
};
const onPanelLeave = () => {
  hideTimer = setTimeout(() => {
    userPanelShow.value = false;
    hideTimer = null;
  }, LOGGED_DELAY);
};
const onTooltipEnter = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  tooltipShow.value = true;
};
const onTooltipLeave = () => {
  hideTimer = setTimeout(() => {
    tooltipShow.value = false;
    hideTimer = null;
  }, UNLOGGED_DELAY);
};
const partCount = 5;
const categoryPartCount = computed(() => {
  // 计算分类列表需要分成多少部分，向上取整
  return Math.ceil(categoryStore.categoryList.length / partCount);
});

// 退出登录：调用后端接口并清空用户信息
const doLogout = async () => {
  try {
    await proxy.request({ url: proxy.api.logout, showLoading: false });
  } catch (_e) {
    // 忽略错误，仍然执行本地退出
  }
  loginStore.saveUserInfo({});
  proxy.message && proxy.message.success && proxy.message.success("已退出登录");
};
</script>
<style lang="scss" scoped>
.header-bar {
  width: 100%;
  height: 64px;
  padding: 0 25px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  /* vertical center grid rows */

  .menu {
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;

    .iconfont {
      font-size: 14px;

      &::before {
        font-size: 16px;
        margin-right: 5px;
      }
    }
  }

  .search-body {
    color: #61666d;

    .search-panel {
      margin: 0px auto;
      max-width: 80%;

      .search-panel-inner {
        // width: 100%;
        // position: absolute;
        top: 10px;
        left: 0px;
        border: 1px solid #e3e5e7;
        border-radius: 8px;
        overflow: hidden;
        z-index: 1001;

        .input-panel {
          display: flex;
          align-items: center;
          background: #f1f2f3;

          input {
            width: 100%;
            border: none;
            background: #f1f2f3;
            border-radius: 5px;
            padding: 8px 10px;
            margin: 3px 10px 3px 10px;

            &:focus {
              outline: none;
            }
          }
          .iconfont {
            font-size: 20px;
            margin-right: 10px;
            color: #2f3238;
            width: 35px;
            height: 30px;
            display: flex;
            align-content: center;
            justify-content: center;
            border-radius: 5px;
            cursor: pointer;
            &:hover {
              background: #ddd;
            }
          }
        }
      }
    }
  }

  .user-panel {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    // gap: 12px;

    .user-avatar {
      width: 35px;
      height: 35px;
      position: relative;
      margin-right: 13px;
      // overflow: hidden;
      overflow: visible;
      .avatar {
        cursor: pointer;
      }
      .avatar {
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        // position: absolute;
        // z-index: 10001;
        // top: 0;
        // left: 0;
      }
      /* 强化头像放大与白色外环效果 */
      .avatar {
        transform-origin: center center;
        z-index: 10002;
      }
      .avatar :deep(.image-panel) {
        // background: transparent;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.95);
        border-radius: 50%;
      }
      .user-avatar:hover .avatar {
        transform: scale(1.8);
      }
      .user-avatar:hover .avatar :deep(.image-panel) {
        box-shadow: 0 0 0 4px #fff, 0 8px 20px rgba(0, 0, 0, 0.25);
      }
      .login-tooltip:hover {
        display: block;
      }
      .user-info-panel {
        padding: 10px 20px 10px;
        background: #fff;
        width: 300px;
        position: absolute;
        top: 45px;
        left: -135px;
        border-radius: 5px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
        z-index: 10000;
        display: block;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(6px);
        transition: opacity 0.25s ease, visibility 0.25s ease,
          transform 0.25s ease;
      }
      .user-info-panel.visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }

      /* 弹窗底部退出登录按钮样式（放在 user-avatar 作用域下） */
      .logout {
        display: block;
        margin-top: 10px;
        padding: 0 20px;
        line-height: 40px;
        text-align: center;
        border-top: 1px solid #eee;
        color: #2f3238;
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.2s ease;
      }
      .logout:hover {
        //背景为灰色
        background: #e8e8e8;
      }

      .nick-name {
        font-size: 16px;
        text-align: center;
        line-height: 40px;
        color: var(--text3);
      }
      .count-info {
        margin: 10px 0;
        display: flex;
        justify-content: space-around;
        .count-info-item {
          text-align: center;
          .count-info-item {
            text-align: center;
            .count-title {
              color: var(--text3);
              margin-top: 5px;
            }
            .count-value {
              text-align: center;
              color: var(--text);
            }
          }
        }
        .item {
          font-size: 14px;
          display: block;
          text-align: center;
          line-height: 40px;
          color: var(--text);
          padding: 0px 20px;
          text-decoration: none;
          display: flex;
          justify-content: space-between;
          .item-name {
            flex: 1;
          }
          &::before {
            margin-right: 15px;
          }
          &:hover {
            background: #e8e8e8;
            border-radius: 5px;
          }
        }
        /* 这里的 .logout 样式移到外层统一控制 */
      }
      &:hover {
        // overflow: hidden;
        .avatat {
          transform: scale(2) translateY(10px) translateX(-10px);
        }
        .user-info-panel {
          display: block;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        .login-tooltip {
          // display: block;
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          transition-delay: 0.3s;
          padding-top: 19px;
          margin-left: 0px;
          // transition: opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease;
        }
      }
      .login-tooltip {
        display: block;
        opacity: 0;
        visibility: hidden;
        position: absolute;
        top: calc(100% + 10px); /* 头像下方10px */
        left: -170px;
        // transform: translateX(-50%) translateY(10px); /* 水平居中 + 垂直下移（动画起点） */
        width: 380px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        padding: 25px;
        box-sizing: border-box;
        /* 过渡效果： opacity/visibility/transform 同步动画 */
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
        // pointer-events: none; /* 默认不可交互，避免影响 hover 离开判断 */
        /* 显示状态：添加is-visible类 */

        .login-tooltip-content {
          text-align: center;
        }

        .login-tooltip-title {
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          color: #333;
        }

        .login-tooltip-list {
          list-style: none;
          padding: 0;
          margin: 0 0 25px 0; /* 底部间距，与按钮分隔 */
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* 两列，每列占1份 */
          gap: 15px 20px; /* 行间距15px，列间距20px */
          text-align: left;
          li {
            display: flex;
            align-items: center; /* 图标与文字垂直居中 */
            color: #333;
            font-size: 14px;
            margin-bottom: 0; /* 移除原margin，用gap替代 */

            i {
              margin-right: 10px; /* 图标与文字间距 */
              color: #00a1d6; /* 图标颜色（与原风格一致） */
              font-size: 18px; /* 增大图标，更明显 */
            }
          }
        }
        /* 关键交互：hover 头像或弹窗时，提示框显示 */
        .user-avatar:hover .login-tooltip,
        .login-tooltip:hover,
        .login-tooltip.visible {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0); /* 垂直回到原位（动画终点） */
          pointer-events: auto;
          transition-delay: 0s; /* 显示时无延迟（立即弹出） */
        }
        .login-btn {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          background: #00a1d6;
          border-color: #00a1d6;
          border-radius: 6px;
          margin-bottom: 10px;
          transform: translateY(0);
          transition: transform 0.3s ease 0.3s;
        }

        .login-tooltip-register {
          font-size: 14px;
          color: #999;

          a {
            color: #00a1d6;
            text-decoration: none;
          }
        }
      }
    }

    .user-panel-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      font-size: 12px;

      .iconfont {
        font-size: 18px;
        line-height: 1;
        margin-bottom: 4px;
        display: block;
      }
    }

    .btn-upload {
      margin-left: 15px;

      .el-button {
        background: #fb7299;
        border-color: #fb7299;
        border-radius: 8px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
}

.header-bar-light {
  color: #fff;

  .menu-item {
    color: #fff;
  }

  a {
    color: #fff;
  }
}

.header-bar-dark {
  color: #61666d;

  .menu-item {
    color: #61666d;
  }

  a {
    color: #61666d;
  }
}

.nav-list {
  display: flex;
  .nav-part {
    &:last-child {
      border-right: none;
    }
    padding: 0 10px;
    border-right: 1px solid #ddd;
    .nav-item {
      display: flex;
      padding: 0px 10px;
      height: 35px;
      border-radius: 3px;
      cursor: pointer;
      align-items: center;
      width: 150px;
      text-decoration: none;
      color: #2f3238;
      &:hover {
        background: #ddd;
      }
      .icon {
        width: 25px;
        height: 25px;
        overflow: hidden;
        margin-right: 5px;
        img {
          width: 100%;
        }
      }
      .category-name {
        flex: 1;
      }
    }
  }
}
</style>