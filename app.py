import os
import logging
from flask import Flask, jsonify, render_template
import feedparser
import requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Feed URL for BigQuery Release Notes
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        # Fetch the feed
        # We use a header to avoid potential user-agent blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(FEED_URL, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse with feedparser
        feed = feedparser.parse(response.content)
        
        notes = []
        for entry in feed.entries:
            # Extract basic fields safely
            title = entry.get("title", "No Title")
            link = entry.get("link", "")
            updated = entry.get("updated", entry.get("published", ""))
            
            # Content or summary
            content = ""
            if "content" in entry:
                content = entry.content[0].value
            elif "summary" in entry:
                content = entry.summary
            
            notes.append({
                "id": entry.get("id", link),
                "title": title,
                "link": link,
                "updated": updated,
                "content": content
            })

        return jsonify({
            "status": "success",
            "feed_title": feed.feed.get("title", "BigQuery Release Notes"),
            "notes": notes
        })
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error fetching BigQuery feed: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to fetch release notes from Google Cloud feed due to a network error. Please try again."
        }), 502
    except Exception as e:
        logger.error(f"Error parsing BigQuery feed: {e}")
        return jsonify({
            "status": "error",
            "message": "An error occurred while parsing the release notes feed."
        }), 500

if __name__ == "__main__":
    # Bind to all interfaces for local development testing
    app.run(host="127.0.0.1", port=5000, debug=True)
