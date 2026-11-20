---
name: medrush-consumer-health-system
source: "image:https://cdn.dribbble.com/userupload/47084187/file/7f1ce6c613d744ba769db5d55bef33cf.png"
character: "The public application uses a precise monochrome product stage inspired by the supplied reference: a full white viewport, floating pill navigation, concentric orbital lines, functional icon nodes, and layered live status cards. Medrush emergency red remains reserved for the SOS action, while a restrained electric blue marks the response network."
tokens: "Real values live in app/globals.css. Read them there and never duplicate them here."
contrast: "body on canvas 7.41:1, ink on canvas 12.90:1, muted on canvas 4.66:1, white on accent 6.38:1, control border on surface 3.31:1, white on emergency 6.53:1"
---

## Build mandate

Every page should feel like a complete healthcare product surface. Brand, context, one clear next action, honest status language, recovery states, and useful supporting content belong in the composition. Avoid empty form pages, decorative dashboards, and controls that do not lead anywhere.

## Character and direction

Use a cool pale canvas, white working surfaces, deep teal for normal actions, and deep red only for emergency or destructive actions. Typography is clear and friendly rather than institutional. Functional visuals such as maps, status marks, and icons replace decorative photography.

Public screens should reduce anxiety through plain language, generous spacing, and visible privacy or service limitations. Staff screens may carry more information, but urgent items should remain visually distinct from routine operations.

## Composition patterns

The public landing page is one full focused viewport. It uses a centered two line message, compact actions, orbital service nodes, a layered status stack, and a proof strip anchored at the bottom. Forms use the same minimal monochrome shell and pair the working surface with concise context so they never float alone on an empty canvas.

Staff pages use a stable shell with role navigation, a page header, action or status summary, and one primary work surface. Data tables become record lists or focused detail views on smaller screens.

## Component and usage rules

Use semantic tokens and shared primitives from `components/ui/`. Use borders and spacing before shadows. Reserve shadows for overlays and floating menus.

Normal primary actions use teal. SOS and destructive actions use red. Status colors communicate state only. Cards use fourteen pixel corners, controls use ten pixel corners, and compact status labels may use full pills.

Dialogs are for short decisions or confirmations. Any destination users may revisit should be a route. Do not create a second button, field, badge, notice, or page header system inside a feature folder.

## Responsive and accessibility direction

Citizen and responder surfaces start at 320 pixels and prioritize thumb reach. Dispatch, hospital, and administration surfaces prioritize desktop density but retain a meaningful mobile record layout.

All controls have at least a 44 pixel target, visible keyboard focus, associated labels, and WCAG AA contrast. Motion communicates feedback only, uses opacity or transform, and stops under reduced motion preferences. Core emergency content must remain usable when a map or remote service fails to load.
