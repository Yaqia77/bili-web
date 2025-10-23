import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const useLoginStore = defineStore('loginStore', {
    state: () => {
        return {
            showLogin: false,
            userInfo: {

            }
        }
    },
    actions: {
        setLogin(show) {
            this.showLogin = show;
        },
        saveUserInfo(info) {
            this.userInfo = info;
        }
    }
})

export {
    useLoginStore
} 