import { Router } from "express";
import { getCart, addToCart, removeFromCart, updateCartItemQuantity } from "../controllers/cart.controller.js";
import { checkToken } from "../middlewares/verifyAuth.js";

const router = Router();

router.use(checkToken);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:bookId')
  .delete(removeFromCart)
  .put(updateCartItemQuantity);

export default router;
