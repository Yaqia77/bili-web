<template>
  <div>
    <router-link v-if="userId" :to="`/user/${userId}`" target="_blank">
      <Cover
        :lazy="lazy"
        :width="width"
        :source="avatar"
        :defaultImage="defaultAvatar"
        borderRadius="50%"
        :scale="1"
      ></Cover>
    </router-link>
    <div v-else class="avatar-wrapper">
      <Cover
        :lazy="lazy"
        :width="width"
        :source="avatar"
        :defaultImage="defaultAvatar"
        borderRadius="50%"
        :scale="1"
      ></Cover>
      <div class="login-label">登录</div>
    </div>
  </div>
</template>
<script  setup>
import {ref} from 'vue'

const defaultAvatar = ref("user.png")

const props = defineProps({
  userId: {
    type: String,
  },
  avatar: {
    type: String,
  },
  width: {
    type: Number,
    default: 50,
  },
  lazy: {
    type: Boolean,
    default: true,
  },
})



</script>
<style  lang="scss" scoped>
.avatar-wrapper{
  position: relative;
  display: inline-block;
}
.login-label{
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  z-index: 2;
  pointer-events: none;
}

</style>