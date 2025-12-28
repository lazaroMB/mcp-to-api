import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { getBlogPost, generateMetadataForPost, getAllBlogPosts } from '@/lib/blog/posts';
import { Badge } from '@/components/ui/badge';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | API to MCP Blog',
    };
  }

  return generateMetadataForPost(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Convert markdown-like content to HTML
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentParagraph: (string | React.ReactElement)[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const hasContent = currentParagraph.some(item => 
          typeof item === 'string' ? item.trim() : true
        );
        if (hasContent) {
          elements.push(
            <p key={elements.length} className="mb-4 leading-7">
              {currentParagraph}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        const code = codeBlockContent.join('\n');
        // Preserve all special characters in code blocks
        elements.push(
          <pre
            key={elements.length}
            className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono whitespace-pre-wrap"
          >
            <code className="text-foreground">{code}</code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
    };

    // Process inline markdown: code, links, bold, italic
    const processInlineMarkdown = (text: string): (string | React.ReactElement)[] => {
      if (!text) return [];
      
      const result: (string | React.ReactElement)[] = [];
      let remaining = text;
      let keyCounter = 0;

      // Process in order: code (backticks), links, bold, italic
      while (remaining.length > 0) {
        // First, check for inline code (backticks) - highest priority
        // Match backticks that are not part of code blocks
        const codeMatch = remaining.match(/^([^`]*?)`([^`\n]+?)`(.*)$/);
        if (codeMatch) {
          const [, before, code, after] = codeMatch;
          if (before) {
            // Process the text before the code for other markdown
            result.push(...processInlineMarkdown(before));
          }
          // Preserve all characters in inline code, including special characters
          result.push(
            <code
              key={`code-${keyCounter++}`}
              className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground"
            >
              {code}
            </code>
          );
          remaining = after;
          continue;
        }

        // Check for links [text](url)
        const linkMatch = remaining.match(/^([^\[]*?)\[([^\]]+)\]\(([^\)]+)\)(.*)$/);
        if (linkMatch) {
          const [, before, linkText, linkUrl, after] = linkMatch;
          if (before) {
            result.push(...processInlineMarkdown(before));
          }
          result.push(
            <Link
              key={`link-${keyCounter++}`}
              href={linkUrl}
              className="text-primary hover:underline"
            >
              {linkText}
            </Link>
          );
          remaining = after;
          continue;
        }

        // Check for bold **text** (must be double asterisks, not single)
        const boldMatch = remaining.match(/^([^*]*?)\*\*([^*\n]+?)\*\*(.*)$/);
        if (boldMatch) {
          const [, before, boldText, after] = boldMatch;
          if (before) {
            result.push(...processInlineMarkdown(before));
          }
          result.push(
            <strong key={`bold-${keyCounter++}`} className="font-semibold">
              {boldText}
            </strong>
          );
          remaining = after;
          continue;
        }

        // Check for italic *text* (single asterisk, not part of **)
        const italicMatch = remaining.match(/^([^*]*?)\*([^*\n]+?)\*(.*)$/);
        if (italicMatch) {
          const [, before, italicText, after] = italicMatch;
          if (before) {
            result.push(...processInlineMarkdown(before));
          }
          result.push(
            <em key={`italic-${keyCounter++}`} className="italic">
              {italicText}
            </em>
          );
          remaining = after;
          continue;
        }

        // No more markdown found, add remaining text
        result.push(remaining);
        break;
      }

      return result;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushParagraph();
          inCodeBlock = true;
          codeBlockLanguage = line.substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        flushParagraph();
        const headerText = line.substring(2);
        elements.push(
          <h1 key={elements.length} className="mb-4 mt-8 text-3xl font-bold">
            {processInlineMarkdown(headerText)}
          </h1>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        flushParagraph();
        const headerText = line.substring(3);
        elements.push(
          <h2 key={elements.length} className="mb-3 mt-6 text-2xl font-semibold">
            {processInlineMarkdown(headerText)}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        flushParagraph();
        const headerText = line.substring(4);
        elements.push(
          <h3 key={elements.length} className="mb-2 mt-4 text-xl font-semibold">
            {processInlineMarkdown(headerText)}
          </h3>
        );
        continue;
      }
      if (line.startsWith('#### ')) {
        flushParagraph();
        const headerText = line.substring(5);
        elements.push(
          <h4 key={elements.length} className="mb-2 mt-4 text-lg font-semibold">
            {processInlineMarkdown(headerText)}
          </h4>
        );
        continue;
      }

      // Handle list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph();
        const listItems: string[] = [];
        let j = i;
        while (j < lines.length && (lines[j].startsWith('- ') || lines[j].startsWith('* '))) {
          listItems.push(lines[j].substring(2));
          j++;
        }
        i = j - 1;
        elements.push(
          <ul key={elements.length} className="mb-4 ml-6 list-disc space-y-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-7">
                {processInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        flushParagraph();
        const listItems: string[] = [];
        let j = i;
        while (j < lines.length && /^\d+\.\s/.test(lines[j])) {
          listItems.push(lines[j].replace(/^\d+\.\s/, ''));
          j++;
        }
        i = j - 1;
        elements.push(
          <ol key={elements.length} className="mb-4 ml-6 list-decimal space-y-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-7">
                {processInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Regular paragraph line
      if (line.trim()) {
        currentParagraph.push(...processInlineMarkdown(line));
        currentParagraph.push(' ');
      } else {
        flushParagraph();
      }
    }

    flushParagraph();
    flushCodeBlock();

    return elements;
  };

  const formattedContent = formatContent(post.content);

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

      {/* Article */}
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mb-6 text-xl text-muted-foreground">
            {post.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
          </div>
        </header>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              author: {
                '@type': 'Person',
                name: post.author,
              },
              datePublished: post.publishedAt,
              dateModified: post.publishedAt,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://api-to-mcp.com/blog/${post.slug}`,
              },
            }),
          }}
        />

        {/* Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="text-foreground">
            {formattedContent}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            ← Back to Blog
          </Link>
        </footer>
      </article>

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
