import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.jsx"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const ReactQueryDevtools = React.lazy(() =>
  import.meta.env.DEV
    ? import("@tanstack/react-query-devtools").then((d) => ({
        default: d.ReactQueryDevtools,
      }))
    : Promise.resolve({ default: () => null }),
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {import.meta.env.DEV && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
