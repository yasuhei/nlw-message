import { Router } from "express"
import { AuthenticateUserController } from "./controllers/AuthenticateUserController"
import { CreateMessageController } from "./controllers/CreateMessageController"
import { GetLast3MessagesController } from "./controllers/GetLast3MessagesController"
import { ProfileUSerController } from "./controllers/ProfileUserController"
import { ensureAuthentication } from "./middleware/ensureAuthenticate"

const router = Router()

router.post('/authenticate', new AuthenticateUserController().handle)

router.post('/messages', ensureAuthentication, new CreateMessageController().handle)

router.get("/messages/last3", new GetLast3MessagesController().handle)

router.get('/profile', ensureAuthentication, new ProfileUSerController().handle)

export { router}