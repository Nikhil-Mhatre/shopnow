import { Request, Response, NextFunction } from "express";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import crypto from "crypto";
import { azureConfig } from "../config/azure.js";

export const getProductImageUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { contentType } = req.body;
    const blobName = `products/${crypto.randomUUID()}-${Date.now()}`;

    const credentials = new StorageSharedKeyCredential(
      azureConfig.accountName,
      azureConfig.accountKey,
    );

    const sasOptions = {
      containerName: azureConfig.containerName,
      blobName,
      permissions: BlobSASPermissions.parse("w"), // Restrict token strictly to write access
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 10 * 60 * 1000), // Secure 10 minute active lifespan window
      contentType,
    };

    const tokenParams = generateBlobSASQueryParameters(
      sasOptions,
      credentials,
    ).toString();

    const uploadUrl = `https://${azureConfig.accountName}.blob.core.windows.net/${azureConfig.containerName}/${blobName}?${tokenParams}`;
    const publicAssetUrl = `https://${azureConfig.accountName}.blob.core.windows.net/${azureConfig.containerName}/${blobName}`;

    res.status(200).json({ uploadUrl, publicAssetUrl });
  } catch (error) {
    next(error);
  }
};
