import { defineStore } from 'pinia'

const useCategoryStore = defineStore('categoryStore', {
    state: () => {
        return {
            categoryList: [],
            categoryMap: {},
            currentPCategory: {},
        }
    },
    actions:{
        saveCategoryMap(data){
            this.categoryMap = data
        },
        saveCategoryList(data){
            this.categoryList = data
        },
        setcurrentPCategory(data){
            if(data){
                this.currentPCategory = this.categoryMap[data] || {}
            }else{
                this.currentPCategory = {}
            }
        }
    }
})
export {
    useCategoryStore
}
