<template>
  <div class="commend-panel">
    <div
      class="carousel-panel"
      :style="{
        width: carouselWidth + 'px',
        height: carouselWidth * 0.6 + 'px',
      }"
    >
      <el-carousel
        ref="carouselRef"
        :height="carouselWidth * 0.6 + 'px'"
        indicator-position="none"
        arrow="never"
        @change="craouselChange"
      >
        <el-carousel-item
          v-for="(item, index) in carouselVideoList"
          :key="item?.videoId ?? index"
          :name="index + ''"
        >
          <div class="roll-image">
            <router-link
              v-if="item"
              :to="`/video/${item.videoId}`"
              target="_blank"
            >
              <img :src="`${proxy.api.sourcePath}${item.videoCover}`" />
            </router-link>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 将底部信息块放回到轮播容器中，保证绝对定位覆盖在图上 -->
      <div class="carousel-bottom" v-if="currentVideo" :style="{ background: bottomGradient }">
        <div class="name-op">
          <router-link
            class="video-name"
            :to="`/video/${currentVideo.videoId}`"
          >
            {{ currentVideo.videoName }}
          </router-link>
          <div class="change-btn">
            <span class="iconfont icon-icon-left" @click="preCarousel"></span>
            <span class="iconfont icon-icon-right" @click="nextCarousel"></span>
          </div>
        </div>
        <div class="dtos">
          <div
            v-for="(item, idx) in carouselVideoList"
            :key="item?.videoId ?? idx"
            :class="['dto-item', carouselIndex === idx ? 'active' : '']"
            @click="setCarousel(idx)"
          ></div>
        </div>
      </div>
    </div>
    <div class="video-list">
      <div
        class="video-item"
        v-for="(item, idx) in commendVideoList"
        :key="item?.videoId ?? idx"
      >
        <router-link v-if="item" :to="`/video/${item.videoId}`" target="_blank">
          <div class="thumb">
            <img v-if="item.videoCover" :src="`${proxy.api.sourcePath}${item.videoCover}`" alt="cover" />
            <div class="thumb-mask">
              <span class="stat"><i class="iconfont icon-bofang"></i>{{ formatCount(item.playCount) }}</span>
              <span class="stat"><i class="iconfont icon-shoucang"></i>{{ formatCount(item.favoriteCount) }}</span>
            </div>
          </div>
          <div class="title" :title="item.videoName">{{ item.videoName }}</div>
          <div class="meta">
            <span class="iconfont icon-UPzhu"></span>
            <span class="author" :title="item.nickName">{{ item.nickName }}</span>
            <span class="dot">·</span>
            <span class="time">{{ formatDate(item.publishTime || item.createTime || item.updateTime || item.uploadTime || item.time || item.date) }}</span>
          </div>
        </router-link>
      </div>
    </div>
    
  </div>
</template>
<script  setup>
import { ref, onMounted, getCurrentInstance, onUnmounted, computed } from "vue";
import { eventBus } from "@/eventbus/eventBus.js";

const { proxy } = getCurrentInstance();

const carouselVideoList = ref([]);
const commendVideoList = ref([]);

const loadRecommendVideo = async () => {
  let res = await proxy.request({
    url: proxy.api.loadRecommendVideo,
   
  });
  if (!res) return;
  const allCommendVideoList = res.data;
  if (allCommendVideoList?.length > proxy.carouselMaxCount) {
    carouselVideoList.value = allCommendVideoList.slice(
      0,
      proxy.carouselMaxCount
    )
    commendVideoList.value = allCommendVideoList.slice(
      proxy.carouselMaxCount,proxy.carouselMaxCount+6
    )
  } else {
    carouselVideoList.value = allCommendVideoList;
  }
};
loadRecommendVideo();

const carouselIndex = ref(0);
const craouselChange = (index) => {
  carouselIndex.value = index;
};

// 当前轮播视频（数据未到达时为 null，避免读取 undefined.videoId 报错）
const currentVideo = computed(() => {
  return carouselVideoList.value?.[carouselIndex.value] || null;
});

const carouselWidth = ref();
console.log("111", proxy.bodyPadding);

// 根据当前轮播图封面提取主色，生成底部渐变背景
const bottomGradient = ref('rgba(0,0,0,0.6)');
const getImageAverageColor = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) return reject();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = 32, h = 32;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let r = 0, g = 0, b = 0, c = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; c++;
      }
      r = Math.round(r / c); g = Math.round(g / c); b = Math.round(b / c);
      resolve({ r, g, b });
    };
    img.onerror = reject;
  });
};
const updateBottomGradient = async (cover) => {
  try {
    const url = `${proxy.api.sourcePath}${cover}`;
    const color = await getImageAverageColor(url);
    bottomGradient.value = `linear-gradient(180deg, rgba(${color.r},${color.g},${color.b},0) 0%, rgba(${color.r},${color.g},${color.b},0.7) 100%)`;
  } catch (e) {
    bottomGradient.value = 'rgba(0,0,0,0.6)';
  }
};

