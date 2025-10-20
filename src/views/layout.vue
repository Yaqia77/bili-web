<template>
    <div class="main-container"
    :style="{
        'max-width': proxy.bodyMaxWidth +'px',
        'min-width': proxy.bodyMinWidth +'px'
        }"
    >
    <div>
        <LayoutHeader/>
    </div>
    <div class="header" v-if="showFixedHeader"></div>
    <div class="header-fixed" v-else></div>
    </div>
</template>
<script  setup>
import LayoutHeader from '@/components/LayoutHeader.vue'
import { ref,onMounted,getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance()


const showFixedHeader = ref(true)

onMounted(()=>{
    window.addEventListener("scroll",windowScrollHandler)
})
const windowScrollHandler = () =>{
    const curScrollTop = window.scrollY
    if(curScrollTop <= 20){
        showFixedHeader.value = false
    }else{
        showFixedHeader.value = true
    }
}

</script>
<style lang="scss"  scoped>
.main-container{
    background: #fff;
    margin:0px auto;
    min-height: calc(100vh);
}
.header{
    margin: 0 auto;
    background-color: #7c9ce1;
    height: 180px;
    background-position: center;
    width: 100%;
    position: relative;
    background-image: url(../assets/header-img.png);
}
</style>