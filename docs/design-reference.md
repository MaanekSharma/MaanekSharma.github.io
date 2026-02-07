# Design reference

## Status
- Screenshot capture failed because the browser automation tool could not reach the local dev server (returned a 404 page). Capture will need to be rerun when the browser tool can access `http://127.0.0.1:<port>`.

## UI tokens

### Palette
- Primary: #cf1767 (accent links, primary hover). 
- Secondary: #000000 (base background, headings, primary button background).
- Neutral light: #ffffff (body text on dark backgrounds).
- Neutral mid: #d3d3d3 / #c3c3c3 (button fill + hover).
- Neutral muted: #7e7e7e / #8c8c8c (secondary text).

### Typography
- Heading font: "Frank Ruhl Libre", serif; weight 500 for h1–h6.
- Body font: "Lora", serif; weight normal/300 for lead copy.
- Button font: "Roboto", sans-serif; weight 700 with uppercase and wide letter spacing.
- Size scale: body 1.7rem; h1 3.6rem; h2 3rem; h3 2.4rem; h4 2.1rem; h5 1.8rem; h6 1.6rem; lead paragraph 2.4rem.

### Button styles
- Base button: 6rem height, 5.6rem line-height, 3.2rem horizontal padding, 0.2rem border, uppercase text with 0.5rem letter spacing.
- Default button: light gray background (#d3d3d3) with darker hover (#c3c3c3), black text.
- Primary button: black background with white text; hover shifts to accent (#cf1767).
- Modifiers: full-width, medium/large height variants, stroke (transparent with black border), pill radius.

### Spacing scale (observed)
- Small: 0.4rem, 0.8rem, 1.2rem.
- Medium: 1.6rem, 3.2rem, 3.6rem.
- Large: 4.8rem, 6rem, 6.8rem.

## Section order
1. Global header / navigation.
2. Intro (hero) section.
3. About section.
4. Projects section.
5. Contact section (acts as the page footer).
