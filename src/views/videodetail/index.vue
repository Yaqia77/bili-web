<template>
    <div>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, getCurrentInstance } from 'vue'
import { useNavActionStore } from '@/stores/navActionStore'
const navActionStore = useNavActionStore()
const { proxy } = getCurrentInstance();
onMounted(() => {
    nextTick(() => {
        navActionStore.setShowHeader(false)
        navActionStore.setFixedHeader(true)
        navActionStore.setFixedCategory(false)
        navActionStore.setShowCategory(false)
        navActionStore.setForceFixedHeader(true)
    })
})  
</script>

<style lang="scss" scoped>
.video-detail{
    margin-top: 64px;
    min-height:calc(100vh - 64px);
    .video-header{
        padding-top: 20px;
        display:flex;
        .video-title{
            flex: 1;
            .title{
                font-size: 22px;
            }
            .video-info{
                margin-top: 10px;
                display: flex;
                color: #9499a0;

                .iconfont{
                    margin-right: 20px;
                    font-size: 14px;

                    &::before {
                        font-size: 18px;
                        margin-right: 3px;
                    }
                }
            }
        }
        .video-user-info{
            margin-left: 20px;
            width: 410px;
            display: flex;
            align-items: center;
            .user-info{
                flex: 1;
                margin-left: 10px;
                .nick-name{
                    font-size: 16px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    color: var(--text);
                    text-decoration: none;
                }
                .introduction{
                    color: var(--text2);
                    font-size: 13px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    margin:3px 0px;
                }
                .op-btns{
                    display: flex;
                    .btn-go-home{
                        margin-right: 10px;
                        text-decoration: none;
                        color: #fb7299;
                        border:1px solid #fb7299;
                        line-height: 28px;
                        border-radius: 5px;
                        padding: 0px 20px;

                        &:hover{
                            background: #ffecf1;
                        }
                    }
                    .focus-btn{
                        flex: 1;
                        width:230px;
                        .el-dropdown{
                            width: 100%;
                        }
                        .btn{
                            width: 100%;
                            .iconfont{
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }
        }
    }
    .video-body{
        margin-top: 20px;
        position:relative;
        display: flex;
        .video-left{
            flex:1;
        }
        .video-panel{
            position: static;
            width: 100%;
        }
        .video-right{
            margin-left:30px;
            width:410px;
            padding-bottom:20px;
        }
    }
}
</style>