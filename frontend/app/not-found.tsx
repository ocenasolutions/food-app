import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main className="page-shell flex min-h-screen flex-col items-start justify-center gap-4">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">404</p>
          <h1 className="text-4xl font-black">Page not found</h1>
          <p className="max-w-lg text-muted-foreground">
            The page you opened does not exist or is not available for this role.
          </p>
          <Button asChild>
            <Link href="/en/login">Back to login</Link>
          </Button>
        </main>
      </body>
    </html>
  );
}
