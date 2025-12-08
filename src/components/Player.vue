<template>
  <div class="player-panel">
    <!-- 确保容器样式有效，设置最小高度避免尺寸为0 -->
    <div class="player-style" ref="playerRef" :style="{ height: playerHeight + 'px', minHeight: '300px', width: '100%' }">
      <div class="danmu-panel">
        <div class="watcher">{{ onLineCount }} 人正在观看,已装填{{ danmuCount }}条弹幕</div>
        <div id="danmu" v-show="showDanmu"></div>
        <div class="close-danmu" v-show="!showDanmu">已关闭弹幕</div>
      </div>
      <!-- 播放状态图标容器（确保初始化时能找到元素） -->
      <div id="play" style="display: none;">
        <img :src="getLocalImage('play.png')" alt="播放" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, getCurrentInstance } from "vue";
import { getLocalImage } from "@/utils/utils.js";
import { eventBus } from "@/eventbus/eventBus.js";
import Hls from "hls.js";
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { useLoginStore } from "@/stores/loginStore";
import { useRoute } from "vue-router";

// 1. 导入与基础变量声明（严格遵循“先声明后使用”）
const route = useRoute();
const { proxy } = getCurrentInstance();
const emit = defineEmits(['changeWideScreen']);
const loginStore = useLoginStore();
const playerRef = ref(null);

// 2. 核心状态变量
const playerHeight = ref(500);
const showDanmu = ref(true);
const onLineCount = ref(0);
const fileId = ref("");
const danmuCount = ref(0);
let player = null; // 播放器实例
let videoElement = null; // 原生视频元素引用
let loadRetryCount = 0; // 加载重试计数
const MAX_RETRY_COUNT = 5; // 最大重试次数
const RETRY_DELAY = 800; // 重试延迟（毫秒）

// 3. 工具函数（提前声明，避免未定义错误）
/**
 * 发送弹幕
 * @param {Object} danmu - 弹幕数据（包含text、color等）
 * @returns {boolean} 发送成功状态
 */
const postDanmu = async (danmu) => {
  try {
    if (!fileId.value) {
      console.warn("发送弹幕失败：未获取到视频fileId");
      return false;
    }
    const res = await proxy.request({
      url: proxy.api.postDanmu,
      method: "post",
      data: {
        fileId: fileId.value,
        videoId: route.params.videoId,
        content: danmu.text,
        time: player?.currentTime || 0,
        color: danmu.color || "#ffffff",
      },
    });
    return res?.success ?? false;
  } catch (e) {
    console.error("发送弹幕失败:", e);
    return false;
  }
};

/**
 * 加载弹幕列表
 * @returns {Array} 弹幕列表数据
 */
const loadDanmuList = async () => {
  if (!fileId.value) return [];
  try {
    const res = await proxy.request({
      url: proxy.api.loadDanmu,
      params: {
        fileId: fileId.value,
        videoId: route.params.videoId,
      },
    });
    if (res?.data) {
      eventBus.emit("loadDanmu", res.data);
      danmuCount.value = res.data.length;
      return res.data;
    }
    return [];
  } catch (e) {
    console.error("加载弹幕失败:", e);
    return [];
  }
};

/**
 * 切换宽屏/普通模式
 */
const changeWideScreen = () => {
  if (!player) return;
  const wideCtrl = player.controls.find((c) => c.name === "wide-screen");
  const narrowCtrl = player.controls.find((c) => c.name === "narrow-screen");
  if (!wideCtrl || !narrowCtrl) {
    console.warn("未找到宽屏切换控件");
    return;
  }

  if (wideCtrl.style.display === "none") {
    // 切换为普通模式
    playerHeight.value = 500;
    wideCtrl.style.display = "flex";
    narrowCtrl.style.display = "none";
    emit("changeWideScreen", false);
  } else {
    // 切换为宽屏模式
    playerHeight.value = 300;
    wideCtrl.style.display = "none";
    narrowCtrl.style.display = "flex";
    emit("changeWideScreen", true);
  }
};

