# Editing the website content

Everything a guest reads on the site lives in this folder. You don't need to touch any code.

1. Open a file and change the text between the quotes.
2. Save the file.
3. Publish the site (or run `pnpm dev` to preview it on your computer).

If something is wrong (a missing comma, a photo that doesn't exist, a chat question pointing nowhere),
the site **refuses to publish** and names the file and the line to fix. You can't break the live site by mistake.

> **JSON tips:** keep the quotes `"…"`, put a comma between items (but not after the last one),
> and don't delete brackets. An editor like VS Code highlights mistakes in red.

| File | What it controls |
| --- | --- |
| `site.json` | Name, WhatsApp number, phone, email, address, map link, check-in/out times, drive times, Google rating, highlights row |
| `rooms.json` | Each room: name, short lines, price, guests, bed, photos, amenities, what's included, rules |
| `home.json` | Home page hero, experiences, packages, reviews and the photo strip |
| `gallery.json` | Gallery photos, their captions and filter categories |
| `chat-faq.json` | **The chat assistant (Dia) and the FAQ on the Contact page** |
| `enquiry.json` | The enquiry form's options (stay types, budget ranges, messages) |
| `policies.json` | Cancellation, house rules and privacy pages |

---

## The chat assistant: `chat-faq.json`

Guests never type in the chat. They tap a question, read the answer, and then see follow-up
questions and action buttons. Every question is a **topic**:

```json
{
  "id": "day-picnic",
  "question": "Day picnic",
  "faq": "Do you offer day picnics?",
  "answer": "Yes. 10 AM to 6 PM with pool, lunch and games. ₹X,XXX per person.",
  "next": ["picnic-group"],
  "actions": ["enquire", "whatsapp"]
}
```

| Field | Required | What it does |
| --- | --- | --- |
| `id` | yes | A short unique name with lowercase letters and dashes. Other topics use it to link here. |
| `question` | yes | The text on the button the guest taps. Keep it short (1–4 words). |
| `answer` | yes | What Dia replies. One or two sentences. |
| `faq` | no | If present, this question **also appears in the FAQ** on the Contact page, using the same answer. |
| `next` | no | Follow-up questions to show after the answer (a list of other topics' `id`s). |
| `actions` | no | Buttons to show after the answer (see below). |

**Actions you can use:**

- `"enquire"` opens the step-by-step enquiry form.
- `"whatsapp"` opens WhatsApp with "I was chatting on your website about …" typed in.
- `"call"` calls the resort.
- `"directions"` opens Google Maps.
- `{ "label": "See the Pool Villa", "href": "/rooms/pool-villa" }` links to any page of the site.

**The first questions** the guest sees are listed in `startTopics` at the top of the file.
**To add a question:**

1. Copy an existing topic block and give it a new `id`.
2. Add that `id` to `startTopics` (so it shows first) or to another topic's `next` (so it shows as a follow-up).

The bot's name, greeting and the line above the WhatsApp button are in the `bot` section.

---

## Photos

1. Put the original photo in the `photos/` folder at the project root, named simply,
   e.g. `pool-villa.jpg` or `monsoon-lawn.jpg`.
2. Run `pnpm images`. This resizes the photo, removes location data and gets it ready for the site.
3. Use the name without `.jpg` in any content file, e.g. `"image": "monsoon-lawn"`.

A real photo with the same name as a placeholder (e.g. `pool.jpg`) replaces it everywhere.
Photos should be at least 2000 px wide; landscape works best for heroes and rooms.

## Icons

Wherever a file says `"icon": "…"`, use one of these names:

`ac` `balcony` `basket` `bath` `bed` `bell` `board` `car` `coffee` `flame` `food` `fridge` `game` `gift`
`heart` `help` `home` `leaf` `login` `logout` `mountain` `noSmoking` `parking` `paw` `pool` `shower`
`size` `sun` `train` `trees` `tv` `users` `van` `wifi`

Need another one? A developer can add it in `components/icons.tsx` from https://lucide.dev.

## Prices

In `rooms.json`, set `"priceFrom": 7500` (a plain number, no ₹ or commas) to show "from ₹7,500".
While it is `null` the site shows the placeholder from `site.json` → `priceFromLabel`.
