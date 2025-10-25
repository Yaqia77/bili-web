const getLocalImage = (image) =>{
    return require(`@/assets/${image}`,import.meta.url)
}

export default {
    getLocalImage,
}
