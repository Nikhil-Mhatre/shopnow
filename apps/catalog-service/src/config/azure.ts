export const azureConfig = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'mockstorestorage',
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
  containerName: 'catalog-images'
};