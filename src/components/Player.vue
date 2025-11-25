<template>
  <div class="player-panel">
    <div class="player-style" ref="playerRef" :style="{ height: playerHeight + 'px' }">
      <div class="danmu-panel">
        <div class="watcher">{{ onLineCount }} 人正在观看,已装填{{ danmuCount }}条弹幕</div>
        <div id="danmu" v-show="showDanmu"></div>
        <div class="close-danmu" v-show="!showDanmu">已关闭弹幕</div>
      </div>
      <div id="play">
        <img :src="getLocalImage('play.png')" alt />
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
const route = useRoute();
const { proxy } = getCurrentInstance();
const loginStore = useLoginStore();
const playerRef = ref();

let player = null;
const initPlayer = () => {
  //隐藏右键菜单
  Artplayer.CONTEXTMENU = false;
  //自动回放功能的最大记录数，默认为10
  Artplayer.AUTO_PLAYBACK_MAX = 20;
  //自动回放功能的最小记录时长，单位为秒，默认为5
  Artplayer.AUTO_PLAYBACK_MIN = 10;

  player = new Artplayer({
    container: playerRef.value,
    url: ``,
    type: "m3u8",
    customType: {
      m3u8(video, url, art) {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on("destroy", () => hls.destroy());
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          art.notice.show = "浏览器暂不支持该播放器";
        }
      }
    },
    theme: "#23ade5",
    volume: 0.7, //默认音量
    autoplay: true, //自动播放
    loop: false, //循环播放
    autoMini: false, //当播放器滚动到视口以外时，自动进入迷你播放器
    fullscreen: true, //是否开启全屏
    settings: [],
    pip: true, //画中画
    playbackRate: true, //播放速度
    flip: true, //翻转
    aspectRatio: true, //宽高比
    screenshot: true, //截屏
    autoPlayback: true, //自动回放
    icons: {
      state: document.querySelector("#play")
    },
    controls: [
      {
        name: "wide-screen",
        position: "right",
        html: '<span class="iconfont icon-wide-screen"></span>',
        tooltip: "宽屏模式",
        style: {
          color: "#fff",
          display: "flex"
        },

        click(...args) {
          changeWideScreen();
        }
      },
      {
        name: "narrow-screen",
        position: "right",
        html: '<span class="iconfont icon-narrow-screen"></span>',
        tooltip: "退出宽屏模式",
        style: {
          color: "#fff",
          display: "none"
        },
        click(...args) {
          changeWideScreen();
        }
      }
    ],
    plugins: [
      artplayerPluginDanmuku({
        mount: document.querySelector("#danmu"),
        theme: "light",
        emitter: true,
        danmuku() {
          return new Promise(async resolve => {
            const danmuList = await loadDanmuList();
            return resolve(danmuList);
          })
        },
        beforeEmit: async (danmu) => {
          let result = await postDanmu(danmu)
          loadDanmuList();
          if (!result) {
            return false
          }
          eventBus.emit('danmSend')
          proxy.message.success('弹幕发送成功')
          return true
        }
      })
    ],


  });
  player.on('hover', (state) => {
    let display = 'none'
    if (state) {
      display = 'flex'
    }
    player.template.$bottom.style.display = display
  })
  player.on('video:ended', (e) => {
    eventBus.emit("playEnd");
  })
}

onMounted(() => {
  nextTick(() => {
    initPlayer();
  })
})

const playerHeight = ref(500);

const fileId = ref()
const danmuCount = ref(0);
const loadDanmuList = async() => {
  if (!fileId.value) {
    return []
  }
  let res = await proxy.request({
    url: proxy.api.loadDanmu,
    params: {
      fileId: fileId.value,
      videoId:route.params.videoId
    }

  })
  if (!res) {
    return
  }
  eventBus.emit('loadDanmu', res.data)
  danmuCount.value = res.data.length
  return res.data
}

</script>

<style lang="scss" scoped>
.player-panel {
  .player-style {
    width: 100%;

    :deep(.art-video-player .art-mask-show .art-state) {
      position: absolute;
      right: 40px;
      bottom: 50px;

      .art-icon-state {
        width: 60px;
        height: 60px;

        img {
          width: 100%;
        }
      }
    }

    :deep(.art-controls-right) {
      position: relative;
      display: block;
      width: 280px;

      .art-control {
        position: absolute;
      }

      //截屏
      .art-control-screenshot {
        left: 0px;
      }

      //设置按钮
      .art-control-setting {
        left: 46px;
      }

      //画中画
      .art-control-pip {
        left: 92px;
      }

      //宽屏
      .art-control-wide-screen,
      .art-control-narrow-screen {
        left: 138px;

        .iconfont {
          font-size: 20px;
        }
      }

      //网页全屏
      .art-control-fullscreenWeb {
        left: 184px;
      }

      //全屏按钮
      .art-control-fullscreen {
        left: 230px;
      }
    }
  }

  .danmu-panel {
    box-shadow: 0 2px 6px #ddd;
    height: 56px;
    border-top: none;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0px 15px;

    .watcher {
      width: 250px;
      color: var(--text2);
    }

    #danmu {
      flex: 1;
    }

    .close-danmu {
      flex: 1;
      color: var(--text2);
      text-align: center;
    }
  }

  :deep(.danmu-setting) {
    background: none !important;
    padding: 0px;
    border: none;

    .inner-panel {
      width: 300px;
      height: 280px;
      position: relative;

      .inner {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 99999;
        color: #fff;
      }

      .mask {
        position: absolute;
        top: 0px;
        right: 0px;
        left: 0px;
        bottom: 0px;
        background: #000;
        opacity: 0.6;
      }
    }
  }
}
</style>