import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const useLoginStore = defineStore('loginStore', {
    state: () => {
        return {
            showLogin: false,
            // showRegister: false,
            userInfo: {

            }
        }
    },
    actions: {
        setLogin(show) {
            this.showLogin = show;
        },
        // setRegister(show) {
        //     this.showRegister = show;
        // },
        saveUserInfo(info) {
            this.userInfo = info;
        }
    }
})

export {
    useLoginStore
}