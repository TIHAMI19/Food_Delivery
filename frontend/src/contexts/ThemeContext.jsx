import { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeContext = createContext(null)

function getInitialTheme() {
	if (typeof window === "undefined") return "light"
	const saved = localStorage.getItem("theme")
	if (saved === "light" || saved === "dark") return saved
	const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
	return prefersDark ? "dark" : "light"
}

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(getInitialTheme)

	useEffect(() => {
		const root = document.documentElement
		if (theme === "dark") root.classList.add("dark")
		else root.classList.remove("dark")
		localStorage.setItem("theme", theme)
	}, [theme])

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const handler = (e) => {
			const saved = localStorage.getItem("theme")
			if (!saved) setTheme(e.matches ? "dark" : "light")
		}
		media.addEventListener?.("change", handler)
		return () => media.removeEventListener?.("change", handler)
	}, [])

	const value = useMemo(
		() => ({
			theme,
			isDark: theme === "dark",
			setTheme,
			toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
		}),
		[theme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
	return ctx
}
