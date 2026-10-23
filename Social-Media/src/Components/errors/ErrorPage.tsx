import { ArrowRight, Compass, Home, RefreshCw } from 'lucide-react'
import './ErrorPage.css'

export function ErrorPage({ status = 404 }: { status?: 404 | 500 }) {
  const unexpected = status === 500

  return (
    <div className="error-page">
      <header className="error-page-header">
        <a href="/" className="brand" aria-label="Route Social home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>
            route<span className="brand-social">social</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <span className="error-page-header-note">A space for your people</span>
      </header>

      <main className="error-page-main" aria-labelledby="error-page-title">
        <div className="error-page-art" aria-hidden="true">
          <span className="error-page-orbit" />
          <span className="error-page-orbit error-page-orbit-inner" />
          <span className="error-page-dot error-page-dot-blue" />
          <span className="error-page-dot error-page-dot-peach" />
          <span className="error-page-number">{unexpected ? '5' : '4'}</span>
          <span className="error-page-compass">
            <Compass strokeWidth={1.2} />
          </span>
          <span className="error-page-number">{unexpected ? '0' : '4'}</span>
        </div>

        <span className="error-page-label">
          <span className="status-dot" />
          {status} · {unexpected ? 'SOMETHING WENT WRONG' : 'PAGE NOT FOUND'}
        </span>
        <h1 id="error-page-title">
          {unexpected
            ? 'A little hiccup in the connection.'
            : 'A little off the beaten path.'}
        </h1>
        <p className="error-page-description">
          {unexpected
            ? 'We couldn’t display this page. Try reloading, or head back home to reconnect with your community.'
            : 'This page may have moved, or the link might be a little lost. Let’s get you back to your people.'}
        </p>

        <div className="error-page-actions">
          {unexpected ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={17} /> Try again
            </button>
          ) : (
            <a href="/" className="btn btn-primary">
              <Home size={17} /> Back to home
            </a>
          )}
          <a href={unexpected ? '/' : '/explore'} className="btn btn-secondary">
            {unexpected ? 'Back to home' : 'Explore the community'}
            <ArrowRight size={16} />
          </a>
        </div>
        <p className="error-page-help">
          {unexpected
            ? 'If this keeps happening, please try again a little later.'
            : 'Good connections are always worth finding.'}
        </p>
      </main>

      <footer className="error-page-footer">
        <span>© {new Date().getFullYear()} Route Social</span>
        <span>Connect. Share. Belong.</span>
      </footer>
    </div>
  )
}
