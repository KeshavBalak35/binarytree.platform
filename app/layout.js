export const metadata = {
  title: "Binary Tree",
  description: "Offline-first digital literacy and coding education for everyone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
