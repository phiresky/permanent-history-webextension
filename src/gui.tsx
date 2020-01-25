import React, { useContext, useEffect, useState } from "react"
import { render } from "react-dom"
type API = import("./main").apiType

const ApiContext = React.createContext<API>(undefined as any)

async function getApi() {
	const page = await browser.runtime.getBackgroundPage()
	return (page as any).permanentHistory as API
}

function GUI() {
	const api = usePromise(getApi)
	Object.assign(window, { api })
	if (!api) return <>loading...</>
	return (
		<ApiContext.Provider value={api}>
			<div>
				<h1>Permanent History</h1>
				<Overview />
			</div>
		</ApiContext.Provider>
	)
}
function usePromise<T>(getter: () => Promise<T>) {
	const [v, setV] = useState(null as null | T)
	useEffect(() => {
		getter().then(setV)
	})
	return v
}
function Overview() {
	const api = useContext(ApiContext)
	const l2 = usePromise(() => api.db.pages.count())
	const len = usePromise(() => api.db.visits.count())

	const recent = usePromise(async () => {
		const vs = await api.db.visits
			.orderBy("visitTime")
			.limit(10)
			.toArray()
		return Promise.all(
			vs.map(async p => ({
				...p,
				page: await api.db.pages.where({ id: p.id }).first(),
			})),
		)
	})

	return (
		<>
			<div>Visits: {len} items</div>
			<div>Pages: {l2} items</div>
			{recent &&
				recent.map(p => (
					<div>
						{new Date(p.visitTime || 0).toLocaleString()}:{" "}
						{p.page!.url}
					</div>
				))}
			{/*<Import />*/}
		</>
	)
}
function Import() {
	const api = useContext(ApiContext)
	return (
		<div>
			<h2>Import</h2>
			<input
				type="file"
				onChange={async e => {
					const i = e.currentTarget
					if (i.files && i.files[0]) {
						const f = i.files[0]
						try {
							const db = await api.exin.importDB(f)
							console.log(db)
						} catch (e) {
							console.error("import error", e)
						}
					}
				}}
			/>{" "}
		</div>
	)
}
console.log("a")
// createRoot(document.getElementById("app")).render(<GUI />)
render(<GUI />, document.getElementById("app"))
