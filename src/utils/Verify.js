
const regs = {
    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
}
const verify = (rule,value,reg,callback) => {
    if(value){
        if(reg.test(value)){
            callback()
        }else{
            callback(new Error(`请输入正确的${rule.field}`))
        }
    }else{
        callback(new Error(`${rule.field}不能为空`))
    }
}

export default{
    email: (rule,value,callback) => {
       return verify(rule,value,regs.email,callback)
    },
    password: (rule,value,callback) => {
         return verify(rule,value,regs.password,callback)
    }
}