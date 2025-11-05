<template>
  <div
    :class="['video-item', layoutType == 1 ? 'video-item2' : '']"
    :style="{
      'margin-top': marginTop + 'px',
    }"
  >
    <router-link :to="`/video/${data.videoId}`" target="_blank">
      <div class="cover">
        <Cover :source="data.videoCover"></Cover>
        <div class="shade">
          <div class="play-count" v-if="layoutType === 0">
            <div class="iconfont icon-play">
              {{ formatCount(data.playCount) }}
            </div>
            <div class="iconfont icon-danmushu">
              {{ formatCount(data.danmuCount) }}
            </div>
          </div>

          <div class="play-time">{{ data.playTime }}</div>
        </div>
      </div>
      <div class="video-info">
        <router-link
          :to="`/video/${data.videoId}`"
          target="_blank"
          class="title"
          :title="data.videoName"
          >{{ data.videoName }}</router-link
        >
        <div class="meta">
          <router-link :to="`/user/${data.userId}`" target="_blank">
            <span class="iconfont icon-UPzhu"></span>
            <span class="author" :title="data.nickName">{{
              data.nickName
            }}</span>
            <span class="dot"> · </span>
            <span class="time">{{
              formatDate(
                data.publishTime ||
                  data.createTime ||
                  data.updateTime ||
                  data.uploadTime ||
                  data.time ||
                  data.date
              )
            }}</span>
          </router-link>
        </div>
        <!-- 左右布局时显示播放数据 -->
        <div class="play-count video-info-play-count" v-if="layoutType === 1">
          <div class="iconfont icon-play">
            {{ formatCount(data.playCount) }}
          </div>
          <div class="iconfont icon-danmushu">
            {{ formatCount(data.danmuCount) }}
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance } from "vue";
import Cover from "./Cover.vue";
import { formatDate } from "@/utils/utils.js";

const { proxy } = getCurrentInstance();
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  // 布局类型 0: 上下布局 1: 左右布局
  layoutType: {
    type: Number,
    default: 0,
  },
  marginTop: {
    type: Number,
    default: 0,
  },
});

// 格式化数字
const formatCount = (count) => {
  if (!count) return "0";
  count = parseInt(count);
  if (count < 10000) {
    return count;
  } else {
    return (count / 10000).toFixed(1) + "万";
  }
};

// 格式化日期
// const formatDate = (val) => {
//   if (!val) return "";

//   // 如果已经是MM-DD格式，直接返回
//   if (typeof val === "string" && /^\d{2}-\d{2}$/.test(val)) {
//     return val;
//   }

//   let date;
//   // 处理时间戳（数字）
//   if (typeof val === "number") {
//     date = new Date(val);
//   } else {
//     // 处理日期字符串
//     date = new Date(val);
//   }

//   // 格式化为MM-DD
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${month}-${day}`;
// };
</script>
<style lang="scss" scoped>
.video-item {
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 6px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }

  .cover {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    // aspect-ratio: 16 / 10;
    margin-top: 40px;
    .image-style {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 6px;
      object-fit: cover;
    }

    .shade {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      padding: 8px 8px 6px;
      z-index: 1;
      border-bottom-right-radius: 6px;
      border-bottom-left-radius: 6px;
      background-image: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.8) 100%
      );
      color: #fff;
      opacity: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .play-count {
        display: flex;
        color: #fff;
        font-size: 12px;
        .iconfont {
          font-size: 12px;
          display: flex;
          align-items: center;
          &::before {
            font-size: 14px;
            margin-right: 3px;
          }
        }
        .icon-danmushu {
          margin-left: 12px;
        }
      }

      .play-time {
        font-size: 12px;
        color: #fff;
        padding: 0 2px;
      }
    }
  }

  .video-info {
    cursor: pointer;
    padding: 0 2px;

    .title {
      height: auto;
      max-height: 44px;
      color: #18191c;
      font-size: 15px;
      font-weight: 500;
      margin-top: 8px;
      display: -webkit-box;
      overflow: hidden;
      text-decoration: none;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      word-break: break-word;
      line-height: 22px;
      -webkit-line-clamp: 2;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #00aeec;
      }

      :deep(.highlight) {
        color: red !important;
      }
    }

    .meta {
      display: flex;
      align-items: center;
      margin-top: 5px;
      font-size: 13px;
      color: #9499a0;

      .iconfont {
        
        font-size: 14px;
        transition: color 0.2s ease;
        color: #9499a0;
      }

      .author {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.2s ease;
        color: #9499a0;
      }

      .dot {
        margin: 0 4px;
        color: #9499a0;
        transition: color 0.2s ease;
      }

      .time {
        color: #9499A0;

        transition: color 0.2s ease;
      }

      &:hover,
      &:hover .iconfont,
      &:hover .author,
      &:hover .dot,
      &:hover .time {
        color: #00aeec;
      }
    }
  }
}

.video-item2 {
  display: flex;

  .cover {
    width: 190px;
    flex-shrink: 0;

    .shade {
      justify-content: flex-end;
    }
  }

  .video-info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;

    .title {
      margin-top: 0;
      padding: 0;
      -webkit-line-clamp: 2;
    }

    .play-count {
      display: flex;
      margin-top: auto;
      color: #9499a0;
      font-size: 13px;

      .iconfont {
        &::before {
          font-size: 16px;
          margin-right: 2px;
        }
      }

      .icon-danmu {
        margin-left: 15px;
      }
    }

    .meta {
      display: flex;
      align-items: center;
      margin-top: 5px;
      font-size: 13px;
      color: #9499a0;

      &:hover,
      &:hover .iconfont,
      &:hover .author,
      &:hover .dot,
      &:hover .time {
        color: #00aeec;
      }
    }
  }
}
</style>
      
