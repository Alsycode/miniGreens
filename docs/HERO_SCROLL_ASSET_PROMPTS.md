# MiniGreens Hero — "Bloom" Scroll Animation

Art direction + generation prompts for the scroll-scrubbed canvas hero on the website
([Hero.tsx](../website/components/Hero.tsx)). Video is generated once, then decomposed into a frame
sequence and scrubbed against scroll position.

---

## The idea

The hero is the **infusion moment**, in extreme macro: clear hot water with dry microgreen tea
leaves on the surface, and as you scroll, the leaves sink, unfurl, and bleed chlorophyll green
through the water until the glass is glowing.

Scroll *is* the brew. Scroll down and the tea steeps; scroll back up and it un-steeps. Every scroll
position is a legible state, which is the thing that makes a scroll-scrub worth building instead of
an autoplaying video.

It also argues the product. The whole brand claim is *real greens in the cup* — this is that claim
made literally visible, and the headline "Real Greens. A Brighter Brew." lands on a frame that has
gone from near-black to luminous green.

**Why this won't come out as slop:** one locked camera, one vessel, one continuous physical event
that really happens in a real glass (dried leaves float, saturate, sink, and release colour — this is
observed behaviour, not an invented effect). There is no scene change for the model to hallucinate
across, no floating-in-a-void product pose, and no second subject to get confused about.

---

## Art direction

**Light — one source, subtractive.**
A single hard-edged backlight, low and behind the glass, raking *through* the liquid so the tea
becomes the brightest object in the frame. Black negative fill on both sides, so the glass reads as
two thin vertical rim highlights instead of broad soft reflections. This is how drink photographers
actually shoot glass — you light the liquid, not the glass — and it is the direct opposite of the
flat, evenly-lit look that reads as AI.

**Camera.**
100mm macro, f/4, locked tripod, positioned *at the waterline* so the surface of the liquid cuts a
razor-thin horizontal edge across frame and you see into the glass. Slow-motion capture feel.

