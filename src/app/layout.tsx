import "./globals.css";

export const metadata = {
  title: "CloudLock Studio VFS",
  description: "Virtual File System Studio Controller",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0C] text-neutral-200">{children}</body>
    </html>
  );
}