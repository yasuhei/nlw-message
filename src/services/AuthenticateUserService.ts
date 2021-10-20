import axios from 'axios'
import prismaClient from '../prisma'
import { sign}  from 'jsonwebtoken'
/** 
 * receber code(string)
 * recuperar o acess_token no github
 * recuperar users do github
 * verificar se o usuario existe no bd
 *  se sim = gerar um token para
 * se nao = criar um bd, gera um token
 * retornar o token com as infos do user 
*/
interface IAccessTokenResponse {
  access_token: string;
 }

 interface IUserResponse { 
   avatar_url: string;
   login: string;
   id: number;
   name: string;
 }

class AuthenticateUserService {
async execute(code: string) {

  const url ='https://github.com/login/oauth/access_token';
  
  const {data: accessTokenResponse} = await axios.post<IAccessTokenResponse>(url,null, { 
    params: { 
      client_id: process.env.GITHUB_CLIENT_ID, 
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    headers: {
      "Accept" : "application/json"
    }
  });
  //pegar todas informcações do usuario
  const response = await axios.get<IUserResponse>("https://api.github.com/user", {
    headers: {
    authorization:  `Bearer ${accessTokenResponse.access_token}`
  }
})

//verificar se o usuario ja e cadastrado
const {login, id, avatar_url, name} = response.data;
//encontrar um usuario
let user = await prismaClient.user.findFirst({
  where: {
    github_id: id
  }
})

//criar usuario 
if(!user) {
  user = await prismaClient.user.create({
    data: {
      github_id: id,
      login, 
      avatar_url, 
      name
    }
  })
}

const token = sign(
  {
    user:
    { 
     name: user.name,
    avatar_url: user.avatar_url,
    id: user.id,
  }
},
process.env.JWT_SECRET,
{
  subject: user.id, 
  expiresIn: "1d"

}
  
  )
  return {token, user}
}

}

export { AuthenticateUserService } 