**Colour.**
Chlorophyll green is **yellow-green and slightly olive**, never teal or emerald — getting this wrong
is the single fastest way to make tea look fake. Near-black ground (#05100a family), cream-white
speculars only (#f3efe4), infusion resolving toward sage (#a8c97a).

**Texture — the anti-slop details.**
Micro-bubbles clinging to the inside of the glass below the waterline. Suspended particulate
catching the backlight like dust in a sunbeam. A visible meniscus where water meets glass. Faint
turbidity in the finished infusion. These imperfections are what make it read as a photograph.

**Composition.**
Glass just right of centre, waterline on the lower third, large dark negative space upper-left for
the headline. Keeping the glass inside the middle 60% of frame means a mobile centre-crop still
holds it.

**Motion arc (maps 1:1 to scroll progress).**

| Scroll | State |
|---|---|
| 0% | Clear colourless water, dry curled leaves resting on the surface, frame dim |
| 25% | Leaves darken and soften; first tendril of green bleeds downward like ink |
| 50% | Leaves sink and begin to open; tendrils multiply and drift; liquid takes colour |
| 75% | Green diffuses through most of the volume; leaves suspended, fully unfurled |
| 100% | Uniform luminous chlorophyll green, backlight blooming through — brightest frame |

---

## 1. Start frame prompt

```
Extreme macro product photograph, 100mm macro lens at f/4, camera locked on a tripod at exactly
the waterline so the surface of the liquid cuts a razor-thin horizontal edge across the frame.

Subject: a heavy plain borosilicate glass tumbler filled with clear, just-boiled water, standing
on a dark weathered basalt slab. A small cluster of dry, tightly curled microgreen tea leaves
rests on the water's surface, still crisp and dry at the edges, not yet sunk. The water is
completely clear and colourless.

Light: one hard-edged backlight, low and behind the glass, raking through the water so the liquid
is the brightest thing in frame. Black negative fill on both sides leaves only two thin vertical
rim highlights down the edges of the glass. The slab and the background fall away into near-black,
with only faint texture surviving in the shadows.

Detail: tiny air bubbles clinging to the inside of the glass below the waterline, fine suspended
particulate catching the backlight like dust in a sunbeam, a visible meniscus curve where the
water meets the glass. Faint steam, barely readable against the dark.

Composition: the glass sits just right of centre, its waterline on the lower third, with large
empty dark space filling the upper left of the frame. 16:9.

Colour: near-black ground, colourless water, warm cream-white speculars only. No green in the
liquid yet.
```

## 2. End frame prompt

```
Identical shot to the previous image — same glass, same basalt slab, same locked 100mm f/4
framing, same single hard backlight low and behind, same two thin rim highlights, same
composition with the glass just right of centre and dark empty space upper left. The water sits
at exactly the same height. Nothing about the camera or the lighting has changed.

The only change is the infusion. The water is now a luminous, slightly turbid yellow-green —
chlorophyll green, warm and olive-leaning, never teal or emerald — lit through from behind so the
liquid glows as the brightest element in frame. The microgreen leaves have fully opened and sunk:
several rest low in the glass, two or three hang suspended mid-water, unfurled flat with their
veins backlit. Fine green sediment drifts through the lower half. The steam is slightly more
visible now against the brighter liquid.
```

## 3. Video prompt

```
One continuous shot. The camera stays completely locked off — no pan, tilt, zoom or drift at any
point. The glass, the basalt slab, the backlight and the water level all stay exactly where they
are for the whole clip.

The infusion happens in slow motion. The dry curled leaves resting on the surface soften and
darken as they take on water, then begin to sink one at a time, turning slowly as they descend. As
each leaf sinks it releases a fine tendril of yellow-green colour that bleeds downward through the
clear water like ink in slow motion, curling and spreading in soft ribbons rather than mixing
instantly. The tendrils multiply and drift until the whole volume of water has turned a luminous,
slightly turbid chlorophyll green. The leaves open fully as they saturate, unfurling into flat
backlit shapes with visible veins, some settling at the bottom and some staying suspended
mid-water. The backlight blooms brighter through the liquid as the colour deepens, so the glass
becomes the brightest thing in frame by the end. Tiny bubbles stay clinging to the inside of the
glass. Faint steam drifts upward throughout, becoming slightly easier to see against the brighter
liquid.

The water line stays at exactly the same height from the first frame to the last. Light direction,
hardness and colour temperature stay identical throughout. Slow, weighted, underwater motion — the
pace of real liquid, with no sudden bursts.

Silent, ambient room tone only, no music, no dialogue.
```

## Negative prompt

```
camera movement, zoom, pan, jump cut, scene change, teal water, emerald water, blue liquid,
water level rising, pouring stream, splashing, hands, spoon, text, watermark, logo, extra glass,
warped glass, flat even lighting, bright background, low quality, blur
```

---

## Generation settings

- **Mode:** Frames to Video (start + end frame). The two frames share camera, light, surface and
  water level — only the liquid's colour and the leaves' position change, so there is no shot-switch
  risk, but the difference is unmistakable across the whole liquid volume (which is what the earlier
  35°-rotation attempt failed to deliver).
- **Model:** Veo 3.1 – Quality. **Aspect:** 16:9. **Length:** 8s.
- Generate 3–4 takes and pick on: does the colour stay yellow-green, does the water level hold, do
  the leaves unfurl rather than morph.

## Frame extraction (later)

```bash
ffmpeg -i bloom.mp4 -vf "fps=15,scale=1600:-1" -q:v 3 frames/bloom-%03d.jpg
```

~120 frames at 1600px. Convert to WebP for weight. Draw to `<canvas>`, pin the hero for ~150vh, map
scroll progress to frame index. Headline stays fixed in the upper-left dead space through the whole
scrub — it does not fade — so the liquid brightening behind it is what carries the motion.
