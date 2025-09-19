import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <AlertTriangle className="mx-auto h-16 w-16 text-error-500 mb-4" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-neutral-600">
                We apologize for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            
            {this.state.error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-left">
                <p className="text-sm text-error-800 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}