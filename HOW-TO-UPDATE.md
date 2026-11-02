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
| `duration` | `5`, `2.5` or `null` | Hours. `null` = no time shown anywhere |
| `rating`, `reviews` | `5`, `3291` | |
| `bookingUrl` | `"https://tstgroup.rezdy.com/564607/..."` | Where Book Now goes |
| `summary` | short text | Shown on tour cards and at the top of the tour page |
| `highlights` | `["...", "..."]` | One line per bullet point |
| `description` | simple HTML | `<p>`, `<h3>`, `<h4>`, `<ul><li>`, `<strong>`, `<a href="...">` |
| `topTour` | `true` / `false` | `true` = shown under "Top Tours" |
| `categories` | `["paris-walking-tours"]` | Slugs from `categories.json`. The first one is the main category |
| `destination` | `"paris"` | `paris`, `south-of-france` or `galeries-lafayette` |
| `relatedTours` | `["see-10-paris-sights-fun-local-guide"]` | The `slug` of other tours. Up to 4 are shown |
| `slug` | `"see-30-paris-sights-fun-local-guide"` | The web address `/tour/<slug>`. Only a-z, 0-9 and `-`. Changing it breaks old links |
| `demo` | `true` / `false` | `true` = sample tour |

## Change photos

The `images` list of a tour, first photo = main photo:

```json
"images": [
  "/tours/photos/my-main-photo.jpg",
  "/tours/photos/second.jpg",
  "https://example.com/a-photo-on-the-web.jpg"
]
```

- **Replace a photo:** put the new file in `public/tours/photos/` and change its line. Or overwrite the file, keeping the same name.
- **Add a photo:** copy it into `public/tours/photos/` and add a line.
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

## Photos still missing from WordPress

These 4 photos could not be downloaded (the file names contain "©"). Add them from the drive
to `public/tours/photos/` and list them in the tour's `images`:

- `©Thibaut-Voisin-0178-1-scaled.jpg`
- `Medium-©Thibaut-Voisin-0178-1.jpg`
- `Medium-©Thibaut-Voisin-0178.jpg.jpg`
- `Coupole-2-Galeries-Lafayette-Haussmann-©CarolineRichard-scaled.jpg`
