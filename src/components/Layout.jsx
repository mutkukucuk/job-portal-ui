import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const SITE_NAME = 'JobPortal'
const DEFAULT_DESCRIPTION =
	'Find your dream job on JobPortal. Browse thousands of openings and top companies, and apply in minutes.'

const setDescription = (content) => {
	let meta = document.querySelector('meta[name="description"]')
	if (!meta) {
		meta = document.createElement('meta')
		meta.name = 'description'
		document.head.appendChild(meta)
	}
	meta.content = content
}

const Layout = () => {
	const { pathname } = useLocation()

	useEffect(() => {
		const main = document.querySelector('main')
		const update = () => {
			const heading = main?.querySelector('h1')?.textContent.trim().replace(/\s+/g, ' ')
			document.title = heading && pathname !== '/' ? `${heading} | ${SITE_NAME}` : `${SITE_NAME} - Find Your Dream Job Today`
			setDescription(heading && pathname !== '/' ? `${heading} on ${SITE_NAME}. ${DEFAULT_DESCRIPTION}` : DEFAULT_DESCRIPTION)
		}
		update()
		if (!main) return
		const observer = new MutationObserver(update)
		observer.observe(main, { childList: true, subtree: true, characterData: true })
		return () => observer.disconnect()
	}, [pathname])

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
			<Navbar />
			<main>
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}

export default Layout