/**
 * 加载视频（核心修复：兼容HLS和原生播放，限制重试）
 * @param {string} videoUrl - 视频资源URL
 */
const loadVideo = (videoUrl) => {
  // 校验URL有效性
  if (!videoUrl) {
    console.error("加载视频失败：URL为空");
    return;
  }

  // 超过最大重试次数，停止并提示
  if (loadRetryCount >= MAX_RETRY_COUNT) {
    const errorMsg = `视频加载失败（已重试${MAX_RETRY_COUNT}次），请检查网络或刷新页面`;
    console.error(errorMsg);
    player?.notice.show(errorMsg);
    return;
  }

  console.debug(`[视频加载] 第${loadRetryCount + 1}次尝试 - URL:`, videoUrl);

  // 情况1：HLS实例已初始化（优先使用HLS播放）
  if (player?.hls) {
    try {
      player.hls.loadSource(videoUrl);
      player.hls.attachMedia(videoElement);
      // 触发播放（处理浏览器自动播放限制）
      if (videoElement?.paused) {
        videoElement.play().catch(err => {
          console.warn("自动播放失败（浏览器限制），请手动点击播放:", err);
          player.notice.show("请点击播放器开始播放");
        });
      }
      return;
    } catch (e) {
      console.error("HLS加载失败，降级为原生播放:", e);
    }
  }

  // 情况2：原生视频元素已存在（兼容性最高）
  if (videoElement) {
    try {
      videoElement.pause(); // 暂停当前播放
      videoElement.src = videoUrl; // 更新视频地址
      videoElement.load(); // 强制加载
      // 尝试自动播放
      videoElement.play().catch(err => {
        console.warn("自动播放失败，需手动触发:", err);
        player.notice.show("请点击播放器开始播放");
      });
      return;
    } catch (e) {
      console.error("原生视频加载失败:", e);
    }
  }

  // 情况3：播放器未就绪，延迟重试
  console.debug("[视频加载] 播放器未就绪，延迟重试");
  loadRetryCount++;
  setTimeout(() => {
    loadVideo(videoUrl);
  }, RETRY_DELAY);
};

/**
 * 初始化播放器（增强错误捕获和状态检查）
 */
