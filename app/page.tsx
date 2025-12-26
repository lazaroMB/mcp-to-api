import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black dark:text-zinc-50">
                API to MCP
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Transform Your APIs into
            <span className="bg-gradient-to-r from-zinc-600 to-zinc-400 bg-clip-text text-transparent dark:from-zinc-400 dark:to-zinc-600">
              {' '}MCP Servers
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Connect any REST API to the Model Context Protocol. Create powerful MCP tools
            that enable AI assistants to interact with your APIs seamlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-lg bg-black px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
            <Link
              href="/admin"
              className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            Everything you need to bridge APIs and MCP
          </h2>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Powerful features to map, transform, and expose your APIs as MCP tools
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black dark:text-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-6 w-6 text-black dark:text-zinc-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                </div>
                API Mapping
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                <p className="flex-auto">
                  Map any REST API endpoint to MCP tools with flexible field transformations,
                  parameter mapping, and custom payload schemas.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black dark:text-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-6 w-6 text-black dark:text-zinc-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                Tool Configuration
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                <p className="flex-auto">
                  Define MCP tools with custom input schemas, descriptions, and URIs.
                  Enable or disable tools dynamically without code changes.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black dark:text-zinc-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-6 w-6 text-black dark:text-zinc-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                Secure & Isolated
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                <p className="flex-auto">
                  Row-level security ensures your MCPs, APIs, and tools are private.
                  Each user only sees and manages their own configurations.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Create your account and start transforming your APIs into MCP servers in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-lg bg-black px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50"
            >
              Sign In <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>© {new Date().getFullYear()} API to MCP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
