import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center py-12">
          <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
