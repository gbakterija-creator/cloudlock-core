import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Unauthorized: Missing provisioning token", { status: 401 });
  }

  const rcloneConfig = `[CloudLockRemote]
type = s3
provider = Cloudflare
access_key_id = d4f18b28e5af7207892e363dfa62d1ca
secret_access_key = d445d6d9d76010d7935611352ab51df1402beaa3e0913b500dfdb78c1b7f2185
endpoint = https://7cf3ff3893ff429e8753bf27a2eb24a7.r2.cloudflarestorage.com
acl = private

[CloudLockCrypt]
type = crypt
remote = CloudLockRemote:cloudlock-vault/vault-${token.substring(0, 8)}
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