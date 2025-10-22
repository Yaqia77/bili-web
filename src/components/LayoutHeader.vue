<template>
    <div :class="['header-bar', 'header-bar-' + props.theme]">
        <div class="menu">
            <router-link class="iconfont icon-wf_Bzhan" to="/">首页</router-link>
        </div>
        <div class="search-body">
            <div class="search-panel">
                <div class="search-panel-inner">
                    <div class="input-panel">
                        <input type="text">
                        <div class="iconfont icon-sousuo"></div>
                    </div>

                </div>
            </div>
        </div>
        <div class="user-panel">
            <div class="user-avatar">
                <img src="../assets/user.png" alt="">
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
                <el-button type="primary" @click="() => { }" size="large">
                    <span class="iconfont icon-24px"></span>
                    <span>投稿</span>
                </el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';

const props = defineProps({
    theme: {
        type: String,
        default: 'light' // light | dark
    }

});

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
                    .iconfont{
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
                        &:hover{
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
        gap: 12px;

        .user-avatar {
            width: 35px;
            height: 35px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
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
                gap: 8px
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