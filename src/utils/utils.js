import moment from 'moment'



const getLocalImage = (image) => {
    // 使用 Vite 的动态导入方式替代 require
    return new URL(`../assets/${image}`, import.meta.url).href
}
const formatDate = (timestamp) => {
    const timestampTime = moment(timestamp)
    const days = Number.parseInt(moment().format("YYYYMMDD")) - Number.parseInt(timestampTime.format("YYYYMMDD"))
    if (days === 0) {
        return timestampTime.format("HH:mm")
    } else if (days === 1) {
        return "昨天 " + timestampTime.format("HH:mm")
    } else if (days >= 2 && days < 7) {
        return timestampTime.format("dddd")
    }
    else if (days >= 7) {
        return timestampTime.format("YYYY-MM-DD")
    }

}

const convertSccondsToHMS = (seconds) => {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    return (
        (hours == 0 ? "" : hours.toString().padStart(2, '0') + ":") + minutes.toString().padStart(2, '0') + ":" + remainingSeconds.toString().padStart(2, '0')
    );

}


// 添加命名导出，同时保留默认导出以兼容现有代码
export { getLocalImage, formatDate, convertSccondsToHMS };

export default {
    getLocalImage, formatDate, convertSccondsToHMS
}