const resetCarouselWidth = () => {
  let width =
    (document.documentElement.clientWidth - proxy.bodyPadding * 2) * 0.4218;
  if (width < 400) {
    width = 400;
  }
  carouselWidth.value = width;
};
onMounted(() => {
  eventBus.on("WindowResize", () => {
    resetCarouselWidth();
  });
  resetCarouselWidth();
  // 初始化底部渐变色
  updateBottomGradient(currentVideo.value?.videoCover);
});
onUnmounted(() => {
  eventBus.off("WindowResize");
});
// 轮播实例，用于点击指示点时切换
const carouselRef = ref(null);
// 切换轮播
const setCarousel = (i) => {
  carouselIndex.value = i;
  // Element Plus Carousel 支持 setActiveItem(name/index)
  carouselRef.value?.setActiveItem(String(i));
};
// 上一个轮播
const preCarousel = () => {
  const len = carouselVideoList.value.length || 0;
  if (!len) return;
  setCarousel((carouselIndex.value - 1 + len) % len);
};
// 下一个轮播
const nextCarousel = () => {
  const len = carouselVideoList.value.length || 0;
  if (!len) return;
  setCarousel((carouselIndex.value + 1) % len);
};

// 右侧卡片数量格式化
const formatCount = (n) => {
  if (n === null || n === undefined) return "0";
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "千";
  return String(n);
};

// 时间显示格式化：优先显示 MM-DD；无法解析时显示原字符串
const formatDate = (val) => {
  if (!val) return "";
  // 数字时间戳或可解析的日期字符串
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}-${dd}`;
  }
  // 形如 2024-10-30 取中间 MM-DD
  const s = String(val);
  const m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) {
    const mm = String(m[2]).padStart(2, "0");
    const dd = String(m[3]).padStart(2, "0");
    return `${mm}-${dd}`;
  }
  // 已是 MM-DD 或其它不可解析格式，直接返回
  return s;
};

// 轮播索引变化时更新底部渐变色
import { watch } from 'vue';
watch(currentVideo, (v) => {
  updateBottomGradient(v?.videoCover);
});
</script>
<style lang="scss" scoped>
.commend-panel {
  display: flex;
  padding-top: 20px;
  .carousel-panel {
    border-radius: 5px;
    overflow: hidden;
    position: relative;

    .roll-image {
      position: relative;
      background: #e9e9e9;
      width: 100%;
      height: 100%;
      a { display: block; width: 100%; height: 100%; }
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .carousel-bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 75px;
      padding: 10px;
      //   line-height: 40px;
      background: rgba(0, 0, 0, 0.6);
      .name-op {
        display: flex;
        justify-content: space-between;
        align-content: center;
        .video-name {
          flex: 1;
          color: #fff;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          text-decoration: none;
          display: block;
          font-size: 16px;
        }
        .change-btn {
          margin-left: 10px;
          width: 60px;
          display: flex;
          justify-content: space-between;
          .iconfont {
            cursor: pointer;
            text-align: center;
            width: 25px;
            height: 25px;
            // padding-top: 7px;
            line-height: 25px;
            color: #fff;
            font-size: 20px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
          }
        }
      }
      .dtos {
        display: flex;
        margin-top: 15px;
        align-items: center;
        .dto-item {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #b0b0b0;
          cursor: pointer;
          margin-right: 10px;
        }
        .active {
          width: 15px;
          height: 15px;
          background: #fff;
        }
      }
    }
  }
  .video-list {
    margin-left: 20px;
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: auto;
    gap: 16px;
    .video-item {
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      a {
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .thumb {
        position: relative;
        background: #f0f0f0;
        img {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        .thumb-mask {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 34px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          gap: 10px;
          color: #fff;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%);
          .stat {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            i { margin-right: 4px; }
          }
        }
      }
      .title {
        padding: 8px 8px 10px;
        font-size: 14px;
        line-height: 20px;
        color: #222;
        display: -webkit-box;
        
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color .15s ease;
      }
      .title:hover {
          color: #007bff;
        }
      
      .meta {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 8px 10px;
        font-size: 12px;
        color:rgb(148, 153, 160);
        .iconfont { color: #9499a0; font-size: 14px; }
        .author {
          max-width: 9em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dot { color: #b8b8b8; margin: 0 2px; }
        .time { color: #9499a0; }
      }
      /* 让内部元素也随 hover 一起变色 */
      .meta .iconfont,
      .meta .author,
      .meta .dot,
      .meta .time {
        transition: color .15s ease;
      }
      .meta:hover,
      .meta:hover .iconfont,
      .meta:hover .author,
      .meta:hover .dot,
      .meta:hover .time {
        color: #007bff;
      }
    }
  }
}
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>

