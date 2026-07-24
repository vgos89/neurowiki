# CT head — teaching image manifest

Tracks the figures for the "Read the Scan · CT head" module. Two tracks:

- **Schematic** (NeuroWiki original line-art, `public/imaging/schematics/`): ships in v1,
  no licensing. License = `original`.
- **Photo** (real CT examples, Wikimedia Commons): sourced + license-checked here.
  The binaries could not be downloaded in the authoring environment (Wikimedia egress
  blocked), so photo `TeachingImage` entries ship with `status: 'pending'` and render as
  a labelled placeholder until the asset is dropped into `public/imaging/photos/`.

## Licensing rule (recap)
- Radiopaedia: **excluded entirely** (CC BY-NC-SA + terms bar building teaching content
  from many cases). Not used.
- Wikimedia CC-BY / CC-BY-SA / CC0 / public-domain: **allowed** with a rendered credit
  line. Share-alike only bites if we *modify* the image; v1 uses photos unmodified.
  If a photo is later cropped/annotated, set `modifications` and keep the SA license.
- Every photo entry carries `sourceUrl` (Commons file page) so the author byline can be
  confirmed at drop-in time.

## Schematic figures (v1, authored)
| id | file | teaches |
|---|---|---|
| `sch-hematoma-shapes` | `/imaging/schematics/hematoma-shapes.svg` | epidural (biconvex) vs subdural (crescent) vs the skull/suture relationship |
| `sch-windowing` | `/imaging/schematics/windowing.svg` | how window width/level reveal different tissue; brain vs bone vs stroke vs subdural |
| `sch-basal-cisterns` | `/imaging/schematics/basal-cisterns.svg` | location of the key basal cisterns on an axial section |
| `sch-ventricles` | `/imaging/schematics/ventricles.svg` | the ventricular system map |

## Photo candidates (Wikimedia — verify byline at drop-in)
Licenses below are from Commons search metadata; confirm the exact author string from the
`sourceUrl` file page before the binary lands (WebFetch of Commons file pages was blocked
in this session).

| step | Commons file | license (per Commons) | sourceUrl |
|---|---|---|---|
| Blood — epidural | `File:EpiduralHematoma.jpg` | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:EpiduralHematoma.jpg |
| Blood — subdural | `File:Ct-scan of the brain with an subdural hematoma.jpg` | verify (CC BY-SA or PD) | https://commons.wikimedia.org/wiki/File:Ct-scan_of_the_brain_with_an_subdural_hematoma.jpg |
| Blood — SAH | `File:CT of subarachnoid hemorrhage.png` | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png |
| Blood — ICH | `File:Intracerebral hemorrage (CT scan).jpg` | verify | https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg |
| Brain — normal reference | `File:Computed tomography of human brain - large.png` | verify (CC BY-SA family) | https://commons.wikimedia.org/wiki/File:Computed_tomography_of_human_brain_-_large.png |
| Brain — MCA infarct | (none confirmed on Commons; search `Category:CT images of cerebral infarction`) | verify | https://commons.wikimedia.org/wiki/Category:CT_of_cerebral_infarction |
| Bone — skull fracture | (search `Category:CT images of skull fractures`) | verify | https://commons.wikimedia.org/wiki/Category:CT_of_skull_fractures |

## Drop-in procedure (later session with Wikimedia egress, or user-supplied)
1. Download the full-res file from `sourceUrl` into `public/imaging/photos/<id>.<ext>`.
2. Confirm the exact author byline on the Commons page; update the `attribution` string
   (no em-dash character) and `author` field in the `TeachingImage` entry.
3. Flip `status: 'pending'` to `status: 'ready'` (or remove `status`).
4. Re-run `npm run check:humanizer` (caption/attribution scanned) and rebuild.
