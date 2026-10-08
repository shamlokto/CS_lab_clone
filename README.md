# Sham Lab website

Website of the Bacterial Cell Envelope and Antibiotic Development (BCEAD) Laboratory, led by Chris Sham in the Department of Microbiology and Immunology, National University of Singapore.

The site is built with [Jekyll](https://jekyllrb.com/), which GitHub Pages runs automatically. **Most updates are edits to a single text file and need no HTML.** Commit the change on GitHub and the site rebuilds in a minute or two.

## Common updates

| To change… | Edit |
|---|---|
| A lab member (add, edit, move to alumni) | `_people/<name>.md` |
| Publications | `_data/publications.yml` |
| News | `_data/news.yml` |
| Gallery photos | `_data/gallery.yml` + images in `assets/img/gallery/` |
| Research themes and highlighted papers | `_data/research.yml` |
| Tools, data and teaching links | `_data/resources.yml` |
| Open positions | `_data/positions.yml` |
| Undergraduate trainees | `_data/trainees.yml` |
| Email, address, Scholar link | `_config.yml` |

### Add a lab member

1. Make a web-sized photo: `python3 scripts/optimize_images.py person photo.jpg jane-tan`
2. Create `_people/jane-tan.md`:

   ```yaml
   ---
   name: "Jane Tan"
   role: "Graduate Student"
   group: "grad"            # pi, postdoc, staff, grad, undergrad or alumni
   order: 12                # position within the group on the People page
   photo: "/assets/img/people/jane-tan.webp"
   email: "jane@u.nus.edu"
   education: ["B.Sc., Life Sciences, National University of Singapore"]
   interests: ["One or more paragraphs. Use <i>Streptococcus pneumoniae</i> for italics."]
   ---
   ```

The profile page appears at `/people/jane-tan/`. Until you have a photo and details, leave out `photo` and add `placeholder: true`: the card shows the person's initials and the profile says "Profile coming soon".

### Move someone to alumni

In their `_people/*.md` file, set `group: "alumni"` and add `years: "2021–2025"`.

### Add a paper

Add an entry to the top of `lab:` in `_data/publications.yml`. Topics drive the filters on the Publications page. Set `featured: true` to show it on the home page (keep about three featured). Add new lab members' names to `lab_authors` so they appear in bold.

## Run locally (optional)

```bash
bundle install
bundle exec jekyll serve      # http://localhost:4000
```

## Checks

`.github/workflows/check-site.yml` builds the site with the same builder GitHub Pages uses and runs `scripts/check_links.py` to catch broken internal links and missing images on every pull request.

## Design

The palette follows the [Dual Tn-seq Explorer](https://github.com/shamlokto/dual-tnseq-explorer): slate and navy with a teal accent and orange for contrast. Typography follows [Fundamentals](https://github.com/shamlokto/fundamentals): Young Serif for headings, IBM Plex Sans for text and IBM Plex Mono for labels. The home page hero draws an illustrative circular Tn-seq insertion map (ticks are insertions, gaps are essential genes, chords are genetic interactions). Light and dark themes follow the visitor's system setting, and the header button switches between them.

Styles are in `assets/css/site.css` and scripts in `assets/js/site.js`. There are no frameworks or build steps beyond Jekyll.

## Legacy files

The previous NUS-template site (root `individual-profile-*.html`, `html/`, `individualpage/`, `archieve/`, Bootstrap and Font Awesome copies, and the original full-size images) is still in the repository but is excluded from the build in `_config.yml`. Old URLs such as `individual-profile-cs.html`, `publication.html` and `alumni.html` redirect to the new pages. These files can be deleted once the new site is confirmed.
