import { ElMessage } from "element-plus";

const showMessage = (msg,callback,type) =>{
    ElMessage({
        message: msg,
        type: type,
        duration: 2000,
        offset: 200,
        onClose: () => {
            if(callback) callback();
        }
    });
}

const message = {
    error: (msg,callback) => {
        showMessage(msg,callback,'error');
    },
    success: (msg,callback) => {
        showMessage(msg,callback,'success');
    },
    warning: (msg,callback) => {
        showMessage(msg,callback,'warning');
    },
    info: (msg,callback) => {
        showMessage(msg,callback,'info');
    }
    
}
export default message;