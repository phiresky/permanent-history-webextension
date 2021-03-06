import Dexie from "dexie"
import * as exin from "dexie-export-import"
;(Dexie as any).debug = true
class HistoryDb extends Dexie {
	pages: Dexie.Table<browser.history.HistoryItem, string>
	visits: Dexie.Table<browser.history.VisitItem, string>

	constructor() {
		super("permanent-history-db")
		this.version(1).stores({
			visits: "visitId",
			pages: "id",
		})
		this.version(2).stores({
			visits: "visitId,id,visitTime",
			pages: "id",
		})
		this.visits = this.table("visits")
		this.pages = this.table("pages")
	}
}

const db = new HistoryDb()

async function updateHistoryDatabase() {
	if (!db.isOpen()) {
		console.log("opening/upgrading db...")
		await db.open()
		console.log("open!")
	}

	const result = await browser.history.search({
		text: "",
		startTime: 0,
		maxResults: Number.MAX_SAFE_INTEGER,
	})
	console.log("adding pages", result.length)
	console.time("pages")
	await db.pages.bulkPut(result)
	console.timeEnd("pages")
	console.log("adding visits")
	console.time("getvisits")
	const visits: browser.history.VisitItem[] = []
	for (const x of result) {
		if (!x.url) console.warn("no url in", x.url)
		else {
			visits.push(...(await browser.history.getVisits({ url: x.url })))
			// console.log(x, visits)
		}
	}
	console.timeEnd("getvisits")
	console.log(JSON.stringify(visits).length)
	console.time("putvisits")
	await db.visits.bulkPut(visits)
	console.timeEnd("putvisits")
}

async function updateIfTooOld() {
	const { lastUpdate = 0 } = await browser.storage.local.get("lastUpdate")
	const lastUpdateE = new Date(lastUpdate)
	console.log("last update: ", lastUpdateE)
	const dayago = new Date()
	dayago.setDate(dayago.getDate() - 1)
	if (lastUpdateE < dayago) {
		console.log("too old, updating")
		try {
			await updateHistoryDatabase()
			await browser.storage.local.set({
				lastUpdate: new Date().toISOString(),
			})
		} catch (e) {
			console.error("could not update")
		}
	}
}
browser.alarms.create("update-perm-db", {
	periodInMinutes: 60,
})
browser.alarms.onAlarm.addListener(() => updateIfTooOld())

window.addEventListener("unhandledrejection", event => {
	console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`)
})

updateIfTooOld()

console.log("global variable: permanentHistory")
const api = {
	updateIfTooOld,
	updateHistoryDatabase,
	db,
	HistoryDb,
	Dexie,
	exin,
}
browser.browserAction.onClicked.addListener(() => {
	browser.tabs.create({ url: "overview.html" })
})
export type apiType = typeof api
Object.assign(window, { permanentHistory: api })
