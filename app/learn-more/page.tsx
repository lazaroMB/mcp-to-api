import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
                API to MCP
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" render={<Link href="/login">Sign In</Link>} />
              <Button render={<Link href="/login">Get Started</Link>} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* POC Notice */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Proof of Concept
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                This application is currently a Proof of Concept (POC) under active development. 
                Features may change, and some functionality may be incomplete. We welcome feedback 
                and contributions as we continue to improve the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            How API to MCP Works
          </h1>
          <p className="text-lg text-muted-foreground leading-8">
            API to MCP is a platform that bridges the gap between REST APIs and the Model Context Protocol (MCP), 
            enabling AI assistants to interact with your existing APIs seamlessly.
          </p>
        </div>

        {/* How It Works Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-6">How It Works</h2>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Connect Your API</h3>
                <p className="text-muted-foreground">
                  Start by registering your REST API endpoints. Define the base URL, request methods, 
                  and any required authentication. The platform supports various authentication methods 
                  including API keys, bearer tokens, and more.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Create an MCP Server</h3>
                <p className="text-muted-foreground">
                  Create a new MCP server configuration. Each MCP server acts as a bridge between 
                  AI assistants and your APIs. You can create multiple MCP servers for different 
                  use cases or API groups.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Define MCP Tools</h3>
                <p className="text-muted-foreground">
                  Map your API endpoints to MCP tools. Each tool represents a specific API operation 
                  that AI assistants can invoke. Define input schemas, descriptions, and configure 
                  how parameters are passed to your API.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Configure Field Mappings</h3>
                <p className="text-muted-foreground">
                  Map fields from MCP tool inputs to your API's expected payload format. Transform 
                  data structures, rename fields, and handle different data types. The platform 
                  handles the translation automatically.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Connect AI Assistants</h3>
                <p className="text-muted-foreground">
                  Once configured, your MCP server is ready to use. AI assistants can discover 
                  your tools, understand their capabilities through schemas, and invoke them 
                  seamlessly. The platform handles all the protocol communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Key Features</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">API Mapping</h3>
              <p className="text-muted-foreground">
                Map any REST API endpoint to MCP tools with flexible field transformations, 
                parameter mapping, and custom payload schemas.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Tool Configuration</h3>
              <p className="text-muted-foreground">
                Define MCP tools with custom input schemas, descriptions, and URIs. Enable or 
                disable tools dynamically without code changes.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Secure & Isolated</h3>
              <p className="text-muted-foreground">
                Row-level security ensures your MCPs, APIs, and tools are private. Each user 
                only sees and manages their own configurations.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Protocol Compliant</h3>
              <p className="text-muted-foreground">
                Built on the Model Context Protocol standard, ensuring compatibility with MCP-compatible 
                AI assistants and tools.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Use Cases</h2>
          
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Enable AI assistants to interact with your internal APIs and services</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Expose third-party API integrations to AI tools without writing custom code</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Create reusable API bridges for multiple AI assistant platforms</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Prototype and test API integrations with AI assistants quickly</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Create your account and start transforming your APIs into MCP servers in minutes.
          </p>
          <div className="flex items-center justify-center gap-x-4">
            <Button size="lg" render={<Link href="/login">Create Account</Link>} />
            <Button variant="ghost" size="lg" render={<Link href="/">Back to Home</Link>} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
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