const initPlayer = () => {
  try {
    // 前置检查：容器是否有效
    if (!playerRef.value) {
      console.error("初始化播放器失败：容器不存在");
      return;
    }

    // 检查容器尺寸（避免宽高为0导致初始化失败）
    const containerRect = playerRef.value.getBoundingClientRect();
    if (containerRect.width <= 0 || containerRect.height <= 0) {
      console.error("初始化播放器失败：容器尺寸无效", containerRect);
      return;
    }

    console.debug("[播放器初始化] 开始初始化 - 容器尺寸:", containerRect.width, "x", containerRect.height);

    // 创建Artplayer实例
    player = new Artplayer({
      container: playerRef.value,
      url: "", // 初始为空，后续通过loadVideo加载
      type: "m3u8",
      autoplay: false, // 关闭自动播放（避免浏览器限制）
      muted: false, // 不静音（提升用户体验）
      theme: "#23ade5",
      volume: 0.7,
      loop: false,
      autoMini: false,
      fullscreen: true,
      settings: [],
      pip: true,
      playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2], // 明确播放速度选项
      flip: true,
      aspectRatio: true,
      screenshot: true,
      autoPlayback: true,
      icons: {
        // 修复：确保初始化时能找到元素，找不到则使用默认图标
        state: document.querySelector("#play") || undefined,
      },
      controls: [
        {
          name: "wide-screen",
          position: "right",
          html: '<span class="iconfont icon-wide_screen"></span>',
          tooltip: "宽屏模式",
          style: {
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
          },
          click: changeWideScreen,
        },
        {
          name: "narrow-screen",
          position: "right",
          html: '<span class="iconfont icon-icl_narrow_screen_arrow"></span>',
          tooltip: "退出宽屏模式",
          style: {
            color: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
          },
          click: changeWideScreen,
        },
      ],
      // 弹幕插件（优化：增加错误捕获，避免阻塞初始化）
      plugins: [
        artplayerPluginDanmuku({
          mount: document.querySelector("#danmu") || playerRef.value,
          theme: "light",
          emitter: true,
          speed: 1, // 弹幕速度
          opacity: 0.9, // 弹幕透明度
          danmuku: async () => {
            try {
              return await loadDanmuList();
            } catch (e) {
              console.error("弹幕列表加载失败:", e);
              return []; // 失败时返回空数组，避免阻塞播放器
            }
          },
          beforeEmit: async (danmu) => {
            try {
              return await postDanmu(danmu);
            } catch (e) {
              console.error("弹幕发送失败:", e);
              return false;
            }
          },
        }),
      ],
      // 自定义HLS加载逻辑（增强错误处理）
      customType: {
        m3u8(video, url, art) {
          // 存储原生视频元素引用（关键）
          videoElement = video;
          console.debug("[HLS初始化] 开始配置HLS播放");

          // 监听视频元素关键事件
          video.addEventListener("loadedmetadata", () => {
            console.debug("[视频状态] 元数据加载成功");
          });
          video.addEventListener("loadeddata", () => {
            console.debug("[视频状态] 视频数据加载成功");
          });
          video.addEventListener("canplay", () => {
            console.debug("[视频状态] 可以开始播放");
          });
          video.addEventListener("error", (err) => {
            const errorCodes = {
              1: "加载被中止",
              2: "网络错误",
              3: "解码错误",
              4: "资源不支持"
            };
            console.error("[视频错误] 加载失败:", errorCodes[video.error.code] || "未知错误", err);
          });

          // HLS播放逻辑
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30, // 缓冲长度（秒）
              maxMaxBufferLength: 600, // 最大缓冲长度
              startLevel: -1, // 自动选择清晰度
            });

            // HLS错误监听与恢复
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("[HLS错误]", data.type, "-", data.details);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.debug("[HLS恢复] 网络错误，尝试重试");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.debug("[HLS恢复] 媒体错误，尝试恢复");
                    hls.recoverMediaError();
                    break;
                  default:
                    art.notice.show("视频加载失败，请刷新重试");
                    break;
                }
              }
            });

            // 仅当URL有效时加载
            if (url) {
              hls.loadSource(url);
              hls.attachMedia(video);
            }

            // 挂载到实例，方便后续调用
            art.hls = hls;
            player.hls = hls;

            // 播放器销毁时清理HLS实例
            art.on("destroy", () => {
              console.debug("[HLS清理] 销毁HLS实例");
              hls.destroy();
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // 浏览器原生支持HLS（如Safari）
            console.debug("[HLS兼容] 浏览器原生支持HLS");
            if (url) {
              video.src = url;
              video.load();
            }
          } else {
            // 不支持HLS格式
            console.error("[HLS兼容] 浏览器不支持HLS格式");
            art.notice.show("浏览器不支持该视频格式，请更换浏览器");
          }
        },
      },
    });

    // 播放器核心事件监听
    player.on("ready", () => {
      console.debug("[播放器状态] 初始化完成，准备就绪");
      loadRetryCount = 0; // 重置重试计数
      // 双重保障：获取视频元素
      if (!videoElement) {
        videoElement = player.template?.$player || player.video;
        console.debug("[播放器状态] 就绪后获取视频元素:", videoElement ? "成功" : "失败");
      }
      // 已有fileId则自动加载
      if (fileId.value) {
        const videoUrl = `${proxy.api.getVideoResource}/${fileId.value}`;
        loadVideo(videoUrl);
      }
    });

    player.on("play", () => {
      console.debug("[播放器状态] 视频开始播放");
    });

    player.on("pause", () => {
      console.debug("[播放器状态] 视频暂停");
    });

    player.on("error", (err) => {
      console.error("[播放器错误] 发生异常:", err);
    });

    player.on("destroy", () => {
      console.debug("[播放器状态] 已销毁");
      videoElement = null;
      player = null;
    });

    // 鼠标悬浮显示/隐藏控制栏
    player.on("hover", (state) => {
      if (player?.template?.$bottom) {
        player.template.$bottom.style.display = state ? "flex" : "none";
      }
    });

    // 视频播放完成事件
    player.on("video:ended", () => {
      console.debug("[播放器状态] 视频播放完成");
      eventBus.emit("playEnd");
    });

  } catch (e) {
    console.error("[播放器初始化] 发生致命错误:", e);
  }
};

