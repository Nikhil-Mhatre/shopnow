import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User.js";

// 1. COMPLETE/UPDATE PROFILE
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req?.user?.id;
    const { firstName, lastName, phone } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { firstName, lastName, phone } },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// 2. ADD ADDRESS WITH SMART DEFAULTING
export const addAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req?.user?.id;
    const newAddress = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Automatically make it the default if it is their very first address
    if (user.savedAddresses.length === 0) {
      newAddress.isDefault = true;
    } else if (newAddress.isDefault) {
      // If user requested this to be default, strip default status from all others
      user.savedAddresses.forEach((addr) => (addr.isDefault = false));
    }

    user.savedAddresses.push(newAddress);
    await user.save();

    res.status(201).json(user.savedAddresses);
  } catch (error) {
    next(error);
  }
};
