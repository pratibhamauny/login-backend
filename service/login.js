const AWS=require("aws-sdk");
AWS.config.update({
    region:"us-west-1"
})
const dynamodb=new AWS.DynamoDB.DocumentClient()
const userTable="login-app";
const util=require("../utils/util")
const bcrypt=require("bcryptjs")
const auth=require("../utils/auth")

async function login(loginInfo){
    console.log(loginInfo)
    const username=loginInfo.username.toLowerCase().trim();
    const password=loginInfo.password
    if(!username||!password){
        return util.buildResponse(401,{
            message:'username and password are required.'
        })
    }

    const dynamoUser=await getUser(username);
        if(!dynamoUser||!dynamoUser.username){
            return util.buildResponse(403,{
                message:'user does not exist.'
            })
        }
        
        if(!bcrypt.compareSync(password,dynamoUser.password)){
            return util.buildResponse(403,{
                message:"password is incorrect."
            })
        }

        const userInfo={
            username:dynamoUser.username,
            email:dynamoUser.email
        }

        const token=auth.generateToken(userInfo)
        const response={
            user:userInfo,
            token:token
        }
     return util.buildResponse(200,response)
}
//-------getUser()-------
async function getUser(username){
    const params={
        TableName:userTable,
        Key:{
            username:username
        }
    }
    return await dynamodb.get(params).promise()
    .then(response=>{
        return response.Item
    },error=>{console.error('There is an error getting user :',error)})
}

module.exports.login=login;