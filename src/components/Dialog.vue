<template>
  <el-dialog
    :show-close="showClose"
    :draggable="draggable"
    :model-value="show"
    :close-on-click-modal="false"
    class="cust-dialog"
    :top="top + 'px'"
    :width="width"
    @close="close"
  >
    <template #header>
      <div v-if="title" class="title">
        {{ title }}
      </div>
      <slot v-else name="header"></slot>
    </template>
    <div
      class="dialog-body"
      :style="{ 'max-height': maxHeight + 'px', padding: padding + 'px' }"
    ></div>
    <slot></slot>
    <template v-if="(buttons && buttons.length > 0) || showCancel">
      <div class="dialog-footer">
        <el-button link @click="close" v-if="showCancel">取消</el-button>
        <el-button
          v-for="btn in buttons"
          :key="btn"
          :type="btn.type || 'primary'"
          @click="btn.click"
          >{{ btn.text }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: "30%",
  },
  top: {
    type: Number,
    default: 50,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  draggable: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "",
  },
  maxHeight: {
    type: Number,
  },
  padding: {
    type: Number,
    default: 15,
  },
  buttons: {
    type: Array,
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
});

const maxHeight = window.innerHeight - props.top - 120;
const emit = defineEmits(["update:show", "close"]);
const close = () => {
  // emit v-model style update and also a generic close event
  emit("update:show", false);
  emit("close");
};
</script>
<style lang="scss" scoped>
.cust-dialog {
  padding: 0px !important;
  margin-bottom: 5px !important;
  .el-dialog__header {
    padding: 16px;
  }
  .title {
    font-size: 20px;
    color: #000;
  }
  .dialog-body {
    min-height: 80px;
    overflow: auto;
    overflow-x: hidden;
    padding: 20px;
  }
  .dialog-footer {
    border-top: 1px solid #ddd;
    text-align: right;
    padding: 5px 20px;
  }
}
</style>