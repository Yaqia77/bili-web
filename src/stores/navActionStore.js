import { defineStore } from "pinia";

const useNavActionStore = defineStore("navAction", {
  state: () => ({
    fixedHeader: true, 
    fixedCategory: true,
    showHeader: true,
    showCategory: true,
    forceFixedHeader: false,
  }),
  actions: {
    setFixedHeader(fixedHeader) {
      this.fixedHeader = fixedHeader;
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
    setForceFixedHeader(forceFixedHeader) {
      this.forceFixedHeader = forceFixedHeader;
    },
  }
});

export{
    useNavActionStore,
}