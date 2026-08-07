# MADRID NOW Feed

This folder powers the server-side news feed for **MADRID NOW by ARAMPRO**.

- Runs automatically every 5 minutes with GitHub Actions
- Accepts only configured trusted publishers
- Preserves the last successful feed when a source is temporarily unavailable
- Publishes the generated data in `news.json`

Configured sources: Real Madrid, LaLiga, UEFA, Reuters, and Fabrizio Romano.
