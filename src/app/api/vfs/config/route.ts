import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Unauthorized: Missing provisioning token", { status: 401 });
  }

  const accountId = process.env.R2_ACCOUNT_ID || "";
  const accessKey = process.env.R2_ACCESS_KEY_ID || "";
  const secretKey = process.env.R2_SECRET_ACCESS_KEY || "";
  const bucketName = process.env.R2_BUCKET_NAME || "cloudlock-vault";

  const rcloneConfig = `[CloudLockRemote]
type = s3
provider = Cloudflare
access_key_id = ${accessKey}
secret_access_key = ${secretKey}
endpoint = https://${accountId}.r2.cloudflarestorage.com
acl = private

[CloudLockCrypt]
type = crypt
remote = CloudLockRemote:${bucketName}/vault-${token.substring(0, 8)}
password = cl_crypt_pass_${token.substring(0, 12)}
filename_encryption = standard
directory_name_encryption = true
`;

  return new NextResponse(rcloneConfig, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rclone.conf"',
    },
  });
}
