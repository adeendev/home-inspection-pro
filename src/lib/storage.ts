import { put } from "@vercel/blob";

export async function uploadReport(orderId: string, file: Buffer): Promise<string> {
  const blob = await put(`reports/${orderId}.pdf`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.pathname;
}

export async function getSignedDownloadUrl(fileKey: string): Promise<string> {
  return `${process.env.BLOB_BASE_URL}/${fileKey}`;
}
