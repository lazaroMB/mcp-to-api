import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Blog Post Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <Button render={<Link href="/blog">Back to Blog</Link>} />
      </div>
    </div>
  );
}
