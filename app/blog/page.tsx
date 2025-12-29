import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog/posts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Blog | API to MCP',
  description: 'Learn how to configure MCP servers, create APIs, and understand the MCP to API mapping system. Comprehensive guides and tutorials.',
  openGraph: {
    title: 'Blog | API to MCP',
    description: 'Learn how to configure MCP servers, create APIs, and understand the MCP to API mapping system.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | API to MCP',
    description: 'Learn how to configure MCP servers, create APIs, and understand the MCP to API mapping system.',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
                API to MCP
              </Link>
              <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Blog Header */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Learn how to configure MCP servers, create APIs, and understand the mapping system
          </p>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'API to MCP Blog',
            description: 'Learn how to configure MCP servers, create APIs, and understand the MCP to API mapping system.',
            url: 'https://api-to-mcp.dev/blog',
            blogPost: posts.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              url: `https://api-to-mcp.dev/blog/${post.slug}`,
              datePublished: post.publishedAt,
              author: {
                '@type': 'Person',
                name: post.author,
              },
            })),
          }),
        }}
      />

      {/* Blog Posts */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {posts.map((post) => (
            <Card key={post.slug} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {post.readingTime} min read
                    </span>
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground mb-4">
                    {post.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{post.author}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/learn-more" className="hover:text-foreground transition-colors">
                Learn More
              </Link>
            </div>
            <p>© {new Date().getFullYear()} API to MCP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
