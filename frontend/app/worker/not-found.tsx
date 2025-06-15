import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>The worker page you are looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The page you're trying to access may have been moved, deleted, or might not exist.
            Please check the URL or navigate back to the dashboard.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/worker">Return to Worker Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
