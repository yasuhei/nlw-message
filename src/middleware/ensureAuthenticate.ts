import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken'

interface IPayload { 
  sub: string
}

export function ensureAuthentication(request: Request, response: Response, next: NextFunction) {
  const authToken = request.headers.authorization

  if(!authToken) {
    return response.status(401).json({
      errorCode: "token invalid"
    })
  }

  const [, token] = authToken.split(" ")
  //verificar se o token e valido
  try {
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload
    request.user_id = sub
    
   return next()


  }catch(err) {
    return response.status(401).json({errorCode: "token.exprired"})
  }

}