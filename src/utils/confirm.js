import { ElMessageBox } from "element-plus";

const confirm = ({message,okfun,showCancelBtn = true, okText='确定'}) =>{
    ElMessageBox.confirm(
        message,
        '提示',{
            "close-on-click-modal": false,
            showCancelButton: showCancelBtn,
            confirmButtonText: okText,
            cancelButtonText: '取消',
            type:'info'
        }
    ).then( async() => {
        if(okfun) await okfun();
    }
    ).catch(() => {
    });
}
export default confirm;