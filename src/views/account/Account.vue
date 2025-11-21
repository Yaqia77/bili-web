<template>
  <Dialog
    :show="loginStore.showLogin"
    :buttons="dialogConfig.buttons"
    width="800px"
    :showCancel="false"
    @close="closeDialog"
  >
    <div class="dialog-panel">
      <div class="bg">
        <img src="../../assets/user.png" alt="" />
      </div>
      <el-form
        ref="formDataRef"
        :model="formData"
        :rules="rules"
        @submit.prevent
        class="login-register"
      >
        <div class="tab-panel">
          <div :class="[opType == 0 ? '' : 'active']" @click="showPanel(0)">
            登录
          </div>
          <el-divider direction="vertical"></el-divider>
          <div :class="[opType == 1 ? '' : 'active']" @click="showPanel(1)">
            注册
          </div>
        </div>
        <el-form-item prop="email">
          <el-input
            clearable
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            :maxlength="150"
            size="large"
          >
            <template #prefix>
              <span class="iconfont icon-youxiang"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" v-if="opType == 0">
          <el-input
            clearable
            show-password
            placeholder="请输入密码"
            v-model.trim="formData.password"
            size="large"
          >
            <template #prefix>
              <span class="iconfont icon-mima"></span>
            </template>
          </el-input>
        </el-form-item>
        <div v-if="opType == 1">
          <el-form-item prop="nickName">
            <el-input
              clearable
              placeholder="请输入昵称"
              v-model.trim="formData.nickName"
              :maxlength="150"
              size="large"
            >
              <template #prefix>
                <span class="iconfont icon-user"></span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="registerPassword">
            <el-input
              clearable
              show-password
              placeholder="请输入密码"
              v-model.trim="formData.registerPassword"
              size="large"
            >
              <template #prefix>
                <span class="iconfont icon-mima"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input
              clearable
              show-password
              placeholder="请再次输入密码"
              v-model.trim="formData.reRegisterPassword"
              size="large"
            >
              <template #prefix>
                <span class="iconfont icon-mima"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <div class="input">
              <el-input
                clearable
                placeholder="请输入验证码"
                v-model.trim="formData.checkCode"
                size="large"
              >
                <template #prefix>
                  <span class="iconfont icon-yanzhengyanzhengma"></span>
                </template>
              </el-input>
            </div>
            <img :src="checkCodeInfo.checkCode" @click="changeCheckCode" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="doSubmit"
            class="login-btn"
            size="large"
          >
            <span v-if="opType == 0">登录</span>
            <span v-if="opType == 1">注册</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>
<script setup>
import { ref, getCurrentInstance, nextTick, onMounted,onUpdated } from "vue";
import Dialog from "@/components/Dialog.vue";

import md5 from "js-md5";
import { useLoginStore } from "@/stores/loginStore";
const loginStore = useLoginStore();
const { proxy } = getCurrentInstance();

const checkCodeInfo = ref({});
const changeCheckCode = async () => {
  let result = await proxy.request({
    url: proxy.api.checkCode,
  });
  if (!result) {
    return;
  }
  checkCodeInfo.value = result.data;
};


console.log("global proxy", proxy.verify);

const opType = ref(0); //0: login 1: register
const formDataRef = ref(null);
const dialogConfig = ref({
  buttons: [],
});

const formData = ref({});

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      // type: "email",
      // message: "请输入正确的邮箱格式",
      // trigger: ["blur", "change"],
      validator: proxy.verify.email,
    },
  ],
  nickName: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "昵称长度在2到20个字符之间",
      trigger: ["blur", "change"],
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 6,
      max: 18,
      message: "密码只能是数字、字母,长度在8到20个字符之间",
      trigger: ["blur", "change"],
    },
  ],
  registerPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      validator: proxy.verify.password,
      message: "密码只能是数字、字母,长度在8到20个字符之间",
      trigger: ["blur", "change"],
    },
  ],
  reRegisterPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: checkRePassword,
      message: "两次输入的密码不一致",
    },
  ],
  checkCode: [{ required: true, message: "请输入图片验证码", trigger: "blur" }],
};

const resetForm = () => {
  changeCheckCode();
  nextTick(() => {
    formDataRef.value?.resetFields && formDataRef.value.resetFields();
    formData.value = {};
  });
};

const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    params.checkCodeKey = checkCodeInfo.value.checkCodeKey;
    if (opType.value == 0) {
      // console.log("加密前的密码:", params.password);
      params.password = md5(params.password);
      // console.log("加密后的密码:", params.password);
    }
    console.log("1111", params);

    let result = await proxy.request({
      url: opType.value == 1 ? proxy.api.register : proxy.api.login,
      params,
      errorCallback: () => {
        changeCheckCode();
      },
    });
    if (!result) {
      return
    }
    if(opType.value == 1){
      proxy.message.success("注册成功，请登录")
      showPanel(0)
    }else if(opType.value == 0){
      proxy.message.success("登录成功")
      loginStore.setLogin(false)
      loginStore.saveUserInfo(result.data)
    }
    closeDialog()
    // 显示登录面板回到“登录”页签
    showPanel(0)
    
  });
};
const closeDialog = () => {
  // 仅通过状态关闭登录弹窗，不直接操作 Header 的 DOM
  loginStore.setLogin(false)
  // 点击登录后，关闭弹窗，设置display为none，使用document.querySelector获取弹窗元素
  // const loginTooltip = document.querySelector('.login-tooltip');
  // loginTooltip.style.display = 'block';
}
onUpdated(() => {
  showPanel(0)
})
const showPanel = (type) => {
  opType.value = type;
  resetForm();
}
// onMounted(() => {
//   showPanel(0);
// });
</script>
<style lang="scss" scoped>
.dialog-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  .bg {
    width: 300px;
    height: 450px;
    overflow: hidden;
    img {
      width: 100%;
    }
  }
  .login-register {
    margin-bottom: 10em;
    width: 350px;
    .tab-panel {
      margin: 10px auto;
      display: flex;
      width: 130px;
      font-size: 18px;
      align-items: center;
      //space-around设置均匀分布
      justify-content: space-around;
      cursor: pointer;
      .active {
        color: var(--blue2);
      }
    }
    .no-account {
      width: 100%;
      display: flex;
      //space-between设置两端对齐
      justify-content: space-between;
    }
    .login-btn {
      width: 100%;
    }
    .buttom-btn {
      margin-bottom: 0px;
    }
  }
}
.check-code-panel {
  cursor: pointer;
  display: flex;
  //center设置垂直居中
  align-items: center;
  width: 100%;
  .input {
    flex: 1;
  }
  .right-panel {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>