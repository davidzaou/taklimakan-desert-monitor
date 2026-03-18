import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", height: "100vh", gap: "1rem",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          color: "#c9d1d9", background: "#0d1117",
        }}>
          <h2 style={{ margin: 0 }}>Something went wrong</h2>
          <p style={{ color: "#8b949e", maxWidth: 400, textAlign: "center" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          {this.state.componentStack && (
            <pre style={{ color: "#6e7681", fontSize: "0.7rem", maxWidth: 600, overflow: "auto", maxHeight: 200, textAlign: "left", padding: "0.5rem", background: "#161b22", borderRadius: 6 }}>
              {this.state.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1.5rem", borderRadius: 8, border: "1px solid #30363d",
              background: "#21262d", color: "#c9d1d9", cursor: "pointer", fontSize: "0.9rem",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
