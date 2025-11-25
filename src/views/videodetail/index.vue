<template>
    <div class="video-detail">
        <div class="video-header">
            <div class="video-title">
                <div class="title">{{ videoInfo.videoName }}</div>
                <div class="video-info">
                <div class="iconfont icon-play">{{ videoInfo.playCount }}</div>
                <div class="iconfont icon-danmushu">{{ videoInfo.danmuCount }}</div>
                <div class="iconfont">{{ videoInfo.createTime }}</div>
            </div>
            </div>
            
            <div class="video-user-info">
                <Avatar :userId="userInfo.userId" :avatar="userInfo.avatar"></Avatar>
                <div class="user-info">
                    <router-link class="nick-name" :to="`/user/${userInfo.userId}`" target="_blank">
                        {{ userInfo.nickName
                        }}
                    </router-link>
                    <div class="introduction">{{ userInfo.personIntroduction || '这个人很懒，什么都没有留下~' }}</div>
                    <div class="op-btns">
                        <router-link class="btn-go-home" :to="`/user/${userInfo.userId}`"
                            target="_blank">访问主页</router-link>
                        <div class="focus-btn">
                            <el-dropdown v-if="userInfo.haveFocus">
                                <el-button class="btn" type="info" :style="{ width: '100%' }">
                                    <span class="iconfont icon-list"></span>
                                    已关注
                                    {{ userInfo.fansCount }}
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="focusUser(-1)">取消关注</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                            <el-button class="btn" type="primary" :style="{ width: '100%' }" @click="focusUser(1)"
                                v-else>
                                关注{{ userInfo.fansCount
                                }}
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="video-body">
            <div class="video-left">
                <div class="video-panel" :style="{ position: wideScreen ? 'absolute' : 'static' }">
                    <Player ref="playerRef" @changeWideScreen="changeWideScreenHandler"></Player>
                </div>
            </div>
            <div class="video-right"></div>
        </div>
    </div>
</template>

<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    getCurrentInstance
} from "vue";
import { useNavActionStore } from "@/stores/navActionStore";
import { useLoginStore } from "@/stores/loginStore";
import Player from "@/components/Player.vue";
const navActionStore = useNavActionStore();
const loginStore = useLoginStore();
const { proxy } = getCurrentInstance();
import { useRoute } from "vue-router";
const route = useRoute();

const userInfo = ref({});

const getUserInfo = async userId => {
    let res = await proxy.request({
        url: proxy.api.uHomeGetUsesrInfo,
        params: {
            userId
        }
    });
    if (!res) {
        return;
    }
    userInfo.value = res.data;
};

const focusUser = async changeCount => {
    // 优先使用 Pinia 中的登录信息（由登录流程或 autoLogin 填充），
    // 若不存在再回退到 localStorage（兼容旧逻辑）。
    let isLogged = false;
    try {
        const lsUser = loginStore.userInfo;
        if (lsUser && Object.keys(lsUser).length > 0) {
            isLogged = true;
        }
    } catch (e) {
        isLogged = false;
    }
    if (!isLogged) {
        try {
            const raw = localStorage.getItem("userInfo");
            const storedUser = raw ? JSON.parse(raw) : null;
            if (storedUser && Object.keys(storedUser).length > 0) {
                isLogged = true;
            }
        } catch (e) {
            isLogged = false;
        }
    }
    if (!isLogged) {
        loginStore.setLogin(true);
        return;
    }

    let res = await proxy.request({
        url: changeCount == 1 ? proxy.api.uHomeFocus : proxy.api.uHomeCancelFocus,
        params: {
            focusUserId: userInfo.value.userId
        }
    });
    if (!res) {
        return;
    }
    if (changeCount == 1) {
        userInfo.value.haveFocus = true;
        userInfo.value.fansCount += 1;
    } else {
        userInfo.value.haveFocus = false;
        userInfo.value.fansCount -= 1;
    }
};

const videoInfo = ref({});
const getVideoInfo = async () => {
    let res = await proxy.request({
        url: proxy.api.getVideoInfo,
        params: {
            videoId: route.params.videoId
        }
    });
    if (!res) {
        return;
    }
    const resData = res.data.videoInfo;
    getUserInfo(resData.userId);
    videoInfo.value = resData;
};
getVideoInfo();

onMounted(() => {
    nextTick(() => {
        navActionStore.setShowHeader(false);
        navActionStore.setFixedHeader(true);
        navActionStore.setFixedCategory(false);
        navActionStore.setShowCategory(false);
        navActionStore.setForceFixedHeader(true);
    });
});

const wideScreen = ref(false);
const changeWideScreenHandler = (result) => {
    wideScreen.value = result;
};

</script>

<style lang="scss" scoped>
.video-detail {
    margin-top: 64px;
    min-height: calc(100vh - 64px);

    .video-header {
        padding-top: 20px;
        display: flex;

        .video-title {
            flex: 1;

            .title {
                font-size: 22px;
                color: var(--text);
            }
            .video-info {
                margin-top: 10px;
                display: flex;
                color: #9499a0;
                align-items: center;
                
                .iconfont {
                    margin-right: 20px;
                    font-size: 14px;
                    line-height:24px;
                    
                    &::before {
                        font-size: 18px;
                        margin-right: 3px;
                    }
                }
            }

            
        }
        
        .video-user-info {
            margin-left: 20px;
            width: 410px;
            display: flex;
            align-items: center;

            .user-info {
                flex: 1;
                margin-left: 10px;

                .nick-name {
                    font-size: 16px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    color: var(--text);
                    text-decoration: none;
                }

                .introduction {
                    color: var(--text2);
                    font-size: 13px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    margin: 3px 0px;
                }

                .op-btns {
                    display: flex;

                    .btn-go-home {
                        margin-right: 10px;
                        text-decoration: none;
                        color: #fb7299;
                        border: 1px solid #fb7299;
                        line-height: 28px;
                        border-radius: 5px;
                        padding: 0px 20px;

                        &:hover {
                            background: #ffecf1;
                        }
                    }

                    .focus-btn {
                        flex: 1;
                        width: 230px;

                        .el-dropdown {
                            width: 100%;
                        }

                        .btn {
                            width: 100%;

                            .iconfont {
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }
        }
    }

    .video-body {
        margin-top: 15px;
        position: relative;
        display: flex;

        .video-left {
            flex: 1;
        }

        .video-panel {
            position: static;
            width: 100%;
        }

        .video-right {
            margin-left: 30px;
            width: 410px;
            padding-bottom: 20px;
        }
    }
}
</style>