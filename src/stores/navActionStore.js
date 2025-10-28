import { defineStore } from "pinia";

const useNavActionStore = defineStore("navAction", {
  state: () => ({
    fixedHeight: true, 
    fixedCategory: true,
    showHeader: true,
    showCategory: true,
    forceFixedHeight: false,
  }),
  actions: {
    setFixedHeight(fixedHeight) {
      this.fixedHeight = fixedHeight;
    },
    setFixedCategory(fixedCategory) {
      this.fixedCategory = fixedCategory;
    },
    setShowHeader(showHeader) {
      this.showHeader = showHeader;
    },
    setShowCategory(showCategory) {
      this.showCategory = showCategory;
    },
    setForceFixedHeight(forceFixedHeight) {
      this.forceFixedHeight = forceFixedHeight;
    },
  }
});

export{
    useNavActionStore,
}