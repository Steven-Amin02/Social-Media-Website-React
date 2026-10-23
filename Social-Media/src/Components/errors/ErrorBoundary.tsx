import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorPage } from './ErrorPage'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route Social rendering error', error, info.componentStack)
  }

  render() {
    return this.state.failed ? <ErrorPage status={500} /> : this.props.children
  }
}
