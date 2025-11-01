const getLocalImage = (image) =>{
    // 使用 Vite 的动态导入方式替代 require
    return new URL(`../assets/${image}`, import.meta.url).href
}


// 添加命名导出，同时保留默认导出以兼容现有代码
export { getLocalImage };

export default {
    getLocalImage,
}
