import asyncHandler from "express-async-handler";
import { Cart } from "../models/cart.model.js";
import { ResultData, ResultError } from "../utils/resultData.js";

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
    await cart.save();
  }
  res.status(200).json(ResultData({ cart }));
});

const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }
  
  const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ book: bookId, quantity });
  }
  
  await cart.save();
  res.status(200).json(ResultData({ cart }));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json(ResultError("fail", 404, "Cart not found"));
  }
  
  cart.items = cart.items.filter(item => item.book.toString() !== bookId);
  await cart.save();
  res.status(200).json(ResultData({ cart }));
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json(ResultError("fail", 404, "Cart not found"));
  }
  
  const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
  } else {
    return res.status(404).json(ResultError("fail", 404, "Item not found in cart"));
  }
  
  await cart.save();
  res.status(200).json(ResultData({ cart }));
});

export { getCart, addToCart, removeFromCart, updateCartItemQuantity };
