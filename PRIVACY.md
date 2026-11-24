# Privacy

Browser starter has no server, no account and no analytics. Your configuration is stored locally in the browser (`chrome.storage.local`).

The extension requests access to all sites (`<all_urls>`) only to:

- download the RSS/Atom feeds you configure,
- detect the favicon of the links you add.

On Chromium-based browsers, the `tabs` permission is used only to detect Vivaldi's built-in start page and redirect it to this extension. Tab URLs are never stored or sent anywhere.

Other network requests:

- Weather blocks query [Open-Meteo](https://open-meteo.com/) with the coordinates of the city you chose.
- Searches are sent to the search engine you pick, exactly as if you typed them there.

The `search` permission is used only to run a search with the default search engine of your browser (`chrome.search` API) when the "Browser default" engine is selected. 
The extension never reads or changes your browser's search settings, and the terms you search for are not stored or sent anywhere else.