<template>
  <div :class="['header-bar', 'header-bar-' + props.theme]">
    <div class="menu">
      <router-link class="iconfont icon-wf_Bzhan" to="/">首页</router-link>
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
      <div class="user-avatar" @click="login" @mouseleave="showTooltip = false">
        <template v-if="Object.keys(loginStore.userInfo).length > 0">
          <Avatar
            class="avatar"
            :avatar="loginStore.userInfo.avatar"
            :userId="loginStore.userInfo.userId"
            :width="35"
            :lazy="false"
          ></Avatar>
          <div class="user-info-panel">
            <div class="nick-name">{{ loginStore.userInfo.nickName }}</div>
          </div>
        </template>
        <Avatar v-else class="avatar" :width="35" @click="login"></Avatar>
        <div
          class="login-tooltip"
          v-show="showTooltip = true"
          
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
import { ref } from "vue";
import { useLoginStore } from "@/stores/loginStore";
const loginStore = useLoginStore();

const props = defineProps({
  theme: {
    type: String,
    default: "light", // light | dark
  },
});
const showTooltip = ref(); // 控制弹窗显示的响应式变量
const login = () => {
  loginStore.setLogin(true);
  showTooltip.value = false;
  console.log(showTooltip.value);
  //控制login-tooltip中的display属性为none
  document.querySelector(".login-tooltip").style.display = "none";
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
        transition: transform 0.3s;
        // position: absolute;
        // z-index: 10001;
        // top: 0;
        // left: 0;
      }
      .user-avatar:hover .avatar {
        transform: scale(2) translateY(10px) translateX(-10px); /* 头像放大效果保留 */
      }
      .login-tooltip:hover {
        display: block;
      }
      .user-info-panel {
        padding: 10px 20px 10px;
        background: #fff;
        width: 300px;
        position: absolute;
        // top: 60px;
        // left: -150px;
        border-radius: 5px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.3s;
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
        .logout {
          display: flex;
          margin-top: 10px;
          border-top: 1px solid #ddd;
          cursor: pointer;
        }
      }
      &:hover {
        // overflow: hidden;
        .avatat {
          transform: scale(2) translateY(10px) translateX(-10px);
        }
        .user-info-panel {
          opacity: 1;
        }
        .login-tooltip {
          // display: block;
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          transition-delay: 0.3s;
          padding-top: 19px;
          margin-left: 0px;
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
        // pointer-events: auto; /* 允许鼠标事件（ hover 弹窗时不消失） */
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
        .login-tooltip:hover {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0); /* 垂直回到原位（动画终点） */
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
</style>