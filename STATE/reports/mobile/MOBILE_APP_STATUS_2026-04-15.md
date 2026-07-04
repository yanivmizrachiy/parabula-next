# Mobile app status snapshot

## What already exists

- `preview/mobile-app.html`
- `preview/mobile-app.css`
- `preview/mobile-app.js`
- `preview/mobile-app.webmanifest`
- `preview/mobile-app-install.html`
- `preview/mobile-app-install.js`

## Goal of this app

This is the dedicated mobile app for the worksheet project.
It is meant to show all topics and all worksheet pages from `meta/topics.json`, with fast navigation, preview, open, print, and PDF handoff.

## Important limitation

A home-screen icon cannot be installed silently without browser/system confirmation.
The correct path is a one-button install flow that opens the official install prompt when available, and otherwise guides the user to Add to Home Screen / Install App.

## Remaining rollout step

The new mobile app exists, but the repository still needs final routing cleanup so the dedicated mobile app becomes the primary mobile path instead of leaving two competing entry paths.

## Rule

The dedicated mobile app must stay easy to edit:
- separate HTML
- separate CSS
- separate JS
- topics and pages sourced from `meta/topics.json`
