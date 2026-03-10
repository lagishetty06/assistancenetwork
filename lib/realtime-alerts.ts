// This service fetches real-time disaster and emergency alerts from public news feeds.

export interface ExternalAlert {
    id: string;
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
    link?: string;
    address?: string;
    situation?: string;
}

export const realTimeAlertsService = {
    /**
     * Fetches real-time disaster alerts for India using Google News RSS.
     */
    async fetchLiveAlerts(): Promise<ExternalAlert[]> {
        try {
            // Use RSS2JSON to convert Google News RSS format to JSON
            const rssUrl = encodeURIComponent("https://news.google.com/rss/search?q=disaster+OR+earthquake+OR+flood+OR+emergency+alert+India&hl=en-IN&gl=IN&ceid=IN:en");
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === "ok" && data.items && data.items.length > 0) {
                // Map the news items to our EmergencyAlert format
                // We will limit it to the top 4 most recent alerts so it doesn't crowd the home page
                return data.items.slice(0, 4).map((item: any, index: number) => {

                    // Determine severity based on keywords in title
                    const lowerTitle = item.title.toLowerCase();
                    let type: "critical" | "warning" | "info" = "warning";
                    if (lowerTitle.includes("earthquake") || lowerTitle.includes("flood") || lowerTitle.includes("cyclone") || lowerTitle.includes("fatal")) {
                        type = "critical";
                    } else if (lowerTitle.includes("update") || lowerTitle.includes("info")) {
                        type = "info";
                    }

                    // We try to clean up the description or just use the title if HTML description is messy
                    // Google News RSS puts a lot of anchor tags in the description.
                    // Let's create a cleaner message
                    let message = item.description || "Click the link below to read the full details of this alert.";
                    // strip html tags
                    message = message.replace(/<[^>]*>?/gm, '');

                    // Format Date
                    let formattedTime = "Recently";
                    try {
                        const date = new Date(item.pubDate);
                        formattedTime = new Intl.DateTimeFormat('en-IN', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }).format(date);
                    } catch (e) { }

                    return {
                        id: `external-${index}-${Date.now()}`,
                        type,
                        title: item.title.replace(" - Google News", ""),
                        message: message.length > 200 ? message.substring(0, 197) + "..." : message,
                        timestamp: formattedTime,
                        link: item.link,
                        situation: type === "critical" ? "Severe Alert" : "News Alert",
                        address: "India (News)",
                    };
                });
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch live alerts:", error);
            return [];
        }
    }
};
