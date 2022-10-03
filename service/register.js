const AWS=require("aws-sdk");
AWS.config.update({
    region:"us-west-1"
})
const util=require("../utils/util")
const bcrypt=require("bcryptjs")
const dynamodb=new AWS.DynamoDB.DocumentClient()
const userTable="login-app"

async function register(userInfo){
   // console.log(userInfo)
    const email=userInfo.email;
    const username=userInfo.username;
    const password=userInfo.password;
    if(!username||!email||!password){
        return util.buildResponse(401,{
            message:"All fields are required."
        })
    }
    const dynamoUser=await getUser(username.toLowerCase().trim());
    if(dynamoUser && dynamoUser.username){
        return util.buildResponse(401,
            {
                message:"username is already exist,please choose a different username."
            })
    }

    const encryptPWD=bcrypt.hashSync(password.trim(),10)
    const user={
        email:email,
        username:username.toLowerCase().trim(),
        password:encryptPWD
    }

    //-----------------
    const saveUserResponse=await saveUser(user);
    if(!saveUserResponse){
        return util.buildResponse(503,{
            message:"Sever error.please try again later."
        })
    }
    return util.buildResponse(200,{username:username})

    //------find username exist or not

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
    

    //-----save user

    async function saveUser(user){
        const params={
            TableName:userTable,
            Item:user
        }
        return await dynamodb.put(params).promise()
        .then(()=>{
            return true;
        },error=>{console.error('There is an error saving user :',error)})
    }
}


module.exports.register=register
