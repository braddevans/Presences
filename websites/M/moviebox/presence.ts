const presence = new Presence({
		clientId: "1120627624377589820",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

interface MBPMeta {
	title: string;
	poster: string;
	year: string;
	type: string;
	season?: string;
	seasons?: string;
	episode?: string;
}

presence.on("UpdateData", async () => {
	/*
	* Todo: Implement progress bar
	* Todo: Implement iframe to get video data
	* Todo: Cleanup the document Query selectors possibly migrate to presence.getPageVariable<T>();
	*  Or have the query selectors for meta data be passed into a shared function
	*/
	
	const { pathname } = document.location,
		[
			showTimestamp,
		] = await Promise.all([
			presence.getSetting<boolean>("timestamp"),
		]),
		presenceData: PresenceData = {
			largeImageKey:
				"https://cdn.rcd.gg/PreMiD/websites/M/movieboxpro/assets/logo.png",
			type: ActivityType.Watching,
		};

	presenceData.startTimestamp = browsingTimestamp;

	if (pathname === "" || pathname.startsWith("/index/search")) {
		presenceData.details = "Browsing";
		presenceData.state = document.title;

	} else if (pathname.startsWith("/tvshow")) {
		const meta: MBPMeta = processMetadata(true);

		presenceData.largeImageKey = meta.poster;


		const title = `${meta.title} (${meta.year})`;
		presenceData.name = title;
		presenceData.details = title;
		presenceData.state = `Season ${meta.season} of ${meta.seasons}`;

	} else if (pathname.startsWith("/movie")) {
		const meta: MBPMeta = processMetadata(false);

		presenceData.largeImageKey = meta.poster;


		const title = `${meta.title} (${meta.year})`;
		presenceData.name = title;
		presenceData.details = title;
		presenceData.state = meta.season;
	}

	if (!showTimestamp) delete presenceData.endTimestamp;

	//if (!showProgressBar) delete presenceData.state;

	await presence.setActivity(presenceData);
});

/**
 * Processes metadata for a given movie or TV show page.
 * @param isTV If true, will extract season and episode metadata.
 * @returns An object containing the title, year, type, poster, and season/episode metadata.
 */
const processMetadata = (isTV : boolean) => {
	const meta : MBPMeta = {
		title: document.querySelector("body > div.wrap > div.movie > div.contents > div.info > div:nth-child(2) > div:nth-child(1) > p > span").textContent,
		poster: document.querySelector("body > div.wrap > div.movie > div.contents > div.info > p > img").getAttribute("src"),
		year: document.querySelector("body > div.wrap > div.movie > div.contents > div.info > div:nth-child(2) > div:nth-child(1) > span.year").textContent,
		type: (isTV ? "tvshow" : "movie"),
	};

	if (isTV) {
		meta.season = (document.querySelector("#season > p").textContent).split(" ")[1].split("/")[0];
		meta.seasons = (document.querySelector("#season > p").textContent).split(" ")[1].split("/")[1];
	}

	return meta;
};
