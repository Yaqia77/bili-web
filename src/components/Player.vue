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
      <div id="play" style="display: flex; align-items: center; justify-content: center;">
        <img :src="getLocalImage('play.png')" alt="播放" style="width:64px;height:64px;opacity:0.9" />
      </div>

      <!-- 错误覆盖层：加载失败时显示错误信息与重试按钮 -->
      <div v-if="loadError" class="player-error-overlay">
        <div class="error-box">
          <div class="error-msg">{{ errorMessage || '请求地址不存在, 请仔细检查URL地址' }}</div>
          <el-button type="danger" size="small" @click="retryLoad">重试</el-button>
        </div>
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
const loadError = ref(false);
const errorMessage = ref('');
const triedFallback = ref(false);
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
  // Artplayer 实例不一定暴露 controls 为数组，直接通过 DOM 查找我们的自定义按钮更可靠
  try {
    const bottom = player?.template?.$bottom || playerRef.value;
    if (!bottom) {
      console.warn("未找到播放器底部容器，用于切换宽屏");
      return;
    }

    const wideIcon = bottom.querySelector?.('.icon-wide-screen');
    const narrowIcon = bottom.querySelector?.('.icon-narrow-screen');

    const wideWrapper = wideIcon ? wideIcon.closest('.art-control') || wideIcon.parentElement : null;
    const narrowWrapper = narrowIcon ? narrowIcon.closest('.art-control') || narrowIcon.parentElement : null;

    if (!wideWrapper || !narrowWrapper) {
      console.warn('未找到宽屏/窄屏控件的 DOM 元素');
      return;
    }

    // 根据当前显示状态切换
    const isWide = wideWrapper.style.display === 'none' || getComputedStyle(wideWrapper).display === 'none';
    if (isWide) {
      // 目前处于宽屏状态，切换回普通
      playerHeight.value = 500;
      wideWrapper.style.display = 'flex';
      narrowWrapper.style.display = 'none';
      emit('changeWideScreen', false);
    } else {
      // 切换为宽屏
      playerHeight.value = 300;
      wideWrapper.style.display = 'none';
      narrowWrapper.style.display = 'flex';
      emit('changeWideScreen', true);
    }
  } catch (e) {
    console.error('切换宽屏失败:', e);
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
    // 如果还没试过回退流，先尝试回退示例流
    if (!triedFallback.value) {
      triedFallback.value = true;
      const fallback = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
      console.debug('[视频加载] 达到最大重试，尝试回退示例流', fallback);
      loadRetryCount = 0;
      setTimeout(() => loadVideo(fallback), 200);
      return;
    }
    // 最终失败，展示错误信息
    loadError.value = true;
    errorMessage.value = errorMsg;
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
      try { videoElement.play().catch(()=>{}); } catch(e){}
      try { player.play && player.play(); } catch(e){}
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
      try { videoElement.play().catch(()=>{}); } catch(e){}
      try { player.play && player.play(); } catch(e){}
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
  // 失败或重试时确保控制栏可见，便于用户交互
  try {
    if (player?.template?.$bottom) player.template.$bottom.style.display = 'flex';
  } catch (e) {}
};

/**
 * 根据 fileId 探测可能的 m3u8 地址并返回首个可用的 URL
 * 尝试顺序：
 * - /api/file/videoResource/<id>
 * - /api/file/videoResource/<id>.m3u8
 * - /api/file/videoResource/<id>/index.m3u8
 * - /api/file/videoResource/<id>/master.m3u8
 * 如果 HEAD 不被服务器接受，会尝试 GET 校验
 */
const findPlayableUrl = async (id) => {
  if (!id) return null;
  // 使用 /api 前缀以便走 Vite dev proxy（前端在开发时通过 /api 转发到后端）
  const base = `/api${proxy.api.getVideoResource}/${id}`;
  const candidates = [
    base,
    `${base}.m3u8`,
    `${base}/index.m3u8`,
    `${base}/master.m3u8`,
    `${base}/playlist.m3u8`,
  ];

  for (const url of candidates) {
    try {
      // 先用 HEAD 探测，部分服务器可能不允许 HEAD
      let ok = false;
      try {
        const headResp = await fetch(url, { method: 'HEAD' });
        ok = headResp && headResp.ok;
      } catch (e) {
        // HEAD 失败时尝试 GET（只读取头部）
        try {
          const getResp = await fetch(url, { method: 'GET' });
          ok = getResp && getResp.ok;
        } catch (e2) {
          ok = false;
        }
      }

      if (ok) {
        console.debug('[探测播放地址] 找到可用地址:', url);
        return url;
      }
    } catch (e) {
      console.debug('[探测播放地址] 检查地址失败', url, e);
    }
  }
  console.debug('[探测播放地址] 未找到可用播放地址 for', id);
  return null;
};

/**
 * 将可能的绝对后端地址规范为相对 /api 路径，利用 Vite dev proxy 避免跨域问题
 * 例如：将 `http://localhost:8000/api/file/videoResource/ID` -> `/api/file/videoResource/ID`
 */
