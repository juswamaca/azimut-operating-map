# Singapore Operating Map (live)

The interactive operating map for Azimut Investment Management Singapore, hosted on GitHub Pages and kept in sync with the master Google Sheet.

## How it stays in sync

Every time someone opens the page, it reads the master sheet's **1 Operating Map** tab through its "Publish to web" link and builds the map from it. Google refreshes the published copy within about 5 minutes of an edit, so changes show up on the next refresh after that.

If the sheet can't be reached or is slow to answer, the page shows the saved copy in `data/snapshot.json` and says so at the bottom. A GitHub Action refreshes that copy from the sheet every night. As a bonus, the repo keeps a dated history of every change to the map.

## Set it up (about 15 minutes, once)

1. **Publish the tab.** Open the master sheet and go to **File > Share > Publish to web**. Under **Link**, choose the **1 Operating Map** tab and **Comma-separated values (.csv)**, click **Publish**, and copy the link. Under "Published content and settings", keep **Automatically republish when changes are made** ticked.
2. **Create the repo.** On GitHub, click **New repository**, name it `azimut-operating-map`, choose **Public** and click **Create repository**. Click **uploading an existing file**, drag in everything from this folder, and click **Commit changes**.
3. **Paste the link.** In the repo, open `config.js` and click the pencil. Paste the link between the quotes after `csvUrl:`, then click **Commit changes**.
4. **Turn on the site.** Go to **Settings > Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, then Branch to **main** and **/ (root)**, and click **Save**. After a minute or two the site is live at `https://<your-account>.github.io/azimut-operating-map/`.
5. **Turn on the nightly saved copy.** On a Mac, Finder hides folders whose names start with a dot, so `.github` may not have uploaded. If it is missing, click **Add file > Create new file**, name it `.github/workflows/refresh-snapshot.yml`, paste in that file's contents and commit. Then open the **Actions** tab, choose **Refresh saved copy** and click **Run workflow**. A green tick means it works.

**Check it worked:** open the site, go to the Compass map and scroll to the bottom. It should say "read live when this page opened" with the time. If it says "saved copy" instead, the About tab's sync notes say why.

## Editing the sheet

- **Edit as usual**, then refresh the page after a few minutes.
- **Rows can move.** The map finds each row by its label in column B (Function, Workflow, Workflow ID, Main Role, Step 1 and so on). Keep those labels as they are.
- **Write steps as** `Role: action -> next role`, for example `ARM: Checks the documents -> Compliance`. A handoff is counted when the next step is done by a different party.
- **A new workflow** is a new column. It shows in the before view straight away. In the after view it sits under "Other workflows" in the team for its function. To choose its team, add a row labelled `Outcome team` in column B and type the team name in that workflow's column: Advise and invest, Onboard and look after clients, Protect the firm, Get paid and pay out, or Close and report. The About tab lists any workflow placed this way.

## What lives where

| File | What it holds | Change it when |
|---|---|---|
| `config.js` | The sheet link and settings | The sheet or its link changes |
| `design.js` | The target design: outcome teams, the 15 Azi-bots, target workflows | The target design changes |
| `build.js` | Reads the sheet into the map's data (the same code as the Apps Script version) | Rarely |
| `index.html`, `app.js` | The page | Its look or wording changes |
| `data/snapshot.json` | The saved copy | Never by hand: the nightly job updates it |

## Good to know

- **Who can see it.** "Publish to web" lets anyone with the CSV link read that tab, and the link sits in `config.js`, which is public. A GitHub Pages site on a free account is public too, though the page asks search engines not to list it. Anyone who has the link sees what the map already shows, but check that Azimut is comfortable with a public link. If it must stay Azimut-only, use the Apps Script version instead.
- **Handover.** Before the project ends, move the sheet and the repo to Azimut-owned accounts. For the repo, use **Settings > Transfer ownership**. Then publish the sheet again from the new owner and update `config.js`.
- **Tested** against a copy of the V4 master: it produces exactly the data in today's map. It was also tested with a new workflow, a sheet link that fails, a link to the wrong kind of page and a slow answer. In each failure case the page fell back to the saved copy.

---
The Human-AI Enterprise · an NUS MBA consulting project with Azimut Investment Management Singapore · Hung Wan Yu · Apoorva Kushwaha · Joshua Macapugay
