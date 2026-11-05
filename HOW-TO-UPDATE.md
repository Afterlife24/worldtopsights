# How to update the website

All content is in 3 files in `src/content/`. You never need to edit code.

| File | What it holds |
|---|---|
| `tours.json` | Every tour: text, prices, photos, booking link, related tours |
| `categories.json` | The tour categories: name, text, photos |
| `site-images.json` | Home page, destination and review photos |

After saving, the local preview (`npm run dev`) updates by itself. The live site
updates the next time it is built and deployed.

## Change a tour

Open `src/content/tours.json`, find the tour with Cmd+F (search its title), and edit:

| Field | Example | Notes |
|---|---|---|
| `title` | `"See 30+ Paris Sights – Fun Local Guide"` | |
| `price` | `50` | Adult price in €, a number with no quotes |
| `priceNote` | `"159 per person for groups of 8."` or `null` | Replaces "per adult" |
| `childPrice` | `"Free"`, `14` or `null` | `null` hides it |
| `youthPrice` | `15` or `null` | Youth / teenager price. `null` hides it |
| `startTimes` | `"09:30, 10:00, 11:00"` or `null` | Shown in the booking box |
| `duration` | `5`, `2.5` or `null` | Hours. `null` = no time shown anywhere |
| `rating`, `reviews` | `4.9`, `320` or `null` | `null` hides the stars and the Reviews section |
| `bookingUrl` | `"https://tstgroup.rezdy.com/564607/..."` | Where Book Now goes |
| `summary` | short text | Shown on tour cards and at the top of the tour page |
| `highlights` | `["...", "..."]` | One line per bullet point |
| `description` | simple HTML | `<p>`, `<h3>`, `<h4>`, `<ul><li>`, `<strong>`, `<a href="...">` |
| `topTour` | `true` / `false` | `true` = shown under "Top Tours" |
| `categories` | `["paris-walking-tours"]` | Slugs from `categories.json`. The first one is the main category |
| `destination` | `"paris"` | `paris`, `south-of-france` or `galeries-lafayette`. The main one, used in the breadcrumb |
| `alsoIn` | `["galeries-lafayette"]` | Also list the tour on these destination pages |
| `relatedTours` | `["see-10-paris-sights-fun-local-guide"]` | The `slug` of other tours. Up to 4 are shown |
| `slug` | `"see-30-paris-sights-fun-local-guide"` | The web address `/tour/<slug>`. Only a-z, 0-9 and `-`. Changing it breaks old links |
| `demo` | `true` / `false` | `true` = sample tour |

## Change photos

The `images` list of a tour, first photo = main photo:

```json
"images": [
  "/tours/<slug>/01.jpg",
  "/tours/<slug>/02.jpg",
  "https://example.com/a-photo-on-the-web.jpg"
]
```

- **Replace a photo:** put the new file in the tour's folder `public/tours/<slug>/` and change its line. Or overwrite the file, keeping the same name.
- **Add a photo:** copy it into `public/tours/<slug>/` and add a line.
- **Remove a photo:** delete its line.
- **Reorder:** move the lines.
- Use file names with no spaces or special characters (`©`, `é`). Keep photos under about 500 KB, 1400 px wide.

Page photos (home, destinations, categories) work the same way, in `site-images.json` and `categories.json`.
Local files for those go in `public/site-images/` and are written as `"/site-images/file.jpg"`.

## Add or remove a tour

- **Add:** copy a whole tour block `{ ... }`, paste it after a `},`, and change `slug`, `title` and the rest. The slug must be new.
- **Remove:** delete the whole block, and remove its slug from other tours' `relatedTours`.

## If something is wrong

JSON is strict: text in double quotes, commas between items, no comma after the last item.
If the file has a mistake, the local preview shows a message naming the tour and the field,
for example `tours.json, tour 12 ("..."): related tour "abc" does not exist`.

## Importing tours from the Google Drive folders

`scripts/import-drive-tours.py` builds the tours of one destination from its Drive folders (one folder per tour: a `.docx` and photos):

    python3 scripts/import-drive-tours.py paris ../paris-tours-drive/tours
    python3 scripts/import-drive-tours.py galeries-lafayette ../galeries-lafayette-drive/tours

- It replaces that destination's tours (including demo tours) and keeps the other destinations.
- Hand edits to that destination's tours in `tours.json` are lost when you re-run it.
- A tour that is already on the site under another destination (same Rezdy product) is not copied: it is added to that destination with `alsoIn`.
- Galeries Lafayette tours also get the "Galeries Lafayette" category.
- Main photo: a file named `main`, then `cover`, then one starting with `m`, else the first photo.
- Skipped: folders with no document, no Rezdy link, no price, marked "Inactive", or repeating another folder's Rezdy product.
- If you re-run the Paris import, re-run the Galeries Lafayette import afterwards so the shared tours are linked again.