const normalizeToProxyPath = (url) => {
  if (!url) return url;
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      // 如果是同源则直接返回原始路径+search+hash
      if (u.origin === location.origin) return u.pathname + u.search + u.hash;
      // 否则如果路径以 /api/ 开头，返回路径部分以走代理
      if (u.pathname.startsWith('/api/')) {
        return u.pathname + u.search + u.hash;
      }
      // 其他绝对地址无法代理，直接返回原
      return url;
    }
    return url;
  } catch (e) {
    return url;
  }
};

const retryLoad = () => {
  loadRetryCount = 0;
  loadError.value = false;
  errorMessage.value = '';
  triedFallback.value = false;
    if (fileId.value) {
      loadVideo(`/api${proxy.api.getVideoResource}/${fileId.value}`);
  }
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
      // 启用播放速度控制（Artplayer 要求为 boolean），自定义速率列表如需可在后续扩展
      playbackRate: true,
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
          html: '<span class="iconfont icon-narrow-screen"></span>',
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
      // 控制栏默认显示（参考目标样式，保持控制可见）
      try {
        if (player?.template?.$bottom) player.template.$bottom.style.display = 'flex';
      } catch (e) {}
      // 已有fileId则自动加载
      if (fileId.value) {
        const videoUrl = `/api${proxy.api.getVideoResource}/${fileId.value}`;
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
      try { if (player?.template?.$bottom) player.template.$bottom.style.display = 'flex'; } catch(e){}
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
      // 先探测可用的播放地址（更可靠），若找不到再回退到基础路径
      (async () => {
        const candidate = await findPlayableUrl(newFileId);
        const base = `api${proxy.api.getVideoResource}/${newFileId}`;
        const videoUrl = normalizeToProxyPath(candidate || base);
        if (!player) {
          console.debug("[文件ID变化] 播放器未初始化，等待初始化后加载");
          setTimeout(() => {
            loadVideo(videoUrl);
          }, 500);
        } else {
          loadVideo(videoUrl);
        }
      })();
    }
  },
  { immediate: true } // 初始时触发一次检查
);

// 5. 生命周期钩子
onMounted(() => {
  nextTick(() => {
    console.debug("[组件挂载] 开始初始化播放器");
    initPlayer(); // 初始化播放器

    // 监听eventBus事件更新fileId：优先向后端请求可播放 URL（签名/直链），若失败则回退为原始 fileId
    eventBus.on("changeP", async (_fileId) => {
      console.debug("[EventBus] 收到changeP事件，fileId:", _fileId);
      if (!_fileId) return;
      try {
        // 先尝试让后端返回可直接播放的 URL（如果后端提供）
        // 直接尝试 GET 请求后端路径 /api/file/videoResource/<id>
        try {
          const path = normalizeToProxyPath(`api${proxy.api.getVideoResource}/${_fileId}`);
          console.debug('[EventBus] 直接 GET 探测后端播放清单:', path);
          const resp = await fetch(path, { method: 'GET', credentials: 'include' });
          if (resp && resp.ok) {
            const ct = resp.headers.get('content-type') || '';
            // 如果是 m3u8 或文本以 #EXTM3U 开头，认为是播放清单
            const text = await resp.text();
            if (ct.includes('application/vnd.apple.mpegurl') || ct.includes('application/x-mpegURL') || text.trim().startsWith('#EXTM3U')) {
              console.debug('[EventBus] 后端返回 m3u8 清单，使用此路径播放:', path);
              loadRetryCount = 0;
              triedFallback.value = false;
              loadError.value = false;
              errorMessage.value = '';
              loadVideo(path);
              return;
            }
            // 如果返回 JSON 错误对象，尝试解析并记录
            try {
              const j = JSON.parse(text);
              console.debug('[EventBus] getVideoResource 返回 JSON:', j);
            } catch (e) {
              console.debug('[EventBus] getVideoResource 返回非 m3u8 文本，继续探测', e);
            }
          } else {
            console.debug('[EventBus] GET /api/file/videoResource 返回非 2xx:', resp && resp.status);
          }
        } catch (e) {
          console.debug('[EventBus] 直接 GET getVideoResource 发生异常，继续探测候选路径', e);
        }

        // 如果后端未直接返回播放地址，探测多个候选 m3u8 路径
        const candidate = await findPlayableUrl(_fileId);
        if (candidate) {
          const norm = normalizeToProxyPath(candidate);
          console.debug('[EventBus] 探测到可用地址', candidate, '->', norm);
          loadRetryCount = 0;
          triedFallback.value = false;
          loadError.value = false;
          errorMessage.value = '';
          loadVideo(norm);
          return;
        }
      } catch (e) {
        console.debug('[EventBus] 请求 getVideoResource 失败，回退使用 fileId 拼接路径', e);
      }
      // 回退逻辑：设置 fileId，由 watch 驱动拼接并加载
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

  // 强制显示控制栏与大播放按钮（避免被 hover/样式隐藏）
  :deep(.art-bottom) {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  :deep(.art-state) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
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