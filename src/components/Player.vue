<template>
    <div class="player-panel">
        <div class="player-style" ref="playerRef" :style="{height:playerHeight + 'px'}">
            <div class="danmu-panel">
                <div class="watcher">
                    {{ onLineCount }} 人正在观看,已装填{{ danmuCount }}条弹幕
                </div>
                <div id="danmu" v-show="showDanmu"></div>
                <div class="close-danmu" v-show="!showDanmu">已关闭弹幕</div>
            </div>
            <div id="play"><img :src="getLocalImage('play.png')" alt=""></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick,onUnmounted } from "vue";
import { getLocalImage } from "@/utils/utils.js";
import eventBus from "@/eventbus/eventBus.js";
import Hls from "hls.js";
import Artplayer from "artplayer";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { useLoginStore } from "@/stores/loginStore";
const loginStore = useLoginStore();
const playerRef = ref()

let player = null


</script>

<style lang="scss" scoped>
.player-panel{
    .player-style{
        width:100%;
        :deep(.art-video-player .art-mask-show .art-state){
            position: absolute;
            right: 40px;
            bottom: 50px;

            .art-icon-state{
                width:60px;
                height:60px;
                img{
                    width: 100%;
                }
            }
        }
        :deep(.art-controls-right){
            position: relative;
            display:block;
            width: 280px;
            
            .art-control{
                position: absolute;
            }
            //截屏
            .art-control-screenshot{
                left: 0px;
            }
            //设置按钮
            .art-control-setting{
                left: 46px;
            }
            //画中画
            .art-control-pip{
                left: 92px;
            }
            //宽屏
            .art-control-wide-screen,.art-control-narrow-screen{
                left: 138px;
                .iconfont{
                    font-size: 20px;
                }
            }
            //网页全屏
            .art-control-fullscreenWeb{
                left: 184px;
            }
            //全屏按钮
            .art-control-fullscreen{
                left: 230px;
            }
        }
    }
    .danmu-panel{
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
        #danmu{
            flex:1;
        }

        .close-danmu{
            flex:1;
            color: var(--text2);
            text-align: center;
        }
    }

    :deep(.danmu-setting){
        background: none !important;
        padding: 0px;
        border: none;
        .inner-panel{
            width: 300px;
            height: 280px;
            position: relative;

            .inner{
                position: absolute;
                left: 0px;
                top: 0px;
                z-index: 99999;
                color: #fff;
            }
            .mask{
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