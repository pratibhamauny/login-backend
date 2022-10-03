const util=require("../utils/util")
const auth=require("../utils/auth")

async function verify(requestBody){
    if(!requestBody.user||!requestBody.user.username||!requestBody.token){
        return util.buildResponse(401,{
            verified:false,
            message:'Incorrect request body.'
            })
    }

    const user=requestBody.user;
    const token=requestBody.token;
    const verification=auth.verifyToken(user.username.toLowerCase().trim(),token);
    if(!verification.verified){
        return util.buildResponse(401,verification)
    }

    return util.buildResponse(200,{
       // message:JSON.stringify(requestBody.token)
        verified:true,
        message:'success',
        user:user,
        token:token
    })
}

module.exports.verify=verify