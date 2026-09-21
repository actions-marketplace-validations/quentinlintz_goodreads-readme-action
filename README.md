# Goodreads README Action

Automatically update your profile README with any of your public [Goodreads](https://goodreads.com) shelves!

## Why

This action is for developers who read a lot (like myself). It uses the RSS feed associated with a Goodreads profile to pull shelf data and replaces _part_ of your profile README automatically. It's currently experimental.

See my [GitHub profile](https://github.com/quentinlintz) for a working example!

## Setup

Start here with this [example](https://github.com/quentinlintz/quentinlintz/blob/main/.github/workflows/rss-workflow.yml) of my `rss-workflow.yml`. Below are just snippets.

- Add HTML-comment markers to your GitHub profile's README.md for replacing.

```markdown
<!-- GOODREADS-LIST:START -->
<!-- GOODREADS-LIST:END -->
```

- Add `quentinlintz/goodreads-readme-action@main` to a workflow in your GitHub profile repo.

```yml
- name: Pull currently reading
  uses: quentinlintz/goodreads-readme-action@main
  with:
    goodreads-user-id: 123 # Replace this
    shelf: currently-reading
    section: GOODREADS-LIST
    sort: date-added
    show-rating: false
    max-books: 5
```

- Add a commit step at the end of your workflow.

```yml
- name: Commit Goodreads shelves
  run: |
    if [ -n "$(git status --porcelain README.md)" ]; then
      git config user.name "goodreads-books-bot"
      git config user.email "goodreads-books-bot@example.com"
      git add README.md
      git commit -m "Render Goodreads shelves"
      git push
    fi
```

- When you've pushed this, run the workflow from the Actions tab and your README will be updated.

## Inputs

Customize this to fit how you want it displayed

### Shelf

`shelf` is the name of your Goodreads shelf to target

### Section

`section` is the HTML-comment name which will be replaced between, like:

```markdown
<!-- GOODREADS-LIST:START -->

- [A Gentleman in Moscow](https://www.goodreads.com/book/show/45695810), Amor Towles ★★★☆☆
- [Great Songwriting Techniques](https://www.goodreads.com/book/show/39704081), Jack Perricone

<!-- GOODREADS-LIST:END -->
```

### Show rating

`show-rating` controls whether the star icons are shown for books you've rated

### Sort

`sort` can be `date-added` or `date-read`

### Max books

`max-books` will limit the number of rendered books from your shelf after sorting

## Behavior

Here's a selection of RSS examples and their rendered output for a visual of how this action should behave. I'm using part of my [Read](https://www.goodreads.com/review/list_rss/160841838?shelf=read) shelf's RSS response as an example here. These are by default sorted by most recently added first (on top).

### Multiple books

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <item>
      <title>A Gentleman in Moscow</title>
      <book_id>45695810</book_id>
      <author_name>Amor Towles</author_name>
      <user_rating>3</user_rating>
      <user_read_at><![CDATA[Tue, 1 Sep 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 06 Sep 2026 14:21:57 -0700]]></user_date_added>
    </item>
    <item>
      <title>Great Songwriting Techniques</title>
      <book_id>39704081</book_id>
      <author_name>Jack Perricone</author_name>
      <user_rating></user_rating>
      <user_read_at><![CDATA[Sun, 30 Aug 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 30 Aug 2026 16:33:46 -0700]]></user_date_added>
    </item>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

- [A Gentleman in Moscow](https://www.goodreads.com/book/show/45695810), Amor Towles ★★★☆☆
- [Great Songwriting Techniques](https://www.goodreads.com/book/show/39704081), Jack Perricone

<!-- GOODREADS-LIST:END -->
```

The stars are omitted if the book does not have a user rating or if the user hasn't enabled it. The default ordering is most-recently added at the top.

### Empty shelf

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

Shelf is empty
<!-- GOODREADS-LIST:END -->
```

### Bad input

If we make a request with an invalid...

- **malformed goodreads id**: fail validation
- **shelf name**: Goodreads substitutes the shelf with your "read" shelf, but we don't detect this and _may pass_ the read shelf through.

Validation and request failure report an error and preserve your README section.

## Credits

Written by Quentin Lintz, by hand. AI produced no parts of this code.

Inspired by [zwacky/goodreads-profile-workflow](https://github.com/zwacky/goodreads-profile-workflow).