// 4. 监听fileId变化，触发视频加载
watch(
  () => fileId.value,
  (newFileId) => {
    console.debug("[文件ID变化] 新fileId:", newFileId);
    if (newFileId) {
      loadRetryCount = 0; // 切换视频时重置重试计数
      const videoUrl = `${proxy.api.getVideoResource}/${newFileId}`;
      // 播放器未初始化则等待初始化完成
      if (!player) {
        console.debug("[文件ID变化] 播放器未初始化，等待初始化后加载");
        setTimeout(() => {
          loadVideo(videoUrl);
        }, 500);
      } else {
        loadVideo(videoUrl);
      }
    }
  },
  { immediate: true } // 初始时触发一次检查
);

// 5. 生命周期钩子
onMounted(() => {
  nextTick(() => {
    console.debug("[组件挂载] 开始初始化播放器");
    initPlayer(); // 初始化播放器

    // 监听eventBus事件更新fileId
    eventBus.on("changeP", (_fileId) => {
      console.debug("[EventBus] 收到changeP事件，fileId:", _fileId);
      fileId.value = _fileId;
    });
  });
});

// 6. 组件卸载时清理资源（避免内存泄漏）
onUnmounted(() => {
  console.debug("[组件卸载] 清理播放器资源");
  if (player) {
    player.destroy();
    player = null;
  }
  if (videoElement) {
    videoElement.pause();
    videoElement.src = "";
    videoElement = null;
  }
  eventBus.off("changeP");
  loadRetryCount = 0;
});
</script>

<style lang="scss" scoped>
// 穿透scoped确保iconfont样式生效
::v-deep .iconfont {
  font-family: "iconfont" !important;
  font-size: 20px !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.player-panel {
  width: 100%;
  box-sizing: border-box;

  .player-style {
    width: 100%;
    position: relative;
    overflow: hidden;
    background-color: #000; // 播放器背景设为黑色，提升体验

    // 确保Artplayer播放器占满容器
    :deep(.art-video-player) {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
    }

    // 播放状态图标样式
    :deep(.art-video-player .art-mask-show .art-state) {
      position: absolute;
      right: 40px;
      bottom: 50px;
      cursor: pointer;

      .art-icon-state {
        width: 60px;
        height: 60px;
        opacity: 0.8;
        transition: opacity 0.3s;

        &:hover {
          opacity: 1;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }

    // 控制栏样式优化（避免重叠）
    :deep(.art-controls-right) {
      position: relative;
      display: flex !important;
      width: auto !important;
      gap: 0;
      align-items: center;

      .art-control {
        position: relative !important;
        left: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        cursor: pointer;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  // 弹幕面板样式
  .danmu-panel {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    height: 56px;
    border-top: none;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-sizing: border-box;

    .watcher {
      width: 250px;
      color: var(--text2);
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #danmu {
      flex: 1;
      height: 100%;
      padding: 0 10px;
    }

    .close-danmu {
      flex: 1;
      color: var(--text2);
      text-align: center;
      font-size: 14px;
    }
  }

  // 弹幕设置面板样式
  :deep(.danmu-setting) {
    background: none !important;
    padding: 0 !important;
    border: none !important;

    .inner-panel {
      width: 300px;
      height: 280px;
      position: relative;

      .inner {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99999;
        color: #fff;
        padding: 10px;
      }

      .mask {
        position: absolute;
        inset: 0;
        background: #000;
        opacity: 0.6;
      }
    }
  }
}
</style>