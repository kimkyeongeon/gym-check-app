import { Readable } from "stream";
import { google } from "googleapis";

const FOLDER_MIME = "application/vnd.google-apps.folder";

export const DRIVE_OAUTH_SCOPE = "https://www.googleapis.com/auth/drive";

export function getOAuthClient(redirectUri?: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth client credentials are not configured");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getAuth() {
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("Google Drive is not connected yet (missing refresh token)");
  }
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function getDrive() {
  return google.drive({ version: "v3", auth: getAuth() });
}

const monthFolderCache = new Map<string, string>();

async function findChildFolder(parentId: string, name: string): Promise<string | null> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name}' and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });
  return res.data.files?.[0]?.id ?? null;
}

async function createChildFolder(parentId: string, name: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    },
    fields: "id",
  });
  if (!res.data.id) throw new Error("Failed to create Drive folder");
  return res.data.id;
}

async function getOrCreateMonthFolder(monthKey: string): Promise<string> {
  const cached = monthFolderCache.get(monthKey);
  if (cached) return cached;

  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured");

  let folderId = await findChildFolder(rootId, monthKey);
  if (!folderId) {
    folderId = await createChildFolder(rootId, monthKey);
  }
  monthFolderCache.set(monthKey, folderId);
  return folderId;
}

export async function uploadOriginal(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  monthKey: string;
}): Promise<{ fileId: string; fileUrl: string }> {
  const drive = getDrive();
  const folderId = await getOrCreateMonthFolder(params.monthKey);

  const res = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [folderId],
    },
    media: {
      mimeType: params.mimeType,
      body: Readable.from(params.buffer),
    },
    fields: "id, webViewLink",
  });

  if (!res.data.id) throw new Error("Failed to upload file to Drive");
  return {
    fileId: res.data.id,
    fileUrl: res.data.webViewLink ?? `https://drive.google.com/file/d/${res.data.id}/view`,
  };
}

export async function deleteOriginal(fileId: string): Promise<void> {
  const drive = getDrive();
  try {
    await drive.files.delete({ fileId });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 404) return;
    throw err;
  }
}